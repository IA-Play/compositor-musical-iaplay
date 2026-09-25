"""
IAPLAY Studio - Servidor Local Dedicado YuE2 (Música Neural)
Permite ao IAPLAY gerar músicas diretamente sem necessidade de abrir ou ativar o Maestro.
Utiliza os pesos baixados em ckpts ou do Maestro e fornece download direto de modelos e áudios.
"""

import os
import sys

if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

import re
import shutil
import time
import json
import uuid
import threading
import traceback
from datetime import datetime
from typing import Optional, Dict, Any, List

import torch
import soundfile as sf
import uvicorn
from fastapi import FastAPI, HTTPException, Request, BackgroundTasks, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse

# Diretórios locais do IAPLAY
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CKPTS_DIR = os.path.join(ROOT_DIR, "ckpts")
OUTPUTS_DIR = os.path.join(ROOT_DIR, "outputs")
UPLOADS_DIR = os.path.join(ROOT_DIR, "uploads")
os.makedirs(CKPTS_DIR, exist_ok=True)
os.makedirs(OUTPUTS_DIR, exist_ok=True)
os.makedirs(UPLOADS_DIR, exist_ok=True)

def ensure_engine_ckpts_and_config():
    """Garante que a pasta engine/ckpts seja um link para ckpts e que qwen_vae_config.json exista."""
    qwen_cfg = os.path.join(CKPTS_DIR, "qwen_vae_config.json")
    if not os.path.isfile(qwen_cfg):
        try:
            cfg_data = {
                "_class_name": "AutoencoderKLQwenImage",
                "_diffusers_version": "0.34.0.dev0",
                "attn_scales": [], "base_dim": 96, "dim_mult": [1, 2, 4, 4], "dropout": 0.0,
                "latents_mean": [-0.7571, -0.7089, -0.9113, 0.1075, -0.1745, 0.9653, -0.1517, 1.5508, 0.4134, -0.0715, 0.5517, -0.3632, -0.1922, -0.9497, 0.2503, -0.2921],
                "latents_std": [2.8184, 1.4541, 2.3275, 2.6558, 1.2196, 1.7708, 2.6052, 2.0743, 3.2687, 2.1526, 2.8652, 1.5579, 1.6382, 1.1253, 2.8251, 1.916],
                "num_res_blocks": 2, "temperal_downsample": [False, True, True], "z_dim": 16
            }
            with open(qwen_cfg, "w", encoding="utf-8") as f:
                json.dump(cfg_data, f, indent=2)
        except Exception:
            pass

    engine_dir = os.path.join(ROOT_DIR, "engine")
    if os.path.isdir(engine_dir):
        engine_ckpts = os.path.join(engine_dir, "ckpts")
        if not os.path.exists(engine_ckpts):
            try:
                if sys.platform == "win32":
                    import subprocess
                    subprocess.run(f'cmd /c mklink /J "{engine_ckpts}" "{CKPTS_DIR}"', shell=True, check=False)
                else:
                    os.symlink(CKPTS_DIR, engine_ckpts)
                print(f"[IAPLAY Engine] Link de checkpoints configurado: {engine_ckpts} -> {CKPTS_DIR}")
            except Exception as e:
                print(f"[IAPLAY Engine] Aviso ao vincular engine/ckpts: {e}")

ensure_engine_ckpts_and_config()



def resolve_maestro_path() -> str:
    """Resolve dinamicamente o motor YuE2: prioriza o motor local independente (ROOT_DIR/engine)."""
    local_engine = os.path.join(ROOT_DIR, "engine")
    if os.path.isdir(local_engine) and os.path.isfile(os.path.join(local_engine, "wgp.py")):
        return os.path.abspath(local_engine)

    candidates = [
        os.path.abspath(os.path.join(ROOT_DIR, "..", "Maestro.git", "app")),
        os.path.abspath(os.path.join(ROOT_DIR, "..", "Maestro", "app")),
    ]
    try:
        config_path = os.path.expanduser("~/.pinokio/config.json")
        if os.path.isfile(config_path):
            with open(config_path, "r", encoding="utf-8") as f:
                cfg = json.load(f)
                home = cfg.get("home")
                if home:
                    candidates.append(os.path.join(home, "api", "Maestro.git", "app"))
                    candidates.append(os.path.join(home, "api", "Maestro", "app"))
    except Exception:
        pass

    candidates.extend([
        r"H:\pinokio\api\Maestro.git\app",
        r"H:\pinokio\api\Maestro\app",
        r"E:\pinokio\api\Maestro.git\app",
        r"E:\pinokio\api\Maestro\app",
        r"C:\pinokio\api\Maestro.git\app",
        r"D:\pinokio\api\Maestro.git\app",
    ])

    for c in candidates:
        if os.path.isdir(c) and os.path.isfile(os.path.join(c, "wgp.py")):
            return os.path.abspath(c)

    return candidates[0]


