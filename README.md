<div align="center">

# 🎵 IAPLAY Studio — Estúdio de Música & IA Neural Independente

**Composição lírica avançada, engenharia de prompts Suno/Udio/Mureka e geração musical neural local com YuE2 3B e SheetSage2.**

[![Download no Pinokio](https://img.shields.io/badge/Download_no_Pinokio-1--Click-orange?style=for-the-badge&logo=electron)](https://pinokio.co/apps/github-com-ia-play-compositor-musical-iaplay)
[![Pinokio Compatible](https://img.shields.io/badge/Pinokio-Ready-blue?style=for-the-badge&logo=electron)](https://pinokio.co/apps/github-com-ia-play-compositor-musical-iaplay)
[![YuE2 3B](https://img.shields.io/badge/Engine-YuE2_3B_Neural-purple?style=for-the-badge)](https://github.com/IA-Play/compositor-musical-iaplay)
[![SheetSage2](https://img.shields.io/badge/Transcription-SheetSage2_MERT-green?style=for-the-badge)](https://github.com/IA-Play/compositor-musical-iaplay)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[⚡ Baixar no Pinokio](https://pinokio.co/apps/github-com-ia-play-compositor-musical-iaplay) • [Novidades v3.5.0](#-novidades-da-versão-350) • [Funcionalidades](#-principais-funcionalidades) • [Motor YuE2 Local](#-motor-neural-local-yue2--sheetsage2) • [API](#-documentação-da-api)

</div>

---

## 📖 Sobre o IAPLAY Studio

O **IAPLAY Studio** é uma estação de trabalho de áudio e inteligência artificial completa:
1. **Copiloto Lírico e de Prompts:** Gera letras estruturadas com metatags precisas (`[Verse]`, `[Chorus]`, `[Bridge]`, etc.) e prompts de estilo de alta fidelidade calibrados para Suno, Udio e Mureka.
2. **Geração Musical Neural Local (YuE2 3B):** Gera músicas completas (vocais + instrumental) em alta resolução diretamente na sua placa de vídeo (NVIDIA CUDA), de forma 100% gratuita, privada e ilimitada.
3. **Criação de Covers & Transcrição (SheetSage2):** Carregue um áudio de referência (.mp3, .wav, .m4a) para extrair harmonia e melodia guia automaticamente.
4. **Humanizador de Áudio & Anti-Detecção:** Remove artefatos de IA, normaliza dinâmica e limpa assinaturas para distribuição em plataformas.
5. **Duração Expandida:** Geração de até 10 minutos (600 segundos) de música contínua.

---

## 🚀 Novidades da Versão 3.5.1 (30/10/2026)

- 🔄 **Fim do Loop de Reinstalação no Pinokio:**
  - O arquivo `pinokio.js` agora inspeciona de forma resiliente tanto a existência do marcador local `.installed` quanto a integridade do ambiente virtual (`env`) e dependências (`node_modules`/`dist`).
  - O aplicativo inicia imediatamente ao clicar no card, sem jamais forçar nova instalação em ambientes já configurados.
- ⚡ **Compatibilidade Completa com o Cache do Pinokio (CommonJS):**
  - Migração de `pinokio.js` e `torch.js` para a especificação CommonJS (`module.exports`). Isso impede que o runtime do Electron retenha o menu de instalação em memória e garante reatividade instantânea dos botões de controle ("Iniciar IAPLAY", "Abrir IAPLAY Studio" e "Terminal").
- 🛠️ **Correção Crítica no Instalador de Dependências do Windows:**
  - Adicionadas as aspas protetoras obrigatórias nos comandos de shell (`"typing-extensions>=4.10.0"`), eliminando falhas silenciosas de redirecionamento que abortavam o instalador no meio do processo.
- 🧹 **Remoção de Scripts de Anúncios Externos no Ambiente Local:**
  - Removidos completamente os scripts de auto-ads do Google AdSense dos arquivos HTML do desktop/local, acabando com a abertura indesejada de múltiplas abas no navegador (`ep2.adtrafficquality.google.com` e `googleads`).
- 🔴🟢 **Compatibilidade Total de Hardware (NVIDIA CUDA & AMD Radeon):**
  - Suporte nativo e otimizado para placas **NVIDIA GeForce/RTX** (CUDA) e **AMD Radeon** (DirectML no Windows e ROCm no Linux), com testes e validação completa dos ~5.5 GB de pesos neurais oficiais em ckpts/.

---

## 🚀 Novidades da Versão 3.5.0

- 📦 **Instalação Modular Inteligente (Escolha entre Modo Completo ou Modo Leve):**
  - Agora você escolhe no momento da instalação (tanto pelo **Pinokio** quanto pelo **`instalar.bat` Standalone**) qual pacote deseja instalar:
    - **Modo Completo (~6 GB):** Instala o Criador de Letras/Prompts + Estúdio Musical Local **YuE2 3B & SheetSage2**.
    - **Modo Leve / Rápido (Sem baixar 6 GB):** Instala em poucos segundos apenas o **Criador de Letras e Engenharia de Prompts (Suno, Udio, Mureka)**. Caso queira gerar músicas localmente no futuro, você pode baixar o YuE2 a qualquer momento com 1 clique pelo menu ou dentro do próprio aplicativo!
- 🔴🟢 **Suporte Oficial a Placas de Vídeo AMD Radeon (DirectML & ROCm) + NVIDIA CUDA + CPU:**
  - Nova camada de compatibilidade de hardware (`server/gpu_compat.py`) que detecta automaticamente placas **AMD Radeon RX/Vega** (via DirectML no Windows e ROCm/HIP no Linux), **NVIDIA GeForce/RTX** (CUDA), **Apple Silicon** (MPS) e **CPU**.
  - Patches profundos no motor `wgp.py`, `nanovllm`, `yue2` e `SheetSage2` para substituir chamadas exclusivas de CUDA por alocação multi-dispositivo dinâmica e segura, exibindo o badge da sua GPU diretamente no cabeçalho do Estúdio YuE2.
- 🌐 **Suporte Multilíngue Completo (Português, Inglês e Espanhol):**
  - Todo o IAPLAY Studio agora opera nativamente em 3 idiomas: Editor de composição, tags, seletor de motores, painel de regras de seção, modais, configurações e centro de produção YuE2.
  - Sistema de fallback multinível em cascata (`Idioma Selecionado -> PT -> EN -> Chave`), garantindo interface limpa e sem textos crus mesmo em transições de rede.
- ⏳ **Feedback Dinâmico de Hardware & Carregamento de Tensores:**
  - Banners amigáveis e explicativos alertando o usuário enquanto os pesos neurais estão sendo alocados na memória (GPU/RAM), tanto para o Ollama quanto para o YuE2.
- 🦙 **Seletores Dinâmicos de Modelos Locais & Nuvem:**
  - Detecção automática e listagem em tempo real de modelos baixados no Ollama, com troca rápida em 1 clique.
  - Seletor de modelos da NVIDIA NIM Cloud gratuita com descrições detalhadas de cada inteligência.
- 🐛 **Auditoria Geral e Correção de Bugs:**
  - Padronização dos modais nativos (`ModalProvider`) no Dashboard e Editor de Texto Rico, evitando bloqueios de promessa ao fechar alertas pelo fundo.
  - Correção do rastreamento de alterações não salvas (`isDirty`) ao alternar entre diferentes projetos.
  - Navegação fluida com tecla `Enter` nas etapas do Wizard de Criação.

---

## 🚀 Novidades da Versão 3.4.0

- 🎤 **Novo Painel de Regras de Seção & Efeitos Vocais (100+ Técnicas):**
  - Personalize cada seção musical (`[Verse]`, `[Chorus]`, `[Bridge]`, `[Intro]`, `[Outro]`) com precisão cirúrgica.
  - Catálogo nativo com mais de 100 técnicas vocais categorizadas: **Drive & Rasp**, **Melismas & Riffs**, **Belting**, **Falsete**, **Vibrato**, **Portamento & Slides**, **Sustentação**, **Dinâmica**, **Articulação** e **Ad-libs cantados ( )**.
  - As tags e diretivas são aplicadas diretamente na letra e estrutura sem perda de métrica.
- ⚡ **Suporte a NVIDIA NIM Gratuita (Ultra-Rápido):**
  - Integração com a API gratuita da NVIDIA Cloud com latência ultrabaixa.
  - Modelos de ponta disponíveis: **Llama 3.1 Nemotron 70B**, **Mistral Large 2 (123B)**, **Mistral NeMo 12B**, **Mixtral 8x22B MoE** e **DeepSeek v4.1 Flash**.
  - Proxy local dedicado para contornar qualquer restrição de CORS e garantir estabilidade.
- 🧠 **Engenharia de Prompts de Elite com Adaptação Dinâmica:**
  - Novo algoritmo `DYNAMIC STYLE ADAPTATION`: quando você altera o estilo musical (ex: de Rock para Pagode), o motor descarta automaticamente instrumentos anteriores e sintetiza novas notas de produção 100% autênticas do gênero alvo.
  - Protocolo `ZERO TRUNCATION` rigoroso: preservação de 100% dos versos e palavras da letra.
  - Injeção e validação automática de `[PROMPT_GLOBAL]` com keywords de estilo e atmosfera.
  - Limpeza inteligente de colchetes órfãos e formatação limpa para Suno, Udio e YuE2.
- 💾 **Persistência Confiável de Projetos:**
  - Sincronização em tempo real entre o estado da aplicação (Zustand) e o banco local.
  - Suporte a salvamento forçado com snapshot atualizado.
- 🎛️ **Detecção Aprimorada do Servidor Neural:**
  - Verificação de porta 42024 ativa para evitar inicializações duplicadas do YuE2.

---

## ✨ Principais Funcionalidades

### 1. 🎛️ Motor YuE2 3B & SheetSage2 Integrado
- **Geração Local Independente:** Motor dedicado baseado em YuE2 3B Flow Matching com inferência de alta performance em Int8/BF16.
- **Modos de Geração:**
  - `Texto para Música (Prompt/Lyrics)`: Geração direta a partir de letras e descrições.
  - `Cover com Melodia + Acordes (SheetSage2)`: Transcrição neural de qualquer áudio enviado para reconstrução completa.
  - `Cover Apenas Melodia`: Mantém a linha vocal guia e permite rearmonizar o instrumental.
- **Duração Flexível até 10 Minutos:** Seleção por chips rápidos (`30s`, `1m`, `2m`, `3m`, `5m`, `7m`, `8m`, `10m`) ou detecção automática pelo tamanho do áudio carregado.

### 2. 🛡️ Sistema Anti-Detecção de IA (Áudio + Letra)
- **Ghostwriter Teoria do Caos (Lírico):** Gera letras com quebras propositais de simetria sintética, imperfeições humanas, variações de burstiness e perplexidade para contornar detectores de IA.
- **Humanizador Espectral de Áudio:** Processamento pós-geração com leve variação microtonal, saturação harmônica analógica analítica e filtragem passa-baixas sutil que atenua artefatos de vocoders neurais.

### 3. 🪄 Prompts Mestres de Elite Padronizados
- **Style Description Architect:** Sintetiza estilos em descrições ultraprecisas em inglês técnico, respeitando o limite rigoroso de até 979 caracteres para o Suno AI.
- **Rhythm Doctor & Metric Optimizer:** Corrige métricas, prosódia e flow das letras.
- **Sonic DNA Forensic Specialist:** Efetua engenharia reversa de artistas e bandas de referência.

### 4. 🧰 Arsenal de Produção & Engenharia de Prompts
- Configuração de instrumentos, mixagem, masterização, ambiências e estilos musicais populares (Pop, Rock, Trap, Funk BR, MPB, Pagode, Metal, Sertanejo, Gospel, etc.).

---

## 📸 Galeria Visual & Tour pelas Ferramentas (Screenshots)

### 🎵 1. Editor de Composição & Painel Neural Completo
*Editor lírico com metatags, controle de emoção/estilo, prompt estruturado e acionamento direto do motor neural YuE2.*
![Editor de Composição Completo](docs/screenshots/editor_full_workflow.png)

### 💡 2. Wizard de Criação: Da Ideia ao Briefing
*Transforme uma ideia simples, frase ou história em uma música estruturada com gênero e emoção ideais.*
![Wizard de Ideia Inicial](docs/screenshots/wizard_idea_prompt.png)

### 🎸 3. Modo Artista & Engenharia Reversa (DNA Sônico)
*Extraia a essência técnica e o perfil vocal de qualquer artista ou banda sem violar termos de uso.*
![Referência de Artista](docs/screenshots/modal_artist_reference.png)
![Autópsia Musical DNA Sônico](docs/screenshots/modal_sonic_dna.png)

### 🎛️ 4. Arsenal Sonoro & Textura de Áudio
*Seleção cirúrgica de instrumentos, masterização de estúdio, ritmo, groove, ambiência e efeitos analógicos.*
![Configuração do Arsenal Sonoro](docs/screenshots/arsenal_modal_config.png)
![Visão Geral do Arsenal](docs/screenshots/arsenal.png)

### 🚀 5. Centro de Comando (Dashboard de Projetos)
*Gerenciamento visual rápido de todos os seus projetos musicais, letras e histórico de versões.*
![Centro de Comando](docs/screenshots/dashboard.png)

### 🧠 6. Configuração de IA Híbrida & Ollama Local (Pinokio)
*Conexão com Gemini na nuvem ou modelos 100% locais, gratuitos e privados via Ollama (Gemma 2, Llama 3).*
![Configuração de IA](docs/screenshots/settings.png)

### ⚙️ 7. Painel Administrativo de Prompts Mestres
*Ajuste fino dos prompts mestres do sistema para personalizar a inteligência e as regras de composição do estúdio.*
![Painel Administrativo](docs/screenshots/admin.png)

---

## ⚡ Fluxo de Geração Musical Neural YuE2 3B (Direto no App)

### 1. Síntese Semântica de Áudio (Tokens YuE2 3B)
*Geração e monitoramento de tokens acústicos com contagem em tempo real e tempo decorrido.*
![Síntese Semântica YuE2](docs/screenshots/yue2_generation_tokens.png)

### 2. Decodificação Neural Acústica
*Renderização de alta fidelidade das faixas vocais e instrumentais (DiT Flow & VAE 48kHz Stereo).*
![Decodificação Neural YuE2](docs/screenshots/yue2_generation_decoding.png)

### 3. Música Pronta com Masterização Anti-IA e Player Integrado
*Áudio gerado diretamente no app, com corte de artefatos de IA, player integrado e download de WAV Master 48kHz.*
![Música Concluída YuE2](docs/screenshots/yue2_generation_finished.png)



---

## ⚡ Instalação em 1-Clique via Pinokio

Você pode instalar o IAPLAY Studio diretamente em 1 clique pelo navegador ou pelo próprio Pinokio:

👉 **[Abrir e Baixar no Pinokio (1-Click Install)](https://pinokio.co/apps/github-com-ia-play-compositor-musical-iaplay)**

Ou manualmente dentro do app:
1. Abra o **Pinokio**.
2. Clique em **Discover** ou **Download** e cole:
   ```
   https://pinokio.co/apps/github-com-ia-play-compositor-musical-iaplay
   ```
   *(ou a URL do repositório: `https://github.com/IA-Play/compositor-musical-iaplay`)*
3. Clique em **Instalar / Reinstalar**:
   - O Pinokio instalará as dependências do Node.js, configurará o ambiente Python virtual com PyTorch CUDA e todas as bibliotecas necessárias.
4. Clique em **Baixar Modelos YuE2**:
   - Baixa com 1 clique os pesos neurais oficiais do YuE2 3B e SheetSage2 (~6 GB) diretamente do Hugging Face para a pasta local `ckpts/`.
5. Clique em **Iniciar IAPLAY**:
   - O servidor neural do YuE2 e a interface WebUI abrirão automaticamente!

---

## 🚀 Instalação Manual (Linha de Comando)

### Pré-requisitos
- **Node.js** (v18+)
- **Python** (3.10 ou 3.11) com suporte a CUDA 12.x / 13.x
- **GPU NVIDIA** com pelo menos 8 GB VRAM recomendados

```bash
# 1. Clonar repositório
git clone https://github.com/IA-Play/compositor-musical-iaplay.git
cd compositor-musical-iaplay

# 2. Instalar dependências da WebUI
npm install
npm run build

# 3. Configurar ambiente Python
python -m venv env
.\env\Scripts\activate
pip install -r server/requirements.txt
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# 4. Baixar pesos dos modelos YuE2 3B e SheetSage2
python server/download_models.py

# 5. Iniciar servidores
# Terminal 1 (Servidor YuE2):
python server/yue_server.py --port 42024 --host 127.0.0.1

# Terminal 2 (Interface Vite):
npm run dev -- --host 127.0.0.1 --port 5173
```

---

## 🔌 Documentação da API

O servidor neural do IAPLAY expõe endpoints REST na porta `42024`:

### 1. Status do Servidor e Modelos
- **GET** `/api/v1/health`
- **GET** `/api/v1/models_status`

### 2. Geração Musical
- **POST** `/api/v1/generate`

#### Exemplo em cURL:
```bash
curl -X POST http://127.0.0.1:42024/api/v1/generate \
  -H "Content-Type: application/json" \
  -d '{
    "lyrics": "[Verse]\nAcordei cedo com o sol na janela\nLembrando daquele café com ela\n\n[Chorus]\nO tempo corre e eu fico aqui\nBuscando motivos pra sorrir",
    "genre": "Acoustic Pop Rock, driving rhythm, warm acoustic guitar, emotive male vocals",
    "prompt_structure": "",
    "duration": 180,
    "humanize_anti_ai": true,
    "mode": 2
  }'
```

#### Exemplo em Python:
```python
import requests

payload = {
    "lyrics": "[Verse]\nCaminhando sob a chuva fina\n\n[Chorus]\nMinh'alma canta a melodia",
    "genre": "Modern worship ballad, melodic piano, cinematic pads, expressive lead vocal",
    "duration": 300,
    "humanize_anti_ai": True,
    "mode": 2  # 2: Text to Song, 0: Melodia + Acordes, 1: Apenas Melodia
}

response = requests.post("http://127.0.0.1:42024/api/v1/generate", json=payload)
data = response.json()
print("Job ID:", data["job_id"])
```

#### Exemplo em JavaScript:
```javascript
const res = await fetch("http://127.0.0.1:42024/api/v1/generate", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    lyrics: "[Verse]\nNoites claras de verão\n\n[Chorus]\nO som da nossa canção",
    genre: "Indie Pop, clean guitars, dreamy synths",
    duration: 120,
    humanize_anti_ai: true,
    mode: 2
  })
});
const data = await res.json();
console.log("Status da geração:", data.status, "ID:", data.job_id);
```

### 3. Upload de Áudio para Cover
- **POST** `/api/v1/upload_audio` (form-data: `file=@audio.mp3`)

---

## 📁 Estrutura do Projeto

```
compositor-musical-iaplay/
├── pinokio.js            # Menu e automações do Pinokio
├── pinokio.json          # Metadados e links do aplicativo
├── install.json          # Script de instalação do Pinokio (Node + Python + Torch)
├── start.json            # Script de inicialização do servidor e abertura da WebUI
├── download_models.json  # 1-Clique download dos pesos YuE2 3B e SheetSage2
├── update.json           # Atualizador de código e dependências
├── reset.json            # Limpeza e reset de caches
├── torch.js              # Instalador inteligente de PyTorch com aceleração CUDA
├── server/               # Servidor dedicado FastAPI do motor YuE2
│   ├── yue_server.py     # Endpoints de geração, download e transcrição
│   ├── audio_humanizer.py# Filtro espectral anti-detecção de IA
│   ├── download_models.py# Download automático do Hugging Face
│   └── requirements.txt  # Dependências Python
├── engine/               # Motor neural YuE2 3B independente (wgp)
├── src/                  # Código-fonte React / TypeScript da WebUI
├── public/               # Ícones, manifesto e arquivos estáticos
└── ckpts/                # Pesos neurais (gerenciado automaticamente)
```

---

## 📄 Licença

Distribuído sob licença MIT. Consulte `LICENSE` para mais informações.
Desenvolvido com carinho pela equipe **IA-Play**.
