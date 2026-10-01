module.exports = {
  run: [
    // Windows NVIDIA
    {
      "when": "{{platform === 'win32' && gpu === 'nvidia'}}",
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "venv_python": "{{args && args.venv_python ? args.venv_python : '3.11'}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org",
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps"
        ]
      },
      "next": null
    },
    // Linux NVIDIA
    {
      "when": "{{platform === 'linux' && gpu === 'nvidia'}}",
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "venv_python": "{{args && args.venv_python ? args.venv_python : '3.11'}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org",
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch==2.10.0 torchvision==0.25.0 torchaudio==2.10.0 --index-url https://download.pytorch.org/whl/cu130 --force-reinstall --no-deps"
        ]
      },
      "next": null
    },
    // Apple Silicon Mac
    {
      "when": "{{platform === 'darwin' && arch === 'arm64'}}",
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "venv_python": "{{args && args.venv_python ? args.venv_python : '3.11'}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org",
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch torchvision torchaudio"
        ]
      },
      "next": null
    },
    // AMD Windows
    {
      "when": "{{platform === 'win32' && gpu === 'amd'}}",
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "venv_python": "{{args && args.venv_python ? args.venv_python : '3.11'}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org",
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch torch-directml torchaudio torchvision numpy==1.26.4 --force-reinstall"
        ]
      },
      "next": null
    },
    // AMD Linux ROCm
    {
      "when": "{{platform === 'linux' && gpu === 'amd'}}",
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "venv_python": "{{args && args.venv_python ? args.venv_python : '3.11'}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org",
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.2 --force-reinstall --no-deps"
        ]
      },
      "next": null
    },
    // Intel Mac
    {
      "when": "{{platform === 'darwin' && arch !== 'arm64'}}",
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "venv_python": "{{args && args.venv_python ? args.venv_python : '3.11'}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org",
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --force-reinstall --no-deps"
        ]
      },
      "next": null
    },
    // CPU fallback
    {
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "venv_python": "{{args && args.venv_python ? args.venv_python : '3.11'}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org",
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu --force-reinstall"
        ]
      }
    }
  ]
};