MAESTRO_APP_PATH = resolve_maestro_path()
if os.path.isdir(MAESTRO_APP_PATH) and MAESTRO_APP_PATH not in sys.path:
    sys.path.insert(0, MAESTRO_APP_PATH)

app = FastAPI(title="IAPLAY YuE2 Native Music Engine", version="2.0.0")

# CORS amplo para permitir conexões de qualquer porta local do IAPLAY
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Length"],
)

# Definição dos modelos YuE2 3B necessários
HF_REPO_ID = "DeepBeepMeep/TTS"
HF_REVISION = "864a479cbf3e810e1b2c1993b438510750e383b2"

REQUIRED_MODEL_FILES = [
    ("YuE2_AR/YuE2_AR_int8_convrot.safetensors", 2925023698),
    ("YuE2_AR/qwen.tiktoken", 2561218),
    ("YuE2_Acoustic_int8_convrot.safetensors", 1522568148),
    ("yue2/YuE2_VAE_bf16.safetensors", 132731320),
    ("yue2/vae_config.json", 1378),
    ("sheetsage2/SheetSage2_MERT2_bf16.safetensors", 1354429922),
]

# Estado global dos jobs e downloads
_jobs: Dict[str, Dict[str, Any]] = {}
_jobs_lock = threading.Lock()
_pipeline = None
_offloadobj = None
_pipeline_lock = threading.Lock()

_download_lock = threading.Lock()
_download_state: Dict[str, Any] = {
    "status": "idle",  # "idle", "downloading", "completed", "failed", "cancelled"
    "current_file": "",
    "downloaded_files": 0,
    "total_files": len(REQUIRED_MODEL_FILES),
    "bytes_downloaded": 0,
    "total_bytes": sum(size for _, size in REQUIRED_MODEL_FILES),
    "progress": 0.0,
    "speed": "0 MB/s",
    "error": None,
    "cancel_requested": False
}


def check_models_status() -> Dict[str, Any]:
    """Verifica se todos os arquivos do modelo YuE2 estão presentes."""
    missing = []
    installed = []
    total_size = sum(size for _, size in REQUIRED_MODEL_FILES)
    installed_size = 0

    for rel_path, exp_size in REQUIRED_MODEL_FILES:
        local_path = os.path.join(CKPTS_DIR, rel_path)
        maestro_path = os.path.join(MAESTRO_APP_PATH, "ckpts", rel_path)

        found = False
        actual_path = None
        if os.path.isfile(local_path) and os.path.getsize(local_path) > 1000:
            found = True
            actual_path = local_path
            loc = "iaplay"
        elif os.path.isfile(maestro_path) and os.path.getsize(maestro_path) > 1000:
            found = True
            actual_path = maestro_path
            loc = "maestro"

        if found and actual_path:
            sz = os.path.getsize(actual_path)
            installed_size += sz
            installed.append({"path": rel_path, "location": loc, "size": sz})
        else:
            missing.append({"path": rel_path, "expected_size": exp_size})

    is_complete = len(missing) == 0
    return {
        "installed": is_complete,
        "total_files": len(REQUIRED_MODEL_FILES),
        "installed_count": len(installed),
        "missing_files": missing,
        "installed_files": installed,
        "total_size_bytes": total_size,
        "installed_size_bytes": installed_size,
        "progress": round(installed_size / total_size, 4) if total_size else 0,
        "ckpts_dir": CKPTS_DIR,
        "maestro_ckpts_dir": os.path.join(MAESTRO_APP_PATH, "ckpts")
    }


