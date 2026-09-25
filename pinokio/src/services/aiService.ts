
import { Project, AIProvider, ArsenalSettings, DetailedInstruction, Language, MusicType, Sentiment, MusicPlatform } from "../types";
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

export const hasKeyForProvider = (provider: AIProvider): boolean => {
    if (provider === AIProvider.OLLAMA) return true;
    const userKeys = getStoredUserKeys();
    const settings = getSystemSettings();
    switch (provider) {
        case AIProvider.GOOGLE:
            return extractKeys(userKeys.google).length > 0 || extractKeys(settings.googleApiKey).length > 0;
        case AIProvider.GROQ:
            return extractKeys(userKeys.groq).length > 0 || extractKeys(settings.groqApiKey).length > 0;
        case AIProvider.OPENROUTER:
            return extractKeys(userKeys.openrouter).length > 0 || extractKeys(settings.openrouterApiKey).length > 0;
        case AIProvider.CEREBRAS:
            return extractKeys(userKeys.cerebras).length > 0 || extractKeys(settings.cerebrasApiKey).length > 0;
        case AIProvider.OPENAI:
            return extractKeys(userKeys.openai).length > 0 || extractKeys(settings.openaiApiKey).length > 0;
        case AIProvider.MISTRAL:
            return extractKeys(userKeys.mistral).length > 0 || extractKeys(settings.mistralApiKey).length > 0;
        case AIProvider.TOGETHER:
            return extractKeys(userKeys.together).length > 0 || extractKeys(settings.togetherApiKey).length > 0;
        default:
            return false;
    }
};

