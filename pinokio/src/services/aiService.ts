
import { Project, AIProvider, ArsenalSettings, DetailedInstruction, Language, MusicType, Sentiment } from "../types";
import { getSystemSettings } from "./settingsService";

// --- API CLIENTS WITH INTERNAL ROTATION (VIA SECURE BACKEND) ---

// --- API CLIENTS WITH INTERNAL ROTATION (VIA SECURE BACKEND) ---

// --- DIRECT CLIENT-SIDE AI GENERATION ENGINE ---

const getStoredUserKeys = () => {
    let keys: Record<string, string> = {
        google: '',
        openai: '',
        groq: '',
        cerebras: '',
        openrouter: '',
        mistral: '',
        together: '',
        ollamaUrl: 'http://localhost:11434',
        ollamaModel: 'llama3.2'
    };

    try {
        const stored = localStorage.getItem('iaplay_session');
        if (stored) {
            const parsed = JSON.parse(stored);
            keys.google = parsed.googleApiKey || parsed.google || parsed.google_api_key || keys.google;
            keys.openai = parsed.openaiApiKey || parsed.openai || parsed.openai_api_key || keys.openai;
            keys.groq = parsed.groqApiKey || parsed.groq || parsed.groq_api_key || keys.groq;
            keys.cerebras = parsed.cerebrasApiKey || parsed.cerebras || parsed.cerebras_api_key || keys.cerebras;
            keys.openrouter = parsed.openrouterApiKey || parsed.openrouter || parsed.openrouter_api_key || keys.openrouter;
            keys.mistral = parsed.mistralApiKey || parsed.mistral || parsed.mistral_api_key || keys.mistral;
            keys.together = parsed.togetherApiKey || parsed.together || parsed.together_api_key || keys.together;
            keys.ollamaUrl = parsed.ollamaUrl || parsed.ollama_url || keys.ollamaUrl;
            keys.ollamaModel = parsed.ollamaModel || parsed.ollama_model || keys.ollamaModel;
        }
    } catch (e) {}

    try {
        const sys = getSystemSettings();
        if (sys) {
            if (!keys.google && sys.googleApiKey) keys.google = sys.googleApiKey;
            if (!keys.groq && sys.groqApiKey) keys.groq = sys.groqApiKey;
            if (!keys.openai && sys.openaiApiKey) keys.openai = sys.openaiApiKey;
            if (!keys.openrouter && sys.openrouterApiKey) keys.openrouter = sys.openrouterApiKey;
            if (!keys.cerebras && sys.cerebrasApiKey) keys.cerebras = sys.cerebrasApiKey;
            if (!keys.mistral && sys.mistralApiKey) keys.mistral = sys.mistralApiKey;
            if (!keys.together && sys.togetherApiKey) keys.together = sys.togetherApiKey;
            if (sys.ollamaUrl && keys.ollamaUrl === 'http://localhost:11434') keys.ollamaUrl = sys.ollamaUrl;
            if (sys.ollamaModel && keys.ollamaModel === 'llama3.2') keys.ollamaModel = sys.ollamaModel;
        }
    } catch (e) {}

    try {
        if (!keys.google && (import.meta as any).env?.VITE_GEMINI_API_KEY) {
            keys.google = (import.meta as any).env.VITE_GEMINI_API_KEY;
        }
        if (!keys.groq && (import.meta as any).env?.VITE_GROQ_API_KEY) {
            keys.groq = (import.meta as any).env.VITE_GROQ_API_KEY;
        }
    } catch (e) {}

    return keys;
};

const extractKeys = (raw: string | undefined): string[] => {
    if (!raw) return [];
    return raw
        .split(/[\n,;]+/)
        .map(k => k.trim())
        .filter(k => k.length > 5 && !k.includes('...') && !k.includes('***'));
};

// 1. GOOGLE GEMINI (Direct Client-Side)
const callGoogle = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    const keys = [
        ...extractKeys(userKeys.google),
        ...extractKeys(settings.googleApiKey)
    ];

    if (keys.length === 0) {
        throw new Error("Nenhuma chave do Google Gemini configurada. Vá em 'Chaves de IA & Ollama' e insira sua chave da Google AI Studio (ou utilize o Ollama 100% grátis).");
    }

    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-lite'];
    let lastError = "";

    for (const key of keys) {
        for (const model of models) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
                const body: any = {
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: prompt }]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7
                    }
                };

                if (systemInstruction) {
                    body.systemInstruction = {
                        parts: [{ text: systemInstruction }]
                    };
                }

                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    continue;
                }

                const data = await res.json();
                const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                lastError = err.message || String(err);
            }
        }
    }

    throw new Error(`Google Gemini Error: ${lastError || "Todas as chaves/modelos falharam."}`);
};

