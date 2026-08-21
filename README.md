<div align="center">

# 🎵 IAPLAY Studio — Compositor Musical com IA

**O Estúdio Definitivo para Criação de Letras, Estruturação de Prompts para Suno & Udio e Gestão Musical Inteligente.**

[![Pinokio Compatible](https://img.shields.io/badge/Pinokio-Ready-blue?style=for-the-badge&logo=electron)](https://pinokio.computer)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-AI-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Ollama](https://img.shields.io/badge/Ollama-Local_AI-black?style=for-the-badge)](https://ollama.com/)

[Funcionalidades](#-principais-funcionalidades) • [Instalação](#-como-instalar-e-rodar) • [Pinokio](#-execução-via-pinokio) • [Estrutura](#-estrutura-do-projeto) • [Licença](#-licença)

</div>

---

## 📖 Sobre o Projeto

O **IAPLAY Studio** (Compositor AI Studio) é uma plataforma SaaS e desktop profissional desenvolvida para transformar a forma como compositores, produtores musicais e criadores de conteúdo criam músicas com Inteligência Artificial.

Projetado especificamente para ecossistemas de geração musical como **Suno AI**, **Udio** e **Maestro**, o IAPLAY Studio conecta modelos de linguagem avançados (Google Gemini e modelos locais via Ollama) a um fluxo de trabalho intuitivo de composição, estruturação de metatags, criação de prompts sonoros e gerenciamento de projetos.

---

## ✨ Principais Funcionalidades

### 1. 🪄 Wizard de Criação Guiada
- **Geração Passo a Passo:** Crie uma música completa do zero definindo tema, gênero, sentimento/emoção, ritmo e público-alvo.
- **Mapeamento de Emoções:** Seleção visual de humores (Alegre, Melancólico, Agressivo, Romântico, Calmo, Intenso) que moldam o tom lírico e harmônico.
- **Configuração de Metadados:** Definição de tom, BPM, instrumentos principais e referências de artistas.

### 2. ✍️ Editor de Letras & Metatags (Suno & Udio)
- **Estruturação Inteligente de Metatags:** Inserção e formatação automática de tags padrão da indústria (`[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, `[Guitar Solo]`, `[Drop]`, `[Outro]`).
- **Geração Seção por Seção:** Crie ou reescreva versos específicos mantendo a coerência lírica, métrica e esquema de rimas.
- **Assistente de Rimas & Sílabas Poéticas:** Sugestões contextuais de rimas ricas, metáforas e contagem silábica para encaixe no ritmo.
- **Editor Rich Text:** Suporte completo a edição rica, formatação, notas de produção e cópia em 1 clique para o Suno/Udio.

### 3. 🎛️ Engenharia de Prompts de Estilo
- **Gerador de Estilos & Timbres:** Construção de descrições sonoras detalhadas combinando subgêneros, épocas, instrumentos acústicos/sintetizados, ambiências e técnicas de mixagem/masterização.
- **Otimizador Anti-Alucinação:** Filtros e formatação testada para evitar comandos ignorados pelas IAs de áudio e obter a máxima fidelidade sonora.

### 4. 🧰 Arsenal Criativo & Presets
- **Biblioteca de Estruturas Musicais:** Templates prontos para diversos estilos (Pop, Rock, Trap, Funk, Sertanejo, Eletrônica, Gospel, Lo-Fi, Reggaeton, etc.).
- **Banco de Ideias e Ganchos (Hooks):** Repositório de ideias de refrões marcantes, pontes e transições.
- **Presets Personalizados:** Salve suas fórmulas musicais e configurações favoritas para reutilizar em futuros projetos.

### 5. 🧠 Suporte Híbrido a Inteligências Artificiais
- **Google Gemini API:** Integração com os modelos mais recentes da Google (Gemini 2.5 Flash, Pro) para alta velocidade e criatividade avançada.
- **Ollama (100% Local & Privado):** Suporte nativo para rodar modelos locais (Llama 3, Mistral, Gemma, Phi-3) direto da sua máquina sem custos de API e com privacidade total.

### 6. 💰 Calculadora de Royalties & Divisão de Splits
- **Divisão de Direitos:** Calcule porcentagens de composição e produção entre co-autores.
- **Simulador de Streaming:** Estimativas de retorno financeiro e projeções de ganhos por plataforma (Spotify, Apple Music, YouTube).

### 7. 🌐 Painel Completo, Tutoriais & Internacionalização
- **Multi-idiomas:** Suporte nativo a Português (PT-BR), Inglês (EN) e Espanhol (ES).
- **Tour Guiado & Tutoriais:** Aulas práticas integradas para dominar a composição com IA.
- **Painel Administrativo & Dashboard:** Gestão completa de projetos, métricas, usuários e configurações do sistema.

---

## 🚀 Como Instalar e Rodar

### Pré-requisitos
- **Node.js** (versão 18 ou superior)
- **NPM** ou **Yarn** / **PNPM**
- Chave de API do **Google Gemini** *(opcional, caso utilize Gemini)* ou **Ollama** instalado *(opcional, caso utilize IA local)*.

### Passo a Passo

1. **Clone o Repositório:**
   ```bash
   git clone https://github.com/IA-Play/compositor-musical-iaplay.git
   cd compositor-musical-iaplay
   ```

2. **Instale as Dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Copie o arquivo de exemplo e insira suas credenciais:
   ```bash
   cp .env.example .env.local
   ```
   *Edite o arquivo `.env.local` adicionando sua `GEMINI_API_KEY` (se aplicável).*

4. **Inicie o Servidor de Desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse a aplicação no navegador em `http://localhost:5173`.

---

## 📌 Execução via Pinokio (1-Click Launcher)

O IAPLAY Studio possui integração total com o [Pinokio](https://pinokio.computer):

- **`install.json`**: Instala automaticamente o Node.js e as dependências do projeto.
- **`start.json`**: Inicia o servidor Vite e abre o estúdio no navegador em 1 clique.
- **`update.json`**: Atualiza o repositório para a versão mais recente com um clique.
- **`pinokio.js`**: Menu visual dinâmico integrado ao ecossistema Pinokio.

---

## 📁 Estrutura do Projeto

```
compositor-musical-iaplay/
├── public/                 # Arquivos públicos, ícones e APIs de suporte
├── src/
│   ├── components/         # Componentes reutilizáveis (Arsenal, Navbar, SEO, etc.)
│   ├── contexts/           # Contextos React (Auth, Idiomas, etc.)
│   ├── locales/            # Traduções e dicionários de idiomas (PT, EN, ES)
│   ├── services/           # Serviços de IA (Gemini, Ollama), Projetos e Configurações
│   ├── utils/              # Funções utilitárias (UUID, formatadores, etc.)
│   ├── views/              # Telas principais (Editor, Wizard, Dashboard, etc.)
│   ├── App.tsx             # Roteamento e estrutura base
│   ├── index.tsx           # Ponto de entrada do React
│   └── types.ts            # Tipagens TypeScript globais
├── pinokio.js              # Script do launcher Pinokio
├── install.json            # Script de instalação Pinokio
├── start.json              # Script de inicialização Pinokio
├── update.json             # Script de atualização Pinokio
├── package.json            # Dependências e scripts Node
├── vite.config.ts          # Configuração de build e servidor Vite
└── README.md               # Documentação oficial
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Lucide Icons](https://lucide.dev/)
- **Inteligência Artificial:** [Google Generative AI (Gemini SDK)](https://ai.google.dev/) & [Ollama API](https://ollama.com/)
- **Distribuição & Launcher:** [Pinokio Ecosystem](https://pinokio.computer)

---

## 🤝 Contribuição

Contribuições são sempre bem-vindas! Sinta-se à vontade para abrir uma *Issue* ou enviar um *Pull Request*:

1. Faça um Fork do projeto
2. Crie uma branch para sua funcionalidade (`git checkout -b feature/minha-feature`)
3. Faça o commit das suas alterações (`git commit -m 'feat: Adiciona nova funcionalidade'`)
4. Envie para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença proprietária / comercial da **IA-Play**.

---

<div align="center">
Desenvolvido com 💜 por <b>IA-Play</b>.
</div>