def _model_download_worker():
    """Worker em background para baixar os pesos do YuE2 via HuggingFace Hub."""
    global _download_state
    from huggingface_hub import hf_hub_download

    try:
        with _download_lock:
            _download_state["status"] = "downloading"
            _download_state["error"] = None
            _download_state["downloaded_files"] = 0
            _download_state["cancel_requested"] = False

        total_files = len(REQUIRED_MODEL_FILES)
        total_bytes = sum(s for _, s in REQUIRED_MODEL_FILES)
        bytes_done = 0

        for idx, (rel_path, exp_size) in enumerate(REQUIRED_MODEL_FILES):
            with _download_lock:
                if _download_state["cancel_requested"]:
                    _download_state["status"] = "cancelled"
                    return
                _download_state["current_file"] = rel_path
                _download_state["downloaded_files"] = idx

            local_path = os.path.join(CKPTS_DIR, rel_path)
            # Se já existir e tiver tamanho esperado (>95%), pula
            if os.path.isfile(local_path) and os.path.getsize(local_path) >= (exp_size * 0.95):
                bytes_done += os.path.getsize(local_path)
                with _download_lock:
                    _download_state["bytes_downloaded"] = bytes_done
                    _download_state["progress"] = min(0.99, bytes_done / total_bytes)
                continue

            target_subfolder = os.path.dirname(rel_path)
            target_filename = os.path.basename(rel_path)
            dest_dir = os.path.join(CKPTS_DIR, target_subfolder) if target_subfolder else CKPTS_DIR
            os.makedirs(dest_dir, exist_ok=True)

            print(f"[IAPLAY Download] Baixando {rel_path} ({exp_size / (1024*1024):.1f} MB)...")
            start_t = time.time()

            # Download direto para a pasta ckpts do IAPLAY
            hf_hub_download(
                repo_id=HF_REPO_ID,
                revision=HF_REVISION,
                filename=rel_path,
                local_dir=CKPTS_DIR
            )

            actual_size = os.path.getsize(local_path) if os.path.isfile(local_path) else exp_size
            bytes_done += actual_size
            elapsed = max(0.1, time.time() - start_t)
            speed_mb = (actual_size / (1024 * 1024)) / elapsed

            with _download_lock:
                _download_state["downloaded_files"] = idx + 1
                _download_state["bytes_downloaded"] = bytes_done
                _download_state["progress"] = min(0.99, bytes_done / total_bytes)
                _download_state["speed"] = f"{speed_mb:.1f} MB/s"

        with _download_lock:
            _download_state["status"] = "completed"
            _download_state["current_file"] = "Concluído"
            _download_state["downloaded_files"] = total_files
            _download_state["progress"] = 1.0
            _download_state["speed"] = ""
        print("[IAPLAY Download] Todos os modelos do YuE2 foram baixados com sucesso!")

    except Exception as e:
        print(f"[IAPLAY Download] Erro ao baixar modelos: {e}")
        traceback.print_exc()
        with _download_lock:
            _download_state["status"] = "failed"
            _download_state["error"] = str(e)


def get_pipeline():
    """Carrega o pipeline do YuE2 na GPU através do integrador nativo com MMGP e VLLM."""
    global _pipeline, _offloadobj
    with _pipeline_lock:
        if _pipeline is None:
            status = check_models_status()
            if not status["installed"]:
                missing_str = ", ".join(m["path"] for m in status["missing_files"])
                raise FileNotFoundError(
                    f"Modelos YuE2 não encontrados: {missing_str}. "
                    f"Use a opção 'Baixar Modelos' diretamente no IAPLAY para instalá-los."
                )

            print("[IAPLAY Engine] Inicializando YuE2 através do pipeline nativo Maestro/MMGP...")
            prev_cwd = os.getcwd()
            orig_argv = sys.argv[:]
            sys.argv = [sys.argv[0]]
            try:
                os.chdir(MAESTRO_APP_PATH)
                if MAESTRO_APP_PATH not in sys.path:
                    sys.path.insert(0, MAESTRO_APP_PATH)

                # Garante que o files_locator busca nas pastas de ckpts do IAPLAY e do Maestro
                try:
                    from shared.utils import files_locator as fl
                    extra_paths = [
                        CKPTS_DIR,
                        os.path.join(MAESTRO_APP_PATH, "ckpts"),
                        "ckpts",
                        "."
                    ]
                    fl.set_checkpoints_paths(extra_paths)
                except Exception as e:
                    print(f"[IAPLAY Engine] Aviso ao configurar files_locator: {e}")

                import wgp
                _pipeline, _offloadobj = wgp.load_models("yue2", output_type="audio")
                print("[IAPLAY Engine] YuE2 carregado com sucesso e pronto para gerar músicas!")
            finally:
                sys.argv = orig_argv
                os.chdir(prev_cwd)
        return _pipeline, _offloadobj