// 2. GROQ (Direct Client-Side)
const callGroq = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    const keys = [
        ...extractKeys(userKeys.groq),
        ...extractKeys(settings.groqApiKey)
    ];

    if (keys.length === 0) {
        throw new Error("Nenhuma chave da Groq configurada. Vá em 'Chaves de IA & Ollama' e insira sua chave da Groq.");
    }

    const models = [
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'llama3-70b-8192',
        'llama3-8b-8192'
    ];
    let lastError = "";

    for (const key of keys) {
        for (const model of models) {
            try {
                const messages: any[] = [];
                if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key.trim()}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    const msg = errData?.error?.message || `HTTP ${res.status}`;
                    console.warn(`[Groq] Modelo ${model} falhou:`, msg);
                    lastError = msg;
                    continue;
                }

                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                lastError = err.message || String(err);
                console.warn(`[Groq] Erro de rede no modelo ${model}:`, lastError);
            }
        }
    }

    throw new Error(`Groq Error: ${lastError || "Todas as tentativas falharam."}`);
};

// 3. OPENROUTER (Direct Client-Side)
const callOpenRouter = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    const keys = [
        ...extractKeys(userKeys.openrouter),
        ...extractKeys(settings.openrouterApiKey)
    ];

    if (keys.length === 0) {
        throw new Error("Nenhuma chave do OpenRouter configurada. Vá em 'Chaves de IA & Ollama' e insira sua chave do OpenRouter.");
    }

    const models = [
        'google/gemini-2.0-flash-lite:free',
        'meta-llama/llama-3.3-70b-instruct:free',
        'deepseek/deepseek-r1:free',
        'qwen/qwen-2.5-coder-32b-instruct',
        'openrouter/auto'
    ];
    let lastError = "";

    for (const key of keys) {
        for (const model of models) {
            try {
                const messages: any[] = [];
                if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`,
                        'HTTP-Referer': 'http://localhost:5173',
                        'X-Title': 'IAPLAY Studio'
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    continue;
                }

                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                lastError = err.message || String(err);
            }
        }
    }

    throw new Error(`OpenRouter Error: ${lastError || "Todas as tentativas falharam."}`);
};

// 4. CEREBRAS (Direct Client-Side)
const callCerebras = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    const keys = [
        ...extractKeys(userKeys.cerebras),
        ...extractKeys(settings.cerebrasApiKey)
    ];

    if (keys.length === 0) {
        throw new Error("Nenhuma chave da Cerebras configurada. Vá em 'Chaves de IA & Ollama' e insira sua chave da Cerebras.");
    }

    const models = ['llama-3.3-70b', 'llama3.1-8b', 'llama3.1-70b'];
    let lastError = "";

    for (const key of keys) {
        for (const model of models) {
            try {
                const messages: any[] = [];
                if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    continue;
                }

                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                lastError = err.message || String(err);
            }
        }
    }

    throw new Error(`Cerebras Error: ${lastError || "Todas as tentativas falharam."}`);
};

// 5. OPENAI (Direct Client-Side)
const callOpenAI = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    const keys = [
        ...extractKeys(userKeys.openai),
        ...extractKeys(settings.openaiApiKey)
    ];

    if (keys.length === 0) {
        throw new Error("Nenhuma chave da OpenAI configurada. Vá em 'Chaves de IA & Ollama' e insira sua chave da OpenAI.");
    }

    const models = ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'];
    let lastError = "";

    for (const key of keys) {
        for (const model of models) {
            try {
                const messages: any[] = [];
                if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    continue;
                }

                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                lastError = err.message || String(err);
            }
        }
    }

    throw new Error(`OpenAI Error: ${lastError || "Todas as tentativas falharam."}`);
};

// 6. MISTRAL (Direct Client-Side)
const callMistral = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    const keys = [
        ...extractKeys(userKeys.mistral),
        ...extractKeys(settings.mistralApiKey)
    ];

    if (keys.length === 0) {
        throw new Error("Nenhuma chave da Mistral configurada. Vá em 'Chaves de IA & Ollama' e insira sua chave da Mistral.");
    }

    const models = ['mistral-small-latest', 'open-mistral-7b', 'pixtral-12b-2409'];
    let lastError = "";

    for (const key of keys) {
        for (const model of models) {
            try {
                const messages: any[] = [];
                if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    continue;
                }

                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                lastError = err.message || String(err);
            }
        }
    }

    throw new Error(`Mistral Error: ${lastError || "Todas as tentativas falharam."}`);
};

// 7. TOGETHER (Direct Client-Side)
const callTogether = async (prompt: string, systemInstruction?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    const keys = [
        ...extractKeys(userKeys.together),
        ...extractKeys(settings.togetherApiKey)
    ];

    if (keys.length === 0) {
        throw new Error("Nenhuma chave da Together AI configurada. Vá em 'Chaves de IA & Ollama' e insira sua chave da Together AI.");
    }

    const models = [
        'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        'deepseek-ai/DeepSeek-R1-Distill-Llama-70B'
    ];
    let lastError = "";

    for (const key of keys) {
        for (const model of models) {
            try {
                const messages: any[] = [];
                if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
                messages.push({ role: 'user', content: prompt });

                const res = await fetch('https://api.together.xyz/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${key}`
                    },
                    body: JSON.stringify({
                        model,
                        messages,
                        temperature: 0.7
                    })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}));
                    lastError = errData?.error?.message || `HTTP ${res.status}`;
                    continue;
                }

                const data = await res.json();
                const text = data?.choices?.[0]?.message?.content;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } catch (err: any) {
                lastError = err.message || String(err);
            }
        }
    }

    throw new Error(`Together AI Error: ${lastError || "Todas as tentativas falharam."}`);
};

