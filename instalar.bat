@echo off
title IAPLAY Studio - Instalador Modular (NVIDIA / AMD / CPU)
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

echo ====================================================================
echo   IAPLAY STUDIO - Instalador Automatizado (NVIDIA / AMD / CPU)
echo ====================================================================
echo.
echo Escolha o modo de instalacao desejado:
echo.
echo   [1] MODO COMPLETO (Recomendado para placas NVIDIA ou AMD Radeon)
echo       Instala o Criador de Letras/Prompts + Estudio Musical YuE2 Local
echo       e Transcricao SheetSage2 (Download de ~6 GB de modelos neurais).
echo.
echo   [2] MODO LEVE / RAPIDO (Apenas Criador de Letras e Prompts)
echo       Instala apenas o estudio de composicao e estruturacao de prompts
echo       para Suno, Udio e Mureka. Instalacao super rapida sem baixar 6 GB!
echo       (Voce podera baixar o motor musical YuE2 depois quando quiser).
echo.
set "INSTALL_MODE=full"
set /p "MODE_CHOICE=Digite 1 para Modo Completo ou 2 para Modo Leve [Padrao=1]: "
if "%MODE_CHOICE%"=="2" set "INSTALL_MODE=lite"

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"
echo %INSTALL_MODE%> "%SCRIPT_DIR%.iaplay_mode"

echo.
if "%INSTALL_MODE%"=="lite" (
    echo [MODO SELECIONADO] Modo Leve / Rapido ^(Apenas Prompts e Letras^)
) else (
    echo [MODO SELECIONADO] Modo Completo ^(Prompts + Estudio Musical YuE2 ~6 GB^)
)
echo.

REM 1. Verifica instalacao do Node.js
where node >nul 2>&1
if not errorlevel 1 goto :NODE_OK
echo [AVISO] Node.js nao detectado no sistema.
where winget >nul 2>&1
if errorlevel 1 goto :CHECK_NODE_AGAIN
echo Tentando instalar Node.js automaticamente pelo Windows Package Manager...
winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
:CHECK_NODE_AGAIN
where node >nul 2>&1
if errorlevel 1 goto :ERRO_NODE
:NODE_OK

where npm >nul 2>&1
if errorlevel 1 goto :ERRO_NPM
echo [OK] Node.js e npm prontos.

REM 2. Verifica instalacao do Python
where python >nul 2>&1
if not errorlevel 1 goto :PYTHON_OK
echo [AVISO] Python nao detectado no sistema.
where winget >nul 2>&1
if errorlevel 1 goto :CHECK_PYTHON_AGAIN
echo Tentando instalar Python 3.11 automaticamente pelo Windows Package Manager...
winget install Python.Python.3.11 --silent --accept-package-agreements --accept-source-agreements
:CHECK_PYTHON_AGAIN
where python >nul 2>&1
if errorlevel 1 goto :ERRO_PYTHON
:PYTHON_OK
echo [OK] Python detectado no sistema.

REM 3. Cria ambiente virtual Python (env) se nao existir
if exist "%SCRIPT_DIR%env\Scripts\python.exe" goto :ENV_JA_EXISTE
echo.
echo [1/4] Criando ambiente virtual Python dedicado 'env'...
where uv >nul 2>&1
if not errorlevel 1 goto :CREATE_ENV_UV
python -m venv "%SCRIPT_DIR%env"
goto :ENV_CRIADO

:CREATE_ENV_UV
uv venv "%SCRIPT_DIR%env" --python 3.11 --seed --native-tls 2>nul
if exist "%SCRIPT_DIR%env\Scripts\python.exe" goto :ENV_CRIADO
uv venv "%SCRIPT_DIR%env" --seed --native-tls 2>nul
if exist "%SCRIPT_DIR%env\Scripts\python.exe" goto :ENV_CRIADO
python -m venv "%SCRIPT_DIR%env"
:ENV_CRIADO
goto :ENV_CHECK_OK

:ENV_JA_EXISTE
echo [OK] Ambiente virtual 'env' ja existe.
:ENV_CHECK_OK

set "PYTHON_EXE=%SCRIPT_DIR%env\Scripts\python.exe"

REM Se Modo Leve, instala apenas dependencias leves e pula PyTorch/Pesos 6GB
if "%INSTALL_MODE%"=="lite" goto :INSTALAR_MODO_LEVE

REM 4. Modo Completo: Detecta GPU (NVIDIA CUDA, AMD Radeon DirectML ou CPU)
echo.
echo [2/4] Detectando placa de video (NVIDIA / AMD Radeon / CPU)...
where nvidia-smi >nul 2>&1
if not errorlevel 1 goto :INSTALAR_PYTORCH_NVIDIA

