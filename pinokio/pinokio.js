export default {
  version: "2.0",
  title: "IAPLAY Studio",
  description: "Estúdio IA para Criação de Letras, Estruturação de Prompts Suno/Udio/Mureka e Geração YuE2 com Transcrição SheetSage2",
  icon: "public/favicon.ico",
  menu: async (kernel, info) => {
    let running = {
      install: info.running("install.json"),
      start: info.running("start.json"),
      update: info.running("update.json"),
      download_models: info.running("download_models.json"),
      reset: info.running("reset.json")
    };

    if (running.install) {
      return [{
        default: true,
        icon: "fa-solid fa-spinner fa-spin",
        text: "Instalando...",
        href: "install.json"
      }];
    }

    if (running.download_models) {
      return [{
        default: true,
        icon: "fa-solid fa-spinner fa-spin",
        text: "Baixando Modelos YuE2 & SheetSage2...",
        href: "download_models.json"
      }];
    }

    if (running.start) {
      let local = info.local("start.json");
      if (local && local.url) {
        return [
          {
            default: true,
            icon: "fa-solid fa-rocket",
            text: "Abrir IAPLAY Studio",
            href: local.url
          },
          {
            icon: "fa-solid fa-terminal",
            text: "Terminal",
            href: "start.json"
          }
        ];
      } else {
        return [{
          default: true,
          icon: "fa-solid fa-terminal",
          text: "Iniciando Servidor...",
          href: "start.json"
        }];
      }
    }

    if (running.update) {
      return [{
        default: true,
        icon: "fa-solid fa-terminal",
        text: "Atualizando...",
        href: "update.json"
      }];
    }

    if (running.reset) {
      return [{
        default: true,
        icon: "fa-solid fa-spinner fa-spin",
        text: "Resetando...",
        href: "reset.json"
      }];
    }

    return [
      {
        default: true,
        icon: "fa-solid fa-play",
        text: "Iniciar IAPLAY",
        href: "start.json",
        description: "Iniciar servidor local e abrir Estúdio"
      },
      {
        icon: "fa-solid fa-cloud-arrow-down",
        text: "Baixar Modelos YuE2",
        href: "download_models.json",
        description: "Baixar pesos neurais YuE2 3B e SheetSage2 (~6 GB) para geração local"
      },
      {
        icon: "fa-solid fa-arrows-rotate",
        text: "Atualizar",
        href: "update.json",
        description: "Buscar atualizações do IAPLAY via Git"
      },
      {
        icon: "fa-solid fa-download",
        text: "Instalar / Reinstalar",
        href: "install.json",
        description: "Instalar dependências (Node.js, Python e PyTorch)"
      },
      {
        icon: "fa-solid fa-rotate-left",
        text: "Resetar Cache",
        href: "reset.json",
        description: "Limpar caches temporários"
      }
    ];
  }
};