// 8. OLLAMA (LOCAL 100% OFFLINE) CALLER
export const callOllama = async (prompt: string, systemInstruction?: string, model?: string, url?: string): Promise<string> => {
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();

    const endpoint = (url || userKeys.ollamaUrl || settings.ollamaUrl || 'http://localhost:11434').replace(/\/+$/, '');
    let modelToUse = (model || userKeys.ollamaModel || settings.ollamaModel || 'llama3.2').trim();

    // Consulta os modelos atualmente baixados no Ollama para evitar 400 Bad Request
    try {
        const tagsRes = await fetch(`${endpoint}/api/tags`).catch(() => null);
        if (tagsRes && tagsRes.ok) {
            const tagsData = await tagsRes.json().catch(() => ({}));
            if (tagsData.models && Array.isArray(tagsData.models) && tagsData.models.length > 0) {
                const availableNames: string[] = tagsData.models.map((m: any) => m.name || m.model).filter(Boolean);
                const exactMatch = availableNames.find((n: string) => n === modelToUse || n.startsWith(`${modelToUse}:`) || modelToUse.startsWith(`${n}:`));
                if (exactMatch) {
                    modelToUse = exactMatch;
                } else if (!availableNames.includes(modelToUse) && availableNames.length > 0) {
                    // Seleciona automaticamente o primeiro modelo válido instalado
                    modelToUse = availableNames[0];
                }
            }
        }
    } catch (e) {}

    // 1. Try native Ollama endpoint /api/generate
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const res = await fetch(`${endpoint}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelToUse,
                prompt: prompt,
                system: systemInstruction,
                stream: false
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (data.response) return data.response.trim();
        }
    } catch (e) {}

    // 2. Fallback to OpenAI-compatible /v1/chat/completions
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);

        const messages: any[] = [];
        if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
        messages.push({ role: 'user', content: prompt });

        const res = await fetch(`${endpoint}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelToUse,
                messages,
                temperature: 0.7
            }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            const text = data?.choices?.[0]?.message?.content;
            if (text) return text.trim();
        }
    } catch (e) {}

    throw new Error(`Falha ao conectar no Ollama (${endpoint}). Certifique-se de que o Ollama está aberto no seu PC/Pinokio e há pelo menos um modelo disponível (modelo tentado: '${modelToUse}').`);
};

