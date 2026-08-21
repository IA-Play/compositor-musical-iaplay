
import { SystemSettings, DEFAULT_SETTINGS } from "../types";

const LOCAL_SETTINGS_KEY = 'iaplay_system_settings';

// Cache em memória
let cachedSettings: SystemSettings = { ...DEFAULT_SETTINGS };
let isLoaded = false;
export let isSettingsLoadedFromServer = false;

const loadLocalSettings = (): SystemSettings => {
    try {
        const stored = localStorage.getItem(LOCAL_SETTINGS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return {
                ...DEFAULT_SETTINGS,
                ...parsed,
                listInstruments: parsed.listInstruments || DEFAULT_SETTINGS.listInstruments,
                listSentiments: parsed.listSentiments || DEFAULT_SETTINGS.listSentiments,
                listStyles: parsed.listStyles || DEFAULT_SETTINGS.listStyles,
                promptLyrics: parsed.promptLyrics || DEFAULT_SETTINGS.promptLyrics,
                promptInstrumental: parsed.promptInstrumental || DEFAULT_SETTINGS.promptInstrumental,
                promptOptimize: parsed.promptOptimize || DEFAULT_SETTINGS.promptOptimize,
                promptStructure: parsed.promptStructure || DEFAULT_SETTINGS.promptStructure,
                promptRemix: parsed.promptRemix || DEFAULT_SETTINGS.promptRemix,
                promptLength: parsed.promptLength || DEFAULT_SETTINGS.promptLength,
                promptStyles: parsed.promptStyles || DEFAULT_SETTINGS.promptStyles,
                promptAnalyze: parsed.promptAnalyze || DEFAULT_SETTINGS.promptAnalyze,
                promptCompress: parsed.promptCompress || DEFAULT_SETTINGS.promptCompress,
                promptForensic: parsed.promptForensic || DEFAULT_SETTINGS.promptForensic,
                promptScore: parsed.promptScore || DEFAULT_SETTINGS.promptScore,
            };
        }
    } catch (e) {}
    return { ...DEFAULT_SETTINGS };
};

export const initSettings = async (): Promise<SystemSettings> => {
    cachedSettings = loadLocalSettings();

    try {
        const res = await fetch(`api/settings.php?t=${Date.now()}`, {
            credentials: 'same-origin'
        });

        if (res.ok) {
            let text = await res.text();
            let cleanText = text.trim();
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');

            if (firstBrace >= 0 && lastBrace >= firstBrace) {
                cleanText = cleanText.substring(firstBrace, lastBrace + 1);
            }

            if (cleanText && cleanText.startsWith('{')) {
                let remoteData = JSON.parse(cleanText);

                if (remoteData && remoteData.encrypted_payload) {
                    const binaryString = atob(remoteData.encrypted_payload);
                    const bytes = new Uint8Array(binaryString.length);
                    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
                    const decodedStr = new TextDecoder().decode(bytes);
                    remoteData = JSON.parse(decodedStr);
                }

                if (remoteData && Object.keys(remoteData).length > 0) {
                    cachedSettings = {
                        ...cachedSettings,
                        ...remoteData
                    };
                    localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(cachedSettings));
                    isSettingsLoadedFromServer = true;
                }
            }
        }
    } catch (e) {
        // Silencia erro em modo local Pinokio / offline
    }

    (window as any).__systemSettings = cachedSettings;
    isLoaded = true;
    return cachedSettings;
};

export const getSystemSettings = (): SystemSettings => {
    if (!isLoaded) {
        cachedSettings = loadLocalSettings();
    }
    return cachedSettings;
};

export const saveSystemSettings = async (settings: SystemSettings) => {
    cachedSettings = settings;
    try {
        localStorage.setItem(LOCAL_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}

    (window as any).__systemSettings = cachedSettings;

    // Tenta sincronizar com API caso exista
    try {
        const jsonStr = JSON.stringify(settings);
        const encodedPayload = btoa(unescape(encodeURIComponent(jsonStr)));

        await fetch('api/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ payload: encodedPayload })
        });
    } catch (e) {}
};

export const resetSystemSettings = () => {
    cachedSettings = { ...DEFAULT_SETTINGS };
    try {
        localStorage.removeItem(LOCAL_SETTINGS_KEY);
    } catch (e) {}
    return cachedSettings;
};