REM Verifica se ha placa AMD Radeon via PowerShell CIM
powershell -NoProfile -Command "$g = Get-CimInstance Win32_VideoController | Select-Object -ExpandProperty Name; if ($g -match 'AMD|Radeon') { exit 0 } else { exit 1 }" >nul 2>&1
if not errorlevel 1 goto :INSTALAR_PYTORCH_AMD
goto :INSTALAR_PYTORCH_CPU

:INSTALAR_PYTORCH_NVIDIA
echo [GPU] Placa NVIDIA detectada! Instalando PyTorch com aceleracao CUDA...
where uv >nul 2>&1
if not errorlevel 1 uv --native-tls pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124 --python "%PYTHON_EXE%"
if errorlevel 1 "%PYTHON_EXE%" -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124
goto :PYTORCH_OK

:INSTALAR_PYTORCH_AMD
echo [GPU] Placa AMD Radeon detectada! Instalando PyTorch com aceleracao DirectML...
where uv >nul 2>&1
if not errorlevel 1 uv --native-tls pip install torch torch-directml torchvision torchaudio numpy==1.26.4 --python "%PYTHON_EXE%"
if errorlevel 1 "%PYTHON_EXE%" -m pip install torch torch-directml torchvision torchaudio numpy==1.26.4
goto :PYTORCH_OK

:INSTALAR_PYTORCH_CPU
echo [CPU] Placa dedicada NVIDIA/AMD nao detectada. Instalando PyTorch CPU...
where uv >nul 2>&1
if not errorlevel 1 uv --native-tls pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --python "%PYTHON_EXE%"
if errorlevel 1 "%PYTHON_EXE%" -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
:PYTORCH_OK

REM 5. Instala pacotes completos do backend (requirements.txt)
echo.
echo [3/4] Instalando dependencias completas do servidor de IA...
where uv >nul 2>&1
if not errorlevel 1 uv --native-tls pip install setuptools wheel opencv-python-headless pillow -r "%SCRIPT_DIR%server\requirements.txt" --python "%PYTHON_EXE%"
if errorlevel 1 "%PYTHON_EXE%" -m pip install setuptools wheel opencv-python-headless pillow -r "%SCRIPT_DIR%server\requirements.txt"

REM 6. Instala dependencias do frontend web
echo.
echo [4/4] Instalando dependencias da interface web (Node.js)...
call npm install

REM 7. Download dos pesos neurais YuE2
echo.
echo ====================================================================
echo   Verificando e baixando pesos neurais YuE2 e SheetSage2 (~6 GB)
echo ====================================================================
"%PYTHON_EXE%" "%SCRIPT_DIR%server\download_models.py"
goto :FIM_SUCESSO

:INSTALAR_MODO_LEVE
echo.
echo [2/3] Instalando servidor leve do IAPLAY (sem baixar modelos de 6 GB)...
where uv >nul 2>&1
if not errorlevel 1 uv --native-tls pip install setuptools wheel fastapi uvicorn pydantic soundfile numpy==1.26.4 requests huggingface_hub packaging psutil --python "%PYTHON_EXE%"
if errorlevel 1 "%PYTHON_EXE%" -m pip install setuptools wheel fastapi uvicorn pydantic soundfile numpy==1.26.4 requests huggingface_hub packaging psutil

echo.
echo [3/3] Instalando dependencias da interface web (Node.js)...
call npm install

:FIM_SUCESSO
echo.
echo ====================================================================
echo   Instalacao do IAPLAY Studio concluida com sucesso!
if "%INSTALL_MODE%"=="lite" (
    echo   Modo instalado: MODO LEVE ^(Criador de Letras e Prompts^)
    echo   Obs: Voce pode baixar o Estudio Musical YuE2 depois pela interface!
) else (
    echo   Modo instalado: MODO COMPLETO ^(Prompts + Estudio Musical YuE2^)
)
echo   Para iniciar a aplicacao a qualquer momento, execute: iniciar.bat
echo ====================================================================
echo.
pause
exit /b 0

:ERRO_NODE
echo [ERRO] Node.js nao foi detectado no sistema!
echo Por favor, instale o Node.js versao LTS em: https://nodejs.org
pause
exit /b 1

:ERRO_NPM
echo [ERRO] npm nao foi detectado no sistema!
pause
exit /b 1

:ERRO_PYTHON
echo [ERRO] Python nao foi detectado no sistema!
echo Por favor, instale o Python 3.10 ou 3.11 em: https://python.org
echo Certifique-se de marcar a opcao "Add Python to PATH" durante a instalacao.
pause
exit /b 1