def _run_generation_job(job_id: str, body: dict):
    """Executa a síntese musical do YuE2 em background."""
    with _jobs_lock:
        if job_id not in _jobs:
            return
        job = _jobs[job_id]
        job["status"] = "running"
        job["phase"] = "Iniciando pipeline YuE2..."
        job["progress"] = 0.05

    try:
        pipeline, offloadobj = get_pipeline()

        prompt = body.get("prompt", "").strip()
        alt_prompt = body.get("alt_prompt", "").strip()
        duration_seconds = int(body.get("duration_seconds", 120))
        num_inference_steps = int(body.get("num_inference_steps", 32))
        guidance_scale = float(body.get("guidance_scale", 1.0))
        model_mode = int(body.get("model_mode", 2))
        seed = int(body.get("seed", 12345678))
        custom_settings = body.get("custom_settings", {})
        if not isinstance(custom_settings, dict):
            custom_settings = {"abc": ""}

        audio_guide = body.get("audio_guide")
        audio_prompt_type = body.get("audio_prompt_type", "")
        if audio_guide:
            if not os.path.isabs(audio_guide):
                cand = os.path.join(UPLOADS_DIR, audio_guide)
                if not os.path.isfile(cand):
                    cand = os.path.join(OUTPUTS_DIR, audio_guide)
                if os.path.isfile(cand):
                    audio_guide = cand
            if os.path.isfile(audio_guide) and model_mode in (0, 1):
                audio_prompt_type = "A"
                print(f"[IAPLAY Engine] Modo Cover / Transcrição ativado com áudio guia: {audio_guide}")

        print(f"[IAPLAY Engine] Iniciando job {job_id}...")
        print(f"[IAPLAY Engine] Letra: {len(prompt)} caracteres | Estilo: {alt_prompt[:60]}... | Duração: {duration_seconds}s | Passos: {num_inference_steps} | Modo: {model_mode} | Cover: {bool(audio_guide)}")

        # Callback universal compatível com Maestro
        def progress_cb(*args, **kwargs):
            step_idx = kwargs.get("step_idx")
            if step_idx is None:
                step_idx = args[0] if len(args) > 0 else 0

            override_steps = kwargs.get("override_num_inference_steps")
            if override_steps is None or override_steps <= 0:
                override_steps = args[1] if len(args) > 1 else num_inference_steps

            phase_text = kwargs.get("denoising_extra") or kwargs.get("progress_label")
            if not phase_text:
                phase_text = args[2] if len(args) > 2 else "Processando..."

            progress_unit = kwargs.get("progress_unit", "passos")

            with _jobs_lock:
                if job_id in _jobs:
                    j = _jobs[job_id]
                    cur_step = max(0, int(step_idx) + 1 if step_idx >= 0 else 1)
                    tot_steps = max(1, int(override_steps))
                    j["step"] = cur_step
                    j["total_steps"] = tot_steps

                    # Curva de progresso nas fases do YuE2 (incluindo transcrição SheetSage2)
                    plower = str(phase_text).lower()
                    frac = min(1.0, cur_step / float(tot_steps))
                    if "encoding" in plower or "transcribing" in plower or "score" in plower or "abc" in plower or "sheetsage" in plower:
                        calc_prog = 0.02 + 0.18 * frac
                    elif "semantic" in plower or progress_unit == "tokens":
                        calc_prog = 0.20 + 0.55 * frac
                    elif "acoustic" in plower:
                        calc_prog = 0.75 + 0.18 * frac
                    elif "decod" in plower or progress_unit == "tiles":
                        calc_prog = 0.93 + 0.05 * frac
                    else:
                        calc_prog = 0.05 + 0.90 * frac

                    j["progress"] = round(min(0.98, calc_prog), 3)
                    j["phase"] = str(phase_text)
                    j["message"] = f"{phase_text} ({cur_step}/{tot_steps} {progress_unit})"

        # Chama a geração nativa do YuE2 com suporte completo a offloadobj e audio_guide (Cover)
        result = pipeline.generate(
            input_prompt=prompt,
            alt_prompt=alt_prompt,
            seed=seed,
            duration_seconds=duration_seconds,
            sampling_steps=num_inference_steps,
            guide_scale=guidance_scale,
            temperature=1.0,
            top_k=100,
            top_p=0.95,
            model_mode=model_mode,
            custom_settings=custom_settings,
            callback=progress_cb,
            offloadobj=offloadobj,
            audio_prompt_type=audio_prompt_type,
            audio_guide=audio_guide
        )

        if result is None:
            raise RuntimeError("A geração do YuE2 foi cancelada ou não produziu áudio.")

        # Extrai tensor e salva áudio WAV em 48kHz stereo
        audio_tensor = result["x"]  # shape: [channels, samples]
        sample_rate = result.get("audio_sampling_rate", 48000)

        # Converte para float32 e salva
        audio_np = audio_tensor.float().cpu().numpy()
        if audio_np.ndim == 2 and audio_np.shape[0] == 2:
            audio_np = audio_np.T

        timestamp = datetime.now().strftime("%Y-%m-%d-%Hh%Mm%Ss")
        clean_title = "".join(c for c in prompt.split("\n")[0][:30] if c.isalnum() or c in " _-").strip() or "musica"
        filename = f"{timestamp}_seed{seed}_{clean_title}.wav"
        output_path = os.path.join(OUTPUTS_DIR, filename)

        sf.write(output_path, audio_np, sample_rate)
        print(f"[IAPLAY Engine] Música salva com sucesso em: {output_path}")

        auto_humanize = body.get("humanize", True)
        final_files = [filename]
        if auto_humanize:
            try:
                try:
                    from server.audio_humanizer import humanize_audio
                except ImportError:
                    from audio_humanizer import humanize_audio

                clean_filename = f"{os.path.splitext(filename)[0]}_humanized.wav"
                clean_output_path = os.path.join(OUTPUTS_DIR, clean_filename)
                print(f"[IAPLAY Engine] Aplicando remoção de digitais de IA e masterização analógica...")
                humanize_audio(output_path, clean_output_path)
                print(f"[IAPLAY Engine] Áudio humanizado e limpo salvo em: {clean_output_path}")
                # A versão humanizada fica em primeiro lugar para reprodução padrão
                final_files = [clean_filename, filename]
            except Exception as he:
                print(f"[IAPLAY Engine] Aviso ao humanizar áudio: {he}")

        with _jobs_lock:
            if job_id in _jobs:
                j = _jobs[job_id]
                j["status"] = "completed"
                j["progress"] = 1.0
                j["step"] = num_inference_steps
                j["total_steps"] = num_inference_steps
                j["phase"] = "Finalizado"
                j["message"] = "Música sintetizada e humanizada com sucesso em 48kHz!" if len(final_files) > 1 else "Música sintetizada com sucesso em 48kHz!"
                j["output_files"] = final_files

    except Exception as e:
        print(f"[IAPLAY Engine] Erro no job {job_id}: {e}")
        traceback.print_exc()
        with _jobs_lock:
            if job_id in _jobs:
                j = _jobs[job_id]
                j["status"] = "failed"
                j["error"] = str(e)
                j["phase"] = "Erro"
                j["message"] = f"Falha na síntese: {e}"


