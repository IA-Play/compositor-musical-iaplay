export default {
  version: "2.0",
  title: "IAPLAY Studio",
  description: "Estúdio IA para Criação de Letras, Estruturação de Prompts Suno/Udio e Integração com Maestro",
  icon: "public/favicon.ico",
  menu: async (kernel, info) => {
    let running = {
      install: info.running("install.json"),
      start: info.running("start.json"),
      update: info.running("update.json")
    };

    if (running.install) {
      return [{
        default: true,
        icon: "fa-solid fa-spinner fa-spin",
        text: "Instalando...",
        href: "install.json"
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

    return [
      {
        default: true,
        icon: "fa-solid fa-play",
        text: "Iniciar IAPLAY",
        href: "start.json",
        description: "Iniciar servidor local e abrir Estúdio"
      },
      {
        icon: "fa-solid fa-arrows-rotate",
        text: "Atualizar",
        href: "update.json",
        description: "Buscar atualizações do IAPLAY"
      },
      {
        icon: "fa-solid fa-download",
        text: "Instalar / Reinstalar",
        href: "install.json",
        description: "Instalar dependências (npm install)"
      }
    ];
  }
};