const executeProvider = async (prompt: string, provider: AIProvider, systemInstruction?: string): Promise<string> => {
    switch (provider) {
        case AIProvider.OLLAMA:
            return await callOllama(prompt, systemInstruction);
        case AIProvider.GROQ:
            return await callGroq(prompt, systemInstruction);
        case AIProvider.OPENROUTER:
            return await callOpenRouter(prompt, systemInstruction);
        case AIProvider.CEREBRAS:
            return await callCerebras(prompt, systemInstruction);
        case AIProvider.OPENAI:
            return await callOpenAI(prompt, systemInstruction);
        case AIProvider.MISTRAL:
            return await callMistral(prompt, systemInstruction);
        case AIProvider.TOGETHER:
            return await callTogether(prompt, systemInstruction);
        case AIProvider.GOOGLE:
        default:
            return await callGoogle(prompt, systemInstruction);
    }
};

const unifiedGenerate = async (prompt: string, provider: AIProvider = AIProvider.GOOGLE, systemInstruction?: string): Promise<string> => {
    let primaryErrorMsg = "";
    const fallbackErrors: string[] = [];

    try {
        return await executeProvider(prompt, provider, systemInstruction);
    } catch (primaryError: any) {
        primaryErrorMsg = primaryError.message || String(primaryError);
        console.warn(`[Fallback] Fornecedor primário (${provider}) falhou:`, primaryErrorMsg);

        // Ordem estratégica de fallback para outros provedores disponíveis
        const fallbacks = [
            AIProvider.GROQ,
            AIProvider.GOOGLE,
            AIProvider.OLLAMA,
            AIProvider.OPENROUTER,
            AIProvider.CEREBRAS,
            AIProvider.MISTRAL,
            AIProvider.TOGETHER,
            AIProvider.OPENAI
        ].filter(p => p !== provider);

        for (const fb of fallbacks) {
            try {
                console.log(`[Fallback] Tentando fornecedor alternativo: ${fb}...`);
                const result = await executeProvider(prompt, fb, systemInstruction);
                console.log(`[Fallback] Sucesso com ${fb}!`);
                return result;
            } catch (err: any) {
                const errMsg = err.message || String(err);
                fallbackErrors.push(`[${fb}] -> ${errMsg}`);
            }
        }

        throw new Error(`Erro na geração da IA (${provider}):\n${primaryErrorMsg}`);
    }
};



// --- HELPER: Garante que um valor seja sempre um array ---
const ensureArray = (value: any): string[] => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (typeof value === 'string' && value.trim()) return [value.trim()];
    return [];
};

// --- HELPER TO FORMAT ARSENAL ---
const formatArsenalForPrompt = (arsenal: ArsenalSettings): string => {
    const instruments = ensureArray(arsenal.instruments);
    const atmosphere = ensureArray(arsenal.atmosphere);
    const mastering = ensureArray(arsenal.mastering);
    const effects = ensureArray(arsenal.effects);
    const rhythm = ensureArray(arsenal.rhythm);

    return `
    - Instruments (High Priority): ${instruments.join(", ") || "Free Choice"}
    - Atmosphere: ${atmosphere.join(", ") || "Standard"}
    - Reverb: ${arsenal.isReverbActive ? `Active (${arsenal.reverbLevel !== undefined ? arsenal.reverbLevel : 50}%)` : "Dry"}
    - Mastering: ${mastering.join(", ") || "Standard"}
    - Effects: ${effects.join(", ") || "None"}
    - Rhythm: ${rhythm.join(", ") || "Standard"}
    - Constraint: ${arsenal.forceInstruments ? "STRICT: Use ONLY listed instruments." : "Flexible."}
  `;
};