@app.get("/health")
@app.get("/")
def health_check():
    models_info = check_models_status()
    return {
        "status": "online",
        "app": "IAPLAY Studio Engine",
        "model": "YuE2 3B Neural",
        "models_installed": models_info["installed"],
        "models_progress": models_info["progress"],
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU",
        "maestro_path": MAESTRO_APP_PATH,
        "ckpts_dir": CKPTS_DIR,
        "outputs_dir": OUTPUTS_DIR
    }


# ============================================================================
# Endpoints de Gestão e Download de Modelos
# ============================================================================

@app.get("/api/v1/models/status")
def get_model_status():
    """Retorna o status completo dos modelos YuE2."""
    status = check_models_status()
    with _download_lock:
        dl = dict(_download_state)
    return {
        **status,
        "download": dl
    }


@app.post("/api/v1/models/download")
def start_model_download():
    """Inicia o download direto dos modelos YuE2 3B para o IAPLAY."""
    with _download_lock:
        if _download_state["status"] == "downloading":
            return {"status": "downloading", "message": "Download já em andamento."}
        _download_state["status"] = "downloading"
        _download_state["error"] = None
        _download_state["cancel_requested"] = False

    t = threading.Thread(target=_model_download_worker, daemon=True, name="model-download-thread")
    t.start()
    return {"status": "started", "message": "Download dos modelos YuE2 iniciado com sucesso."}