export const getProviderKeyUrl = (provider: AIProvider): string => {
    switch (provider) {
        case AIProvider.GOOGLE:
            return "https://aistudio.google.com/app/apikey";
        case AIProvider.GROQ:
            return "https://console.groq.com/keys";
        case AIProvider.CEREBRAS:
            return "https://cloud.cerebras.ai/";
        case AIProvider.OPENROUTER:
            return "https://openrouter.ai/keys";
        case AIProvider.OPENAI:
            return "https://platform.openai.com/api-keys";
        case AIProvider.MISTRAL:
            return "https://console.mistral.ai/api-keys/";
        case AIProvider.TOGETHER:
            return "https://api.together.ai/settings/api-keys";
        default:
            return "https://aistudio.google.com/app/apikey";
    }
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

    throw new Error(friendlyApiError("Google Gemini", lastError || "Todas as tentativas falharam."));
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

    throw new Error(friendlyApiError("Groq", lastError || "Todas as tentativas falharam."));
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

    throw new Error(friendlyApiError("OpenRouter", lastError || "Todas as tentativas falharam."));
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

    throw new Error(friendlyApiError("Cerebras", lastError || "Todas as tentativas falharam."));
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

    throw new Error(friendlyApiError("OpenAI", lastError || "Todas as tentativas falharam."));
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

    throw new Error(friendlyApiError("Mistral", lastError || "Todas as tentativas falharam."));
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

    throw new Error(friendlyApiError("Together AI", lastError || "Todas as tentativas falharam."));
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
        const timeoutId = setTimeout(() => controller.abort(), 120000);

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
        const timeoutId = setTimeout(() => controller.abort(), 120000);

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


// --- MELHORIA 6: Erros de API mais claros (traducao de erros comuns) ---
const friendlyApiError = (providerLabel: string, raw: string): string => {
    const msg = (raw || "").toLowerCase();
    if (msg.includes("api key not valid") || msg.includes("invalid_api_key") || msg.includes("api key has been invalidated")) {
        return `${providerLabel}: a sua API key esta invalida ou foi revogada. Verifique em "Configuracoes" > "Chaves de IA & Ollama".`;
    }
    if (msg.includes("invalid x-goog-api-key")) {
        return `${providerLabel} (Google): API key invalida. Verifique a chave no Google AI Studio e atualize em "Configuracoes".`;
    }
    if (msg.includes("quota") || msg.includes("resource_exhausted") || msg.includes("429") || msg.includes("rate limit") || msg.includes("too many requests")) {
        return `${providerLabel}: limite de requicoes/quota atingido. Aguarde alguns minutos ou use outro provedor (Ollama local e gratis e ilimitado).`;
    }
    if (msg.includes("billing") || msg.includes("payment") || msg.includes("account is not in good standing")) {
        return `${providerLabel}: conta com pendencia de faturamento. Regularize a conta no provedor ou use outro provedor.`;
    }
    if (msg.includes("model not found") || msg.includes("not supported") || msg.includes("decommissioned") || msg.includes("has been retired")) {
        return `${providerLabel}: modelo disponivel nao existe mais. O sistema ja tenta outros modelos automaticamente.`;
    }
    if (msg.includes("fetch failed") || msg.includes("networkerror") || msg.includes("failed to fetch") || msg.includes("timeout") || msg.includes("timed out")) {
        return `${providerLabel}: sem conexao de rede ou servidor demorou demais. Verifique sua internet (ou o Ollama local).`;
    }
    if (msg.includes("cors")) {
        return `${providerLabel}: bloqueado pelo navegador (CORS). Tente outro provedor ou o Ollama local.`;
    }
    if (msg.includes("unauthorized") || msg.includes("401") || msg.includes("403")) {
        return `${providerLabel}: chave rejeitada (401/403). Confira se copiou a API key completa.`;
    }
    return `${providerLabel}: ${raw || "erro desconhecido"}`;
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
        console.warn(`[Fallback] Fornecedor primario (${provider}) falhou:`, primaryErrorMsg);

        // Ordem estrategica de fallback para outros provedores disponiveis
        const fallbacks = [
            AIProvider.GOOGLE,
            AIProvider.GROQ,
            AIProvider.OPENROUTER,
            AIProvider.CEREBRAS,
            AIProvider.OLLAMA,
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

        const friendlyMsg = friendlyApiError(provider, primaryErrorMsg);
        throw new Error(friendlyMsg);
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

// 4️⃣ — ESTRUTURAR PROMPT (Suno, Udio, Mureka)
export const structureSunoPrompt = async (
    project: Project,
    provider: AIProvider
): Promise<string> => {
    try {
        const settings = getSystemSettings();
        const detailedInstructions = project.detailedInstructions.map(d => `- SECTION [${d.section}]: ${d.instruction}`).join("\n");
        const arsenalData = formatArsenalForPrompt(project.arsenal);
        const styles = ensureArray(project.styles);
        const platform = project.targetPlatform || MusicPlatform.SUNO;

        const platformInstructions = {
            [MusicPlatform.SUNO]: `
PLATAFORMA ALVO: Suno.ai
ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
1. [STYLE OF MUSIC / PROMPT]
(Tags concisas de gêneros, BPM, vocais e instrumentos para colar na caixa "Style of Music" do Suno)

2. [LETRA ESTRUTURADA]
(Estruture a letra completa com metatags precisas do Suno: [Intro], [Verse 1], [Pre-Chorus], [Chorus], [Bridge], [Guitar Solo], [Drop], [Outro], [End] e diretrizes de performance nos colchetes).
`.trim(),
            [MusicPlatform.UDIO]: `
PLATAFORMA ALVO: Udio
ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
1. [UDIO PROMPT TAGS]
(Tags descritivas separadas por vírgula para a caixa Prompt do Udio: gênero, tipo de vocal, instrumentos, ambiência, BPM, ex: "female vocalist, synthwave, 80s, melancholic, punchy bass, analog synths, reverb, 120 bpm")

2. [CUSTOM LYRICS]
(Estruture a letra com tags suportadas pelo Udio: [Verse], [Chorus], [Bridge], [Drop], [Instrumental], [Guitar Solo], [Outro], [End]).
`.trim(),
            [MusicPlatform.MUREKA]: `
PLATAFORMA ALVO: Mureka.ai
ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
1. [SONG DESCRIPTION & PROMPT]
(Descrição detalhada para o prompt do Mureka: Gênero, Mood, Instrumentos, Tipo de Vocal, Andamento/BPM e Masterização)

2. [LYRICS & STRUCTURE]
(Letra completa organizada com seções [Intro], [Verse 1], [Chorus], [Bridge], [Outro]).
`.trim(),
            [MusicPlatform.MAESTRO]: `
PLATAFORMA ALVO: Maestro (YuE2 Local)
ESTRUTURA DE RESPOSTA OBRIGATÓRIA:
1. [MUSIC STYLE / ALT_PROMPT]
(Descrição de estilo concisa e direta para a caixa de estilo do YuE2: gênero musical, tipo e timbre do vocal, instrumentos principais, atmosfera, andamento/BPM. Ex: "Acoustic Pop, warm expressive vocal, fingerpicked acoustic guitar, soft piano, emotive, 90 BPM").

2. [LETRA ESTRUTURADA YUE2]
(Estruture a letra completa com seções claras separadas por linhas em branco no formato padrão YuE2: [Verse], [Chorus], [Bridge], [Outro]. Repita o refrão explicitamente e mantenha frases curtas e cantáveis).
`.trim()
        }[platform] || "";

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

        // Injeta instrucao especializada de plataforma
        prompt += `\n\n${platformInstructions}\n\nIMPORTANTE: Retorne a estrutura completa preservando toda a letra fornecida e aplicando todas as tags musicais apropriadas para ${platform}.`;

        const rawResult = await unifiedGenerate(prompt, provider);
        
        // Formata o resultado para a plataforma selecionada sem perda de dados
        return formatForPlatform(rawResult, platform);
    } catch (error) {
        console.error("Erro ao estruturar prompt:", error);
        throw error;
    }
};

// --- Suporte nativo ao Suno, Udio e Mureka.ai ---
export const formatForPlatform = (rawPrompt: string, platform: MusicPlatform): string => {
    const cleaned = (rawPrompt || "").trim();

    // Limpar markdown de bloco de codigo sem mutilar o conteudo interno
    let text = cleaned
        .replace(/^```[a-zA-Z]*\n/gm, "")
        .replace(/```$/gm, "")
        .trim();

    return text;
};

/**
 * Faz o parsing automático do retorno de estruturação de prompts,
 * separando a Letra Estruturada (com tags musicais [Verse], [Chorus] etc.)
 * e o Estilo / Tags Sonoras para que sejam propagados imediatamente
 * para os campos de geração e reprodução musical (YuE2, Suno, etc).
 */
export const parseStructuredPrompt = (raw: string): { styleText: string; lyricsText: string; tags: string[] } => {
    if (!raw || !raw.trim()) {
        return { styleText: '', lyricsText: '', tags: [] };
    }

    let styleText = '';
    let lyricsText = '';

    // Regex para identificar o cabeçalho da seção de letra estruturada de todas as plataformas
    const lyricsHeaderMatch = raw.match(
        /(?:^|\n)(?:(?:\d+[\.\)]|#{1,4})\s*)?\[(?:LETRA\s+ESTRUTURADA(?:\s+YUE2)?|CUSTOM\s+LYRICS|LYRICS\s*(?:&|AND)\s*STRUCTURE|LETRA|LYRICS)\][^\n]*/i
    );

    if (lyricsHeaderMatch && lyricsHeaderMatch.index !== undefined) {
        const splitIndex = lyricsHeaderMatch.index + lyricsHeaderMatch[0].length;
        const beforeLyrics = raw.substring(0, lyricsHeaderMatch.index).trim();
        lyricsText = raw.substring(splitIndex).trim();

        // Extrai a seção de estilo anterior à letra
        const styleHeaderMatch = beforeLyrics.match(
            /(?:^|\n)(?:(?:\d+[\.\)]|#{1,4})\s*)?\[(?:STYLE\s+OF\s+MUSIC(?:\s*\/\s*PROMPT)?|MUSIC\s+STYLE(?:\s*\/\s*ALT_PROMPT)?|UDIO\s+PROMPT\s+TAGS|SONG\s+DESCRIPTION\s*&?\s*PROMPT|STYLE|PROMPT\s+TAGS)\][^\n]*/i
        );

        if (styleHeaderMatch && styleHeaderMatch.index !== undefined) {
            styleText = beforeLyrics.substring(styleHeaderMatch.index + styleHeaderMatch[0].length).trim();
        } else {
            styleText = beforeLyrics;
        }
    } else {
        // Fallback: se não houver o cabeçalho padrão, busca a primeira metatag musical clássica [Intro], [Verse], etc.
        const metaTagMatch = raw.match(/(?:^|\n)\s*(\[(?:Intro|Verse|Chorus|Refr[aã]o|Ponte|Bridge|Drop|Outro|Pre-Chorus)[^\]]*\])/i);
        if (metaTagMatch && metaTagMatch.index !== undefined) {
            styleText = raw.substring(0, metaTagMatch.index).trim();
            lyricsText = raw.substring(metaTagMatch.index).trim();
        } else {
            lyricsText = raw.trim();
        }
    }

    // Remove eventuais instruções de template entre parênteses no início de cada seção
    styleText = styleText.replace(/^\s*\([^\)]*\)\s*\n?/m, '').trim();
    lyricsText = lyricsText.replace(/^\s*\([^\)]*\)\s*\n?/m, '').trim();

    // Extrai tags separadas por vírgula ou linha
    const tags = styleText
        ? styleText
              .split(/[,;\n]+/)
              .map(t => t.trim().replace(/^[-*•]\s*/, ''))
              .filter(t => t.length > 1 && !t.startsWith('(') && !t.startsWith('['))
        : [];

    return { styleText, lyricsText, tags };
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
    let prompt = settings.promptStyles || "";
    if (prompt.includes("[PROMPT COMPLETO]")) {
        prompt = prompt.replace("[PROMPT COMPLETO]", fullPrompt);
    } else if (prompt.includes("[INPUT_PROMPT]")) {
        prompt = prompt.replace("[INPUT_PROMPT]", fullPrompt);
    } else if (prompt.includes("[PROMPT]")) {
        prompt = prompt.replace("[PROMPT]", fullPrompt);
    } else {
        prompt += `\n\n# INPUT\n\n${fullPrompt}`;
    }
    
    console.log("[aiService] generateStyleTags iniciado com provedor:", provider);
    let result = await unifiedGenerate(prompt, provider);
    
    // Pós-processamento de limpeza para assegurar estrita aderência ao contrato:
    result = result.replace(/^```[a-zA-Z]*\n?/gm, '').replace(/```$/gm, '').trim();
    result = result.replace(/^(Style Description|Final Style Description|Style|Music Style|Description|Prompt):\s*/i, '').trim();
    if ((result.startsWith('"') && result.endsWith('"')) || (result.startsWith("'") && result.endsWith("'"))) {
        result = result.slice(1, -1).trim();
    }
    
    // Garantir limite absoluto de 979 caracteres do prompt mestre
    if (result.length > 979) {
        const truncated = result.slice(0, 979);
        const lastPunct = Math.max(truncated.lastIndexOf('.'), truncated.lastIndexOf(';'), truncated.lastIndexOf(','));
        if (lastPunct > 500) {
            result = truncated.slice(0, lastPunct + (truncated[lastPunct] === '.' ? 1 : 0)).trim();
        } else {
            result = truncated.trim();
        }
    }
    
    console.log("[aiService] generateStyleTags concluído. Caracteres:", result.length);
    return result;
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