// 1️⃣ & 2️⃣ — GENERATE LYRICS or INSTRUMENTAL
export const generateLyrics = async (
    project: Project,
    provider: AIProvider,
    currentInput: string = "",
    creativeContext?: string
): Promise<string> => {
    try {
        const settings = getSystemSettings();
        let prompt = "";
        const styles = ensureArray(project.styles);

        // Converte os estilos selecionados em uma string
        const styleContext = styles.length > 0 ? styles.join(", ") : "Livre";

        if (project.musicType === MusicType.INSTRUMENTAL) {
            prompt = settings.promptInstrumental
                .replace("[INTRO]", "Intro")
                .replace("[TÍTULO DA MÚSICA]", project.title)
                .replace("[SENTIMENTO]", project.sentiment)
                .replace("Title:", `Title: "${project.title}"`)
                + `\n\nCONTEXT:\nTitle: ${project.title}\nFeeling: ${project.sentiment}\nStyles: ${styles.join(", ")}`;
        } else {
            const userInstruction = currentInput.trim().length > 0 ? currentInput : project.title;
            prompt = settings.promptLyrics
                .replace("[IDIOMA]", project.language)
                .replace("[TÍTULO DA MÚSICA]", userInstruction)
                .replace("[SENTIMENTO]", project.sentiment)
                .replace("[ESTILOS]", styleContext);

            // Se o usuário acidentalmente removeu a tag [TÍTULO DA MÚSICA] de suas configurações no painel admin,
            // garantimos que a instrução do tema ainda será passada à IA.
            if (!settings.promptLyrics.includes("[TÍTULO DA MÚSICA]")) {
                prompt += `\n\nTEMA FORNECIDO PELO USUÁRIO (Obrigatório seguir): ${userInstruction}`;
            }

            // INJEÇÃO RÍGIDA DE ESTILO (apenas se a tag [ESTILOS] não estiver já no prompt mestre)
            if (!settings.promptLyrics.includes("[ESTILOS]")) {
                prompt += `\n\nESTILO MUSICAL ALVO: ${styleContext} (Use APENAS o vocabulário e a temática deste gênero. Se for Gospel, use linguagem cristã. Se for Trap, use gírias urbanas. Se for MPB, use poesia culta. NÃO MISTURE GÊNEROS).`;
            }

            if (project.artistInspiration) {
                prompt += `\n\nINSPIRAÇÃO DE ARTISTA: Tente emular o estilo de escrita de: ${project.artistInspiration}, mas mantendo a fidelidade ao estilo musical solicitado acima.`;
            }

            if (creativeContext && creativeContext.trim().length > 0) {
                prompt += `\n\n[MEMÓRIA CRIATIVA / DNA SÔNICO DO ARTISTA]\nO usuário definiu suas regras perenes de composição: "${creativeContext}"\n**INSTRUÇÃO CRÍTICA: Você DEVE observar e aplicar essas preferências estéticas na letra gerada.**`;
            }
        }

        console.log("=== ENVIANDO PARA A IA ===");
        console.log(prompt);
        console.log("==========================");

        return await unifiedGenerate(prompt, provider);
    } catch (error) {
        console.error("Erro ao gerar letra:", error);
        throw error;
    }
};

// 3️⃣ — OTIMIZAR LETRA
export const optimizeLyrics = async (lyrics: string): Promise<string> => {
    const settings = getSystemSettings();
    let prompt = settings.promptOptimize
        .replace("[IDIOMA]", "Português (Brasil)");
    
    if (prompt.includes("[LYRICS_CONTENT]")) {
        prompt = prompt.replace("[LYRICS_CONTENT]", lyrics);
    } else {
        prompt += `\n\n[LETRA ORIGINAL]\n${lyrics}`;
    }
    return await unifiedGenerate(prompt, AIProvider.GOOGLE);
};

// 4️⃣ — ESTRUTURAR PROMPT
export const structureSunoPrompt = async (
    project: Project,
    provider: AIProvider
): Promise<string> => {
    try {
        const settings = getSystemSettings();
        const detailedInstructions = project.detailedInstructions.map(d => `- SECTION [${d.section}]: ${d.instruction}`).join("\n");
        const arsenalData = formatArsenalForPrompt(project.arsenal);
        const styles = ensureArray(project.styles);

        let prompt = settings.promptStructure
            .replace("[IDIOMA]", project.language)
            .replace("[ESTILOS]", styles.join(", "))
            .replace("[ARTISTA]", project.artistInspiration || "Creative Freedom")
            .replace("[SENTIMENTO]", project.sentiment)
            .replace("[ARSENAL]", arsenalData)
            .replace("[DETAILED_INSTRUCTIONS]", detailedInstructions || "None.");

        if (prompt.includes("[LYRICS_CONTENT]")) {
            prompt = prompt.replace("[LYRICS_CONTENT]", project.lyrics);
        }
        else if (prompt.includes("[LYRICS INPUT]")) {
            const inputPayload = `
### OFFICIAL LYRICS (DO NOT MODIFY):
${project.lyrics}

### ADDITIONAL PRODUCTION INSTRUCTIONS:
${detailedInstructions || "No additional specific instructions."}
        `.trim();
            prompt = prompt.replace("[LYRICS INPUT]", inputPayload);
        }
        else {
            prompt += `\n\n[LYRICS]\n${project.lyrics}`;
        }

        return await unifiedGenerate(prompt, provider, undefined, "structureSunoPrompt");
    } catch (error) {
        console.error("Erro ao estruturar prompt:", error);
        throw error;
    }
};





