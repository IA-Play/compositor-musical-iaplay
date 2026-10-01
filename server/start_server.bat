@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1

echo [IAPLAY Engine] Verificando ambiente Python para YuE2...

set PYTHON_EXE=
if exist "%~dp0..\env\Scripts\python.exe" set PYTHON_EXE=%~dp0..\env\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "%~dp0..\..\env\Scripts\python.exe" set PYTHON_EXE=%~dp0..\..\env\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "H:\pinokio\api\iaplay\env\Scripts\python.exe" set PYTHON_EXE=H:\pinokio\api\iaplay\env\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "%~dp0..\..\Maestro.git\app\env-sol\Scripts\python.exe" set PYTHON_EXE=%~dp0..\..\Maestro.git\app\env-sol\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "%~dp0..\..\Maestro.git\app\env\Scripts\python.exe" set PYTHON_EXE=%~dp0..\..\Maestro.git\app\env\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "%~dp0..\..\Maestro\app\env-sol\Scripts\python.exe" set PYTHON_EXE=%~dp0..\..\Maestro\app\env-sol\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "H:\pinokio\api\Maestro.git\app\env-sol\Scripts\python.exe" set PYTHON_EXE=H:\pinokio\api\Maestro.git\app\env-sol\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "H:\pinokio\api\Maestro.git\app\env\Scripts\python.exe" set PYTHON_EXE=H:\pinokio\api\Maestro.git\app\env\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "E:\pinokio\api\Maestro.git\app\env-sol\Scripts\python.exe" set PYTHON_EXE=E:\pinokio\api\Maestro.git\app\env-sol\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "E:\pinokio\api\Maestro.git\app\env\Scripts\python.exe" set PYTHON_EXE=E:\pinokio\api\Maestro.git\app\env\Scripts\python.exe
if "%PYTHON_EXE%"=="" if exist "C:\pinokio\api\Maestro.git\app\env-sol\Scripts\python.exe" set PYTHON_EXE=C:\pinokio\api\Maestro.git\app\env-sol\Scripts\python.exe
if "%PYTHON_EXE%"=="" set PYTHON_EXE=python

netstat -ano | findstr ":42024 " | findstr "LISTENING" >nul
if %ERRORLEVEL% equ 0 (
    echo [IAPLAY Engine] Servidor dedicado YuE2 ja esta ativo na porta 42024.
    exit /b 0
)

echo [IAPLAY Engine] Utilizando Python: %PYTHON_EXE%

"%PYTHON_EXE%" -c "import diffusers" >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [IAPLAY Engine] Instalando pacote essencial diffusers...
    "%PYTHON_EXE%" -m pip install "diffusers>=0.30.0"
)

echo [IAPLAY Engine] Iniciando servidor dedicado YuE2 na porta 42024...
"%PYTHON_EXE%" "%~dp0yue_server.py" --port 42024 --host 127.0.0.1
