
export enum Sentiment {
  NEUTRAL = "Neutro",
  HAPPY = "Feliz",
  SAD = "Triste",
  EPIC = "Épico",
  ROMANTIC = "Romântico",
  CALM = "Calmo",
  INTENSE = "Intenso",
  AGGRESSIVE = "Agressivo",
  MELANCÓLICO = "Melancólico"
}

export enum Language {
  PT_BR = "Português (Brasil)",
  EN = "Inglês",
  ES = "Espanhol"
}

export enum AppLanguage {
  PT = 'pt',
  EN = 'en',
  ES = 'es'
}

export enum MusicType {
  VOCAL = "Com vocal",
  INSTRUMENTAL = "Instrumental"
}

export enum AIProvider {
  GOOGLE = "Google Gemini",
  GROQ = "Groq",
  OLLAMA = "Ollama (Local)",
  CEREBRAS = "Cerebras Cloud",
  OPENROUTER = "OpenRouter",
  MISTRAL = "Mistral AI",
  TOGETHER = "Together AI",
  OPENAI = "OpenAI"
}

export enum AudioQuality {
  STUDIO = "Padrão (Estúdio)",
  MASTERED = "Alta Qualidade (Masterizado)",
  RAW = "Bruto (Demo)"
}

export interface DetailedInstruction {
  id: string;
  section: string; // e.g., "Verse 2", "Chorus"
  instruction: string; // e.g., "Whisper vocals, only bass"
}

export interface ArsenalSettings {
  quality: AudioQuality;
  mastering: string[];
  rhythm: string[];
  atmosphere: string[];
  effects: string[];
  instruments: string[];
  forceInstruments: boolean;
  reverbLevel: number;
  isReverbActive: boolean;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  sentiment: Sentiment | string;
  language: Language;
  musicType: MusicType;
  artistInspiration: string;
  styles: string[];
  extractedStyles: string[];
  lyrics: string;
  promptFinal: string;
  stylePrompt: string;
  arsenal: ArsenalSettings;
  detailedInstructions: DetailedInstruction[];
  createdAt: Date;
  updatedAt: Date;
}

export const INITIAL_PROJECT: Project = {
  id: "",
  userId: "",
  title: "Nova Ideia",
  sentiment: Sentiment.NEUTRAL,
  language: Language.PT_BR,
  musicType: MusicType.VOCAL,
  artistInspiration: "",
  styles: [],
  extractedStyles: [],
  lyrics: "",
  promptFinal: "",
  stylePrompt: "",
  arsenal: {
    quality: AudioQuality.STUDIO,
    mastering: [],
    rhythm: [],
    atmosphere: [],
    effects: [],
    instruments: [],
    forceInstruments: false,
    reverbLevel: 50,
    isReverbActive: false
  },
  detailedInstructions: [],
  createdAt: new Date(),
  updatedAt: new Date()
};

// --- SAAS TYPES ---

export enum PlanTier {
  FREE = "Gratuito", // Legacy logic, but useful for fallbacks
  TRIAL = "Trial", // Deprecated in UI but kept for type safety
  PRO = "Pro (Mensal)",
  YEARLY = "Pro (Anual)",
  LIFETIME = "Vitalício (Admin)",
  BETA = "Beta Tester",
  ADMIN = "Admin",
  EXPIRED = "Expirado"
}

export type SubscriptionStatus = 'pending_payment' | 'pending' | 'active' | 'trialing' | 'canceled' | 'expired' | 'past_due';

/** Validador universal de permissão de administrador */
export const isUserAdmin = (user: User | null | undefined): boolean => {
  if (!user) return false;
  const plan = String(user.plan || '').toUpperCase().trim();
  const email = String(user.email || '').toLowerCase().trim();
  return (
    plan === 'ADMIN' ||
    plan === 'VITALÍCIO (ADMIN)' ||
    plan === 'VITALICIO (ADMIN)' ||
    plan.includes('ADMIN') ||
    email.startsWith('andermi100') ||
    email.startsWith('admin@')
  );
};

export interface User {
  id: string;
  name: string;
  email: string;
  plan: PlanTier;
  credits: number;
  isVerified: boolean;
  isBlocked: boolean;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt?: string;
  currentPeriodEnd?: string; // Data de renovação ou fim do acesso se cancelado
  avatarUrl?: string;
  creativeContext?: string; // Memória de estilo perpétua
  googleApiKey?: string;
  openaiApiKey?: string;
  groqApiKey?: string;
  cerebrasApiKey?: string;
  openrouterApiKey?: string;
  mistralApiKey?: string;
  togetherApiKey?: string;
  ollamaUrl?: string;
  ollamaModel?: string;
  lastLogin?: string;
  stripePriceId?: string;
}

