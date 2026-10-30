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
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall"
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
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch==2.8.0 torchaudio==2.8.0 torchvision==0.23.0 --index-url https://download.pytorch.org/whl/cu128 --force-reinstall"
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
    // AMD Windows (DirectML)
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
    // AMD Linux (ROCm)
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
          "PIP_REQUIRE_VIRTUALENV": "false",
          "PIP_NO_REQUIRE_VIRTUALENV": "1"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/rocm6.3 --force-reinstall"
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