@app.get("/api/v1/models/download/progress")
def get_model_download_progress():
    """Retorna o progresso atual do download dos modelos."""
    with _download_lock:
        return dict(_download_state)


@app.post("/api/v1/models/download/cancel")
def cancel_model_download():
    """Cancela o download dos modelos em andamento."""
    with _download_lock:
        _download_state["cancel_requested"] = True
    return {"status": "cancelling", "message": "Cancelamento do download solicitado."}


# ============================================================================
# Endpoints de Geração e Arquivos
# ============================================================================

@app.get("/api/v1/jobs")
def get_jobs():
    """Retorna os jobs em execução ou recém-finalizados."""
    with _jobs_lock:
        job_list = []
        for j in _jobs.values():
            job_list.append({
                "job_id": j["id"],
                "status": j["status"],
                "progress": j["progress"],
                "step": j.get("step", 0),
                "total_steps": j.get("total_steps", 32),
                "phase": j.get("phase", ""),
                "message": j.get("message", ""),
                "output_files": j.get("output_files", []),
                "error": j.get("error"),
                "created_at": j.get("created_at", 0)
            })
        return {"jobs": job_list}


@app.post("/api/v1/generate")
async def generate_music(request: Request, background_tasks: BackgroundTasks):
    """Submete uma requisição de geração musical para o YuE2."""
    body = await request.json()
    job_id = uuid.uuid4().hex[:8]

    with _jobs_lock:
        _jobs[job_id] = {
            "id": job_id,
            "status": "queued",
            "progress": 0.02,
            "step": 0,
            "total_steps": int(body.get("num_inference_steps", 32)),
            "phase": "Na fila do YuE2",
            "message": "Preparando tensores...",
            "created_at": time.time(),
            "output_files": [],
            "error": None
        }

    background_tasks.add_task(_run_generation_job, job_id, body)
    return {"job_id": job_id, "status": "queued"}


@app.post("/api/v1/cancel/{job_id}")
def cancel_job(job_id: str):
    """Cancela um job em andamento."""
    global _pipeline
    with _jobs_lock:
        if job_id in _jobs:
            _jobs[job_id]["status"] = "cancelled"
            _jobs[job_id]["phase"] = "Cancelado"
            _jobs[job_id]["message"] = "Geração cancelada pelo usuário."
            if _pipeline is not None:
                try:
                    _pipeline._interrupt = True
                except Exception:
                    pass
            return {"status": "cancelled", "job_id": job_id}
        raise HTTPException(status_code=404, detail="Job não encontrado")