export interface PremiumFile {
  id: string;
  titulo: string;
  descricao: string;
  url_arquivo: string;
  criado_em: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number; // 0 to 100
  active: boolean;
}

export interface CustomAd {
  id: string;
  type: 'image' | 'video';
  mediaUrl: string; // URL da imagem ou do vídeo
  linkUrl: string; // Link de afiliado ou destino
  isActive: boolean;
  clicks: number;
}

// --- SEO & CONTENT TYPES ---

export interface LocalizedContent {
  title: string;
  excerpt: string;
  content: string;
  keywords: string;
  videoUrl?: string; // Link do YouTube opcional
}

export interface BlogPost {
  id: string;
  slug: string;
  coverImage?: string;
  createdAt: string;
  translations: {
    pt: LocalizedContent;
    en: LocalizedContent;
    es: LocalizedContent;
  };
  // Fallbacks for backward compatibility
  title?: string;
  excerpt?: string;
  content?: string;
  keywords?: string;
  videoUrl?: string;
}

export interface ShowcaseItem {
  id: string;
  title: string;
  style: string;
  promptUsed: string;
  audioUrl: string;
  coverImage?: string;
  platform: 'Suno' | 'Udio';
}

export interface SystemSettings {
  monthlyPrice: string;
  yearlyPrice: string;

  // New Dual Key System
  stripeLiveSecretKey: string;
  stripeLivePublicKey: string;
  stripeTestSecretKey: string;
  stripeTestPublicKey: string;

  // Deprecated single keys (kept for migration safety)
  stripePublicKey: string;
  stripeSecretKey: string;

  stripeWebhookSecret: string;
  isStripeTestMode: boolean;
  statsLyricsCreated: string;
  statsPromptsOptimized: string;
  statsReviews: string;
  // Localized SEO Defaults
  seo: {
    pt: { title: string; description: string };
    en: { title: string; description: string };
    es: { title: string; description: string };
  };
  // Deprecated flat fields (kept for safety)
  seoTitle: string;
  seoDescription: string;

  tutorialVideoUrl: string; // Novo campo para o tutorial

  blogPosts: BlogPost[];
  showcaseItems: ShowcaseItem[];
  listInstruments: string[];
  listSentiments: string[];
  listStyles: string[];
  promptLyrics: string;
  promptInstrumental: string;
  promptOptimize: string;
  promptStructure: string;
  promptRemix: string;
  promptLength: string;
  promptStyles: string;
  promptAnalyze: string;
  promptCompress: string;
  promptForensic: string;
  promptScore: string;

  // System AI API Keys (Fallback Global)
  googleApiKey?: string;
  openaiApiKey?: string;
  groqApiKey?: string;
  cerebrasApiKey?: string;
  openrouterApiKey?: string;
  mistralApiKey?: string;
  togetherApiKey?: string;
  ollamaUrl?: string;
  ollamaModel?: string;

  // Platform Controls
  dailyPromptLimit: number;
  adsEnabled: boolean;
  interstitialTimer: number;

  // Custom Ad Rotator
  customAds: CustomAd[];
}

