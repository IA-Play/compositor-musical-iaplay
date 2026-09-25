module.exports = {
  run: [
    // Windows NVIDIA
    {
      "when": "{{platform === 'win32' && gpu === 'nvidia'}}",
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org"
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
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org"
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
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch==2.8.0 torchaudio==2.8.0"
        ]
      },
      "next": null
    },
    // CPU fallback
    {
      "method": "shell.run",
      "params": {
        "venv": "{{args && args.venv ? args.venv : null}}",
        "path": "{{args && args.path ? args.path : '.'}}",
        "env": {
          "UV_NATIVE_TLS": "true",
          "UV_SYSTEM_CERTS": "true",
          "UV_INSECURE_HOST": "pypi.org,pypi.python.org,files.pythonhosted.org",
          "PIP_TRUSTED_HOST": "pypi.org pypi.python.org files.pythonhosted.org"
        },
        "message": [
          "uv pip install typing-extensions>=4.10.0",
          "uv pip install torch==2.8.0 torchaudio==2.8.0 --index-url https://download.pytorch.org/whl/cpu"
        ]
      }
    }
  ]
};