@app.post("/api/v1/upload_audio")
async def upload_audio_guide(file: UploadFile = File(...)):
    """Recebe um áudio enviado pelo usuário para cover / transcrição harmônica com SheetSage2."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="Nenhum arquivo enviado.")

    clean_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', file.filename)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    stored_name = f"ref_{timestamp}_{clean_name}"
    dest_path = os.path.join(UPLOADS_DIR, stored_name)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "ok": True,
        "filename": stored_name,
        "original_name": file.filename,
        "filepath": dest_path,
        "url": f"/api/v1/file/{stored_name}",
        "size": os.path.getsize(dest_path)
    }


@app.get("/api/v1/file/{filename:path}")
def serve_file(filename: str, download: bool = False):
    """Serve o arquivo de áudio WAV/MP3 para streaming ou download."""
    clean_name = os.path.basename(filename)
    filepath = os.path.join(OUTPUTS_DIR, clean_name)
    if not os.path.isfile(filepath):
        filepath = os.path.join(UPLOADS_DIR, clean_name)
    if not os.path.isfile(filepath):
        filepath = os.path.join(MAESTRO_APP_PATH, "outputs", clean_name)

    if os.path.isfile(filepath):
        media_types = {
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".ogg": "audio/ogg",
            ".flac": "audio/flac",
            ".m4a": "audio/mp4",
            ".aac": "audio/aac",
        }
        ext = os.path.splitext(clean_name)[1].lower()
        media_type = media_types.get(ext, "audio/wav")

        headers = {"Access-Control-Expose-Headers": "Content-Disposition"}
        if download:
            headers["Content-Disposition"] = f'attachment; filename="{clean_name}"'
        return FileResponse(filepath, media_type=media_type, filename=clean_name, headers=headers)

    raise HTTPException(status_code=404, detail="Arquivo de áudio não encontrado")


@app.get("/api/v1/download/{filename:path}")
def download_audio_direct(filename: str):
    """Download direto garantido do arquivo de áudio WAV."""
    clean_name = os.path.basename(filename)
    filepath = os.path.join(OUTPUTS_DIR, clean_name)
    if not os.path.isfile(filepath):
        filepath = os.path.join(UPLOADS_DIR, clean_name)
    if not os.path.isfile(filepath):
        filepath = os.path.join(MAESTRO_APP_PATH, "outputs", clean_name)

    if os.path.isfile(filepath):
        media_types = {
            ".wav": "audio/wav",
            ".mp3": "audio/mpeg",
            ".ogg": "audio/ogg",
            ".flac": "audio/flac",
            ".m4a": "audio/mp4",
            ".aac": "audio/aac",
        }
        ext = os.path.splitext(clean_name)[1].lower()
        media_type = media_types.get(ext, "audio/wav")

        return FileResponse(
            filepath,
            media_type=media_type,
            filename=clean_name,
            headers={
                "Content-Disposition": f'attachment; filename="{clean_name}"',
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
@app.post("/api/v1/humanize")
async def humanize_endpoint(request: Request):
    """Remove digitais de IA e aplica masterização analógica a um arquivo de áudio WAV."""
    body = await request.json()
    filename = body.get("filename")
    if not filename:
        raise HTTPException(status_code=400, detail="Nome do arquivo não fornecido.")

    clean_name = os.path.basename(filename)
    filepath = os.path.join(OUTPUTS_DIR, clean_name)
    if not os.path.isfile(filepath):
        filepath = os.path.join(MAESTRO_APP_PATH, "outputs", clean_name)
    if not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="Arquivo de áudio não encontrado.")

    try:
        try:
            from server.audio_humanizer import humanize_audio
        except ImportError:
            from audio_humanizer import humanize_audio

        base, ext = os.path.splitext(clean_name)
        if base.endswith("_humanized"):
            out_name = f"{base}_remastered{ext}"
        else:
            out_name = f"{base}_humanized{ext}"
        out_path = os.path.join(OUTPUTS_DIR, out_name)

        res = humanize_audio(filepath, out_path, options=body.get("options"))
        return {
            "ok": True,
            "original_file": clean_name,
            "humanized_file": out_name,
            "url": f"/api/v1/file/{out_name}?workspace=default",
            "download_url": f"/api/v1/download/{out_name}",
            "details": res
        }
    except Exception as e:
        print(f"[IAPLAY Engine] Erro ao humanizar arquivo {clean_name}: {e}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro no processamento de áudio: {e}")


@app.get("/api/v1/outputs")
def list_outputs(limit: int = 50):
    """Lista as músicas geradas salvas na pasta outputs do IAPLAY."""
    outputs = []
    if os.path.isdir(OUTPUTS_DIR):
        for f in os.listdir(OUTPUTS_DIR):
            if f.lower().endswith(".wav"):
                full_path = os.path.join(OUTPUTS_DIR, f)
                stat = os.stat(full_path)
                outputs.append({
                    "name": f,
                    "url": f"/api/v1/file/{f}?workspace=default",
                    "download_url": f"/api/v1/download/{f}",
                    "size": stat.st_size,
                    "created_at": stat.st_mtime
                })

    outputs.sort(key=lambda x: x["created_at"], reverse=True)
    return {"outputs": outputs[:limit], "total": len(outputs)}


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="IAPLAY YuE2 Native Music Engine")
    parser.add_argument("--port", type=int, default=42024, help="Porta do servidor (padrão: 42024)")
    parser.add_argument("--host", type=str, default="127.0.0.1", help="Host bind (padrão: 127.0.0.1)")
    args, _ = parser.parse_known_args()
    server_port = args.port
    server_host = args.host

    # Limpa sys.argv para que subprocessos e submódulos (ex: wgp) não falhem ao analisar parâmetros
    sys.argv = [sys.argv[0]]

    print(f"[IAPLAY Engine] Iniciando servidor dedicado YuE2 em http://{server_host}:{server_port}")
    uvicorn.run(app, host=server_host, port=server_port, log_level="info")
