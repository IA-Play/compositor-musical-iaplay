export default {
  version: "3.5",
  title: "IAPLAY Studio",
  description: "Estúdio IA para Criação de Letras, Estruturação de Prompts Suno/Udio/Mureka e Geração YuE2 (NVIDIA / AMD / CPU) com Transcrição SheetSage2",
  icon: "public/favicon.ico",
  menu: async (kernel, info) => {
    let installed = info.exists("node_modules") && info.exists("env");
    let modelsInstalled = info.exists("engine/ckpts/YuE2/yue-s1-3B-anneal-en-cot");
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

    if (!installed) {
      return [
        {
          default: true,
          icon: "fa-solid fa-plug",
          text: "Instalar IAPLAY (Escolher Modo)",
          href: "install.json",
          description: "Escolha entre Modo Completo (Com YuE2 ~6 GB) ou Modo Leve (Apenas Prompts e Letras)"
        },
        {
          icon: "fa-solid fa-bolt",
          text: "Instalação Rápida / Leve (Só Prompts e Letras)",
          href: "install.json",
          params: { mode: "lite" },
          description: "Instala apenas o Criador de Letras e Prompts (Suno, Udio, Mureka) sem baixar 6 GB"
        },
        {
          icon: "fa-solid fa-music",
          text: "Instalação Completa (Com Estúdio YuE2 ~6 GB)",
          href: "install.json",
          params: { mode: "full" },
          description: "Instala tudo incluindo motor musical local YuE2 e SheetSage2 (NVIDIA / AMD / CPU)"
        }
      ];
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
        icon: modelsInstalled ? "fa-solid fa-check-double" : "fa-solid fa-cloud-arrow-down",
        text: modelsInstalled ? "Verificar / Reparar Modelos YuE2" : "Baixar Modelos YuE2 (Ativar Estúdio ~6 GB)",
        href: "download_models.json",
        description: "Baixar/verificar pesos neurais YuE2 3B e SheetSage2 (~6 GB) + PyTorch (NVIDIA/AMD/CPU)"
      },
      {
        icon: "fa-solid fa-arrows-rotate",
        text: "Atualizar",
        href: "update.json",
        description: "Buscar atualizações do IAPLAY via Git"
      },
      {
        icon: "fa-solid fa-download",
        text: "Instalar / Reinstalar (Escolher Modo)",
        href: "install.json",
        description: "Reinstalar escolhendo entre Modo Completo (YuE2) ou Modo Leve (Prompts)"
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