// --- OTHERS ---

export const remixStructure = async (currentPrompt: string, instruction: string): Promise<string> => {
    const settings = getSystemSettings();
    const prompt = settings.promptRemix
        .replace("[INSTRUÇÃO]", instruction)
        .replace("[PROMPT ORIGINAL]", currentPrompt);
    return await unifiedGenerate(prompt, AIProvider.GOOGLE);
};

export const adjustPromptLength = async (currentPrompt: string, min: number = 100, max: number = 3000): Promise<string> => {
    const settings = getSystemSettings();
    const prompt = settings.promptLength
        .replace("[MIN]", min.toString())
        .replace("[MAX]", max.toString())
        + `\n\nINPUT PROMPT:\n${currentPrompt}`;
    try { return await unifiedGenerate(prompt, AIProvider.GOOGLE); } catch (e) { return currentPrompt; }
};

export const compressFinalPrompt = async (currentPrompt: string, provider: AIProvider = AIProvider.GOOGLE): Promise<string> => {
    const settings = getSystemSettings();
    let prompt = settings.promptCompress;
    if (prompt.includes("[PROMPT ORIGINAL]")) {
        prompt = prompt.replace("[PROMPT ORIGINAL]", currentPrompt);
    } else if (prompt.includes("[INPUT_PROMPT]")) {
        prompt = prompt.replace("[INPUT_PROMPT]", currentPrompt);
    } else {
        prompt += `\n\n${currentPrompt}`;
    }
    try { return await unifiedGenerate(prompt, provider); } catch (e) { throw new Error("Falha ao comprimir."); }
};

export const generateStyleTags = async (fullPrompt: string, provider: AIProvider = AIProvider.GOOGLE): Promise<string> => {
    const settings = getSystemSettings();
    const basePrompt = settings.promptStyles.replace("[PROMPT COMPLETO]", fullPrompt);
    
    // INSTRUÇÃO RÍGIDA para forçar a IA a manter os estilos do usuário
    const rigidInstruction = `\n\nREGRA CRÍTICA: Se o contexto acima mencionar "Estilos OBRIGATÓRIOS definidos pelo usuário", você DEVE incluir EXATAMENTE esses estilos como tags na sua resposta, sem modificá-los ou substituí-los. Adicione tags complementares da IA DEPOIS dos estilos obrigatórios. Responda APENAS com a lista de tags separadas por vírgula, sem explicações.`;
    
    return await unifiedGenerate(basePrompt + rigidInstruction, provider);
};

export const analyzeBriefing = async (briefing: string): Promise<any> => {
    const settings = getSystemSettings();
    let prompt = settings.promptAnalyze;
    if (prompt.includes("[RAW USER IDEA]")) {
        prompt = prompt.replace("[RAW USER IDEA]", briefing);
    } else if (prompt.includes("[BRIEF]")) {
        prompt = prompt.replace("[BRIEF]", briefing);
    } else {
        prompt += `\n\n${briefing}`;
    }
    try {
        const textRaw = await unifiedGenerate(prompt, AIProvider.GOOGLE);
        const jsonMatch = textRaw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON");
        const result = JSON.parse(jsonMatch[0]);

        return {
            global: result.global || {},
            arsenal: {
                instruments: ensureArray(result.arsenal?.instrumentos),
                atmosphere: ensureArray(result.arsenal?.atmosfera),
                mastering: ensureArray(result.arsenal?.masterizacao),
                effects: ensureArray(result.arsenal?.efeitos),
                rhythm: ensureArray(result.arsenal?.ritmo),
                forceInstruments: result.arsenal?.apenasInstrumentosSelecionados || false,
                reverbLevel: result.arsenal?.reverbLevel || 50,
                isReverbActive: result.arsenal?.reverbLevel ? true : false
            },
            detailedInstructions: (result.detailedInstructions || []).map((i: any) => ({
                id: crypto.randomUUID(), section: i.section || "Global", instruction: i.instruction || ""
            }))
        };
    } catch (e) { return { global: {}, arsenal: {}, detailedInstructions: [] }; }
};