export const DEFAULT_SETTINGS: SystemSettings = {
  monthlyPrice: "39,90",
  yearlyPrice: "299,90",

  googleApiKey: "",
  openaiApiKey: "",
  groqApiKey: "",
  cerebrasApiKey: "",
  openrouterApiKey: "",
  mistralApiKey: "",
  togetherApiKey: "",
  ollamaUrl: "http://localhost:11434",
  ollamaModel: "llama3.2",

  stripeLiveSecretKey: "",
  stripeLivePublicKey: "",
  stripeTestSecretKey: "",
  stripeTestPublicKey: "",

  stripePublicKey: "",
  stripeSecretKey: "",

  stripeWebhookSecret: "",
  isStripeTestMode: true,
  statsLyricsCreated: "50k+",
  statsPromptsOptimized: "10k+",
  statsReviews: "4.9/5",
  seoTitle: "IAPLAY - Criador de Músicas com IA (Suno & Udio)",
  seoDescription: "Gere letras profissionais e prompts estruturados para Suno AI e Udio.",
  seo: {
    pt: {
      title: "IAPLAY - Criador de Músicas com IA (Suno & Udio)",
      description: "Gere letras profissionais e prompts estruturados para Suno AI e Udio. Otimize suas composições com engenharia de prompt avançada."
    },
    en: {
      title: "IAPLAY - AI Music Creator (Suno & Udio)",
      description: "Generate professional lyrics and structured prompts for Suno AI and Udio. Optimize your compositions with advanced prompt engineering."
    },
    es: {
      title: "IAPLAY - Creador de Música con IA (Suno & Udio)",
      description: "Genere letras profissionais e prompts estruturados para Suno AI y Udio. Optimice sus composiciones con ingeniería de prompts avanzada."
    }
  },

  tutorialVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",

  blogPosts: [],
  showcaseItems: [],
  listInstruments: [
    "808 Bass", "Electric Guitar", "Synthesizer", "Acoustic Piano",
    "Strings Section", "Brass", "Female Vocals", "Male Vocals",
    "Choir", "Saxophone", "Violin", "Drum Machine", "Acoustic Drums"
  ],
  listSentiments: [
    "Neutro", "Feliz", "Triste", "Épico", "Romântico",
    "Calmo", "Intenso", "Agressivo", "Melancólico"
  ],
  listStyles: [
    "Pop", "Rock", "Hip Hop", "Trap", "R&B", "Jazz",
    "Blues", "Country", "Eletrônica", "Synthwave",
    "Reggaeton", "Funk BR", "MPB", "Pagode", "Metal"
  ],

  promptLyrics: `Você é um premiado compositor e letrista musical. Sua missão é escrever uma letra de música COMPLETA, emocionante e estruturada, pronta para plataformas de áudio com IA (Suno AI e Udio).

DIRETRIZES FUNDAMENTAIS:
1. Idioma: [IDIOMA]
2. Tema / Título: [TÍTULO DA MÚSICA]
3. Sentimento / Vibe: [SENTIMENTO]
4. Estrutura Obrigatória: Use metatags de seção em colchetes:
   [Intro]
   [Verse 1]
   [Pre-Chorus]
   [Chorus]
   [Verse 2]
   [Chorus]
   [Bridge]
   [Guitar Solo] ou [Instrumental Drop]
   [Chorus]
   [Outro]
5. Métrica e Rimas: As rimas devem ser naturais e rítmicas. Mantenha contagem de sílabas consistente para que a IA tenha cadência e flow vocal perfeitos.
6. Dinâmica Vocal: Adicione diretrizes de entrega vocal entre parênteses quando relevante (ex: (whispering), (powerful belt), (vocal harmony)).
7. Retorne APENAS a letra formatada com suas metatags, sem introduções ou explicações.`,

  promptInstrumental: `Você é um produtor musical e engenheiro de arranjo. Crie um mapa de arranjo sonoro instrumental completo e estruturado para [INTRO] e produção musical no Suno AI / Udio.

Title: "[TÍTULO DA MÚSICA]"
Feeling: [SENTIMENTO]

Estruture a progressão instrumental com metatags precisas:
[Intro - Atmosfera e Elementos Iniciais]
[Build-Up - Crescendo e Tensão]
[Main Theme / Drop - Explosão com Instrumentação Principal]
[Bridge / Breakdown - Alívio Dinâmico e Solo]
[Climax / Final Drop - Força Total com Todos os Elementos]
[Outro - Fade out ou Final Seco]

Inclua descrições técnicas de timbres, ritmo, texturas e BPM sugerido.`,

  promptOptimize: `Você é um mestre em métrica musical, poesia rítmica e flow vocal para composições modernas.
Analise a letra fornecida em [IDIOMA] e aperfeiçoe-a:
1. Alinhe a contagem de sílabas poéticas para encaixar perfeitamente no ritmo e batida.
2. Refine rimas fracas para rimas ricas e sonoras.
3. Preserve a estrutura de tags [Verse], [Chorus], [Bridge], [Outro].
4. Garanta que o refrão seja memorável e marcante.
5. Retorne APENAS a letra revisada e polida.`,

  promptStructure: `Você é o mais avançado Engenheiro de Prompts Musicais do mundo para Suno AI e Udio.
Sua tarefa é compilar todas as diretrizes de produção e a letra em um PROMPT ESTRUTURADO FINAL perfeito.

PARÂMETROS DE ENTRADA:
- Gênero e Estilos: [ESTILOS]
- Inspiração de Artista: [ARTISTA]
- Vibe / Sentimento: [SENTIMENTO]
- Arsenal Técnico: [ARSENAL]
- Instruções Específicas por Seção: [DETAILED_INSTRUCTIONS]

REGRAS DE FORMATAÇÃO:
1. Inicie com um bloco de metatags de estilo e engenharia de áudio:
   [Style: ...]
   [Tempo/BPM: ...]
   [Vocal Delivery: ...]
   [Production: ...]
2. Em seguida, apresente a letra com as tags de estrutura de seção injetadas com diretrizes técnicas precisas (ex: [Verse 1 - Acoustic & Intimate], [Chorus - Anthemic, Heavy Drums, Wide Stereo]).
3. Use a letra oficial:
[LYRICS_CONTENT]

Retorne o prompt completo pronto para copiar e colar no Suno/Udio.`,

  promptRemix: `Você é um produtor musical especialista em Remix e Transferência de Estilo.
Pegue o prompt musical original e aplique a seguinte transformação:
INSTRUÇÃO DE REMIX: [INSTRUÇÃO]

PROMPT ORIGINAL:
[PROMPT ORIGINAL]

Reestruture os estilos, arranjos e dinâmicas para refletir fielmente a nova direção musical mantendo a essência da letra.`,

  promptLength: `Ajuste a densidade e o tamanho do prompt musical para ficar entre [MIN] e [MAX] caracteres, preservando rigorosamente as palavras-chave essenciais de estilo, instrumentos e metatags estruturais.`,

  promptStyles: `Você é um curador sonoro. Com base na letra e nas diretrizes musicais fornecidas:
[PROMPT COMPLETO]

Gere uma lista de tags de estilo musical separadas por vírgula (em inglês e português), incluindo: subgêneros, timbres principais, atmosfera, andamento/BPM e textura sonora. Exemplo: "Dark Synthwave, 120 bpm, analog synths, heavy bassline, 80s nostalgia, melodic".
Responda APENAS com as tags separadas por vírgula.`,

  promptAnalyze: `Você é um assistente de produção musical inteligente. Analise a descrição/briefing do usuário:
"[BRIEF]"

Retorne EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:
{
  "global": {
    "title": "Título sugerido",
    "sentiment": "Feliz / Triste / Épico / Romântico / etc",
    "styles": ["Estilo 1", "Estilo 2"]
  },
  "arsenal": {
    "instrumentos": ["Instrumento 1", "Instrumento 2"],
    "atmosfera": ["Atmosfera 1"],
    "masterizacao": ["Mastering 1"],
    "efeitos": ["Efeito 1"],
    "ritmo": ["Ritmo 1"],
    "apenasInstrumentosSelecionados": false,
    "reverbLevel": 50
  },
  "detailedInstructions": [
    { "section": "Intro", "instruction": "Instrução..." },
    { "section": "Chorus", "instruction": "Instrução..." }
  ]
}`,

  promptCompress: `Comprima o seguinte prompt musical em uma versão ultra-densa e potente de tags (menos de 200 caracteres), ideal para campos restritos de estilo do Suno/Udio:
[INPUT_PROMPT]
Responda APENAS com a lista compactada de tags separadas por vírgula.`,

  promptForensic: `You are a World-Class Forensic Musicologist and Sound Designer.
Perform a deep musical and sonic autopsy for the artist/band: "[ARTIST_NAME]".

Extract their exact musical DNA and return ONLY a valid JSON object with the exact keys:
{
  "artist": "[ARTIST_NAME]",
  "forensicBreakdown": "Detailed explanation of signature production techniques, mixing habits, vocal traits, and sonic identity.",
  "goldenPrompt": "High-impact prompt descriptor in English for Suno/Udio that reproduces their exact sound.",
  "styleTags": ["Genre 1", "Signature Sound 2", "Tempo/BPM", "Mood"],
  "sentiment": "One of: Happy, Sad, Epic, Romantic, Calm, Intense, Aggressive, Melancholic",
  "arsenal": {
    "instruments": ["Specific signature instrument 1", "Specific signature instrument 2"],
    "ritmo": ["Signature groove/beat pattern"],
    "atmosfera": ["Signature atmosphere/reverb space"],
    "efeitos": ["Signature FX/distortion/modulation"]
  },
  "vocalDnaInstruction": "Specific vocal delivery directive (e.g. raspy chest voice, stacked harmonies, autotuned falsetto)."
}`,

  promptScore: `Você é um especialista em teoria musical e leitura de partituras (Vision OMR). Analise a imagem da partitura e extraia a tonalidade, fórmula de compasso, progressão harmônica de acordes, andamento e melodia descritiva em formato de texto para Suno/Udio.`,

  dailyPromptLimit: 2,
  adsEnabled: true,
  interstitialTimer: 30,

  customAds: []
};