export const fetchArtistSongs = async (artistName: string): Promise<string[]> => {
    const prompt = `List 5 iconic songs by "${artistName}". JSON array of strings only.`;
    try {
        const textRaw = await unifiedGenerate(prompt, AIProvider.GOOGLE);
        const text = textRaw?.replace(/```json|```/g, '').trim() || "[]";
        return JSON.parse(text);
    } catch (e) { return []; }
};

// FIX: Aceitar e usar os estilos do projeto para evitar alucinações de gênero
export const generateByArtistFlow = async (artistName: string, styles: string[] = [], topic: string) => {
    const settings = getSystemSettings();
    const styleContext = styles.length > 0 ? styles.join(", ") : "Livre";

    const prompt = settings.promptLyrics
        .replace("[IDIOMA]", "Português (Brasil)")
        .replace("[TÍTULO DA MÚSICA]", topic)
        .replace("[SENTIMENTO]", `Estilo de ${artistName}`)
        + `\n\nCONTEXTO: Inspire-se na escrita de ${artistName}.`
        + `\n\nIMPORTANTE - GÊNERO MUSICAL: ${styleContext} (Mantenha o vocabulário e o tema estritamente dentro deste gênero. Ex: Se for Gospel, mantenha religioso. Se for Rap, mantenha urbano).`;

    return { generatedLyrics: await unifiedGenerate(prompt, AIProvider.GOOGLE) };
};



export const analyzeArtistDNA = async (artistName: string, provider: AIProvider = AIProvider.GOOGLE): Promise<any> => {
    const settings = getSystemSettings();
    const system = settings.promptForensic.split('\n')[0]; // Extract first line as role
    const prompt = settings.promptForensic.replace("[ARTIST_NAME]", artistName);

    let lastRawText = "";

    const runAnalysis = async (p: string) => {
        try {
            const sysInstruction = "You are a Musicological Technical Analyst. Return ONLY JSON without any formatting.";
            const textRaw = await unifiedGenerate(p, provider, sysInstruction);

            lastRawText = textRaw;
            // Clear markdown code blocks if present
            const cleanedText = textRaw.replace(/```json|```/g, '').trim();
            const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);

            if (!jsonMatch) {
                lastRawText = "NO JSON DETECTED. RAW: " + textRaw;
                return null;
            }
            try {
                // Remove trailing commas which often break JSON.parse
                const strictJson = jsonMatch[0].replace(/,\s*([}\]])/g, '$1');
                return JSON.parse(strictJson);
            } catch (e: any) {
                lastRawText = "JSON PARSE FAILED: " + e.message + " | RAW: " + jsonMatch[0].substring(0, 150) + "...";
                return null;
            }
        } catch (e: any) {
            lastRawText = "API ERROR: " + e.message;
            return null;
        }
    };

    let result = await runAnalysis(prompt);

    // Fallback strategy if blocked or invalid JSON
    if (!result) {
        console.warn("Retrying DNA analysis with simplified prompt for:", artistName);
        const fallbackPrompt = `Extract technical musical parameters for: ${artistName}. 
        Return JSON with keys: forensicBreakdown (text), goldenPrompt (technical descriptors in English), styleTags (array), sentiment (one of: Happy, Sad, Aggressive, Calm, Romantic, Epic, Melancholic), arsenal (object with instruments, ritmo, atmosfera, efeitos), vocalDnaInstruction (text).`;
        result = await runAnalysis(fallbackPrompt);
    }

    if (!result) {
        throw new Error(`FALHA NA DECODIFICAÇÃO. DETALHE: ${lastRawText}`);
    }

    return result;
};

export const translateBlogPost = async (content: any, targetLang: 'en' | 'es' | 'pt'): Promise<any> => {
    const prompt = `Translate to ${targetLang === 'en' ? 'English' : targetLang === 'es' ? 'Spanish' : 'Portuguese'}. JSON structure: ${JSON.stringify(content)}`;
    try {
        const textRaw = await unifiedGenerate(prompt, AIProvider.GOOGLE);
        const text = textRaw?.replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch (e) { throw new Error("Translation failed"); }
};
