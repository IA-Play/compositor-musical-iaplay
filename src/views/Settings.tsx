
import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { User, Key, Save, Eye, EyeOff, ExternalLink, Shield } from 'lucide-react';
import { useModal } from '../components/ModalProvider';
import { fetchInstalledOllamaModels, OllamaModelInfo, POPULAR_OLLAMA_MODELS } from '../services/ollamaService';

export const Settings: React.FC = () => {
    const { user, updateProfile, updateApiKeys, refreshProfile } = useAuth();
    const { showAlert } = useModal();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'profile' | 'apikeys'>('apikeys');

    // Profile State
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [creativeContext, setCreativeContext] = useState(user?.creativeContext || '');
    const [showPassword, setShowPassword] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // API Key State
    const [keys, setKeys] = useState({
        google: user?.googleApiKey || '',
        openai: user?.openaiApiKey || '',
        groq: user?.groqApiKey || '',
        cerebras: user?.cerebrasApiKey || '',
        openrouter: user?.openrouterApiKey || '',
        mistral: user?.mistralApiKey || '',
        together: user?.togetherApiKey || '',
        ollamaUrl: user?.ollamaUrl || 'http://localhost:11434',
        ollamaModel: user?.ollamaModel || 'llama3.2'
    });

    const [testingOllama, setTestingOllama] = useState(false);
    const [ollamaStatus, setOllamaStatus] = useState<string | null>(null);
    const [installedOllamaModels, setInstalledOllamaModels] = useState<OllamaModelInfo[]>([]);

    const autoFetchOllama = async (url?: string) => {
        try {
            const models = await fetchInstalledOllamaModels(url || keys.ollamaUrl);
            setInstalledOllamaModels(models);
            if (models.length > 0 && !keys.ollamaModel) {
                setKeys(k => ({ ...k, ollamaModel: models[0].name }));
            }
        } catch (e) {}
    };

    useEffect(() => {
        refreshProfile();
        autoFetchOllama();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setCreativeContext(user.creativeContext || '');
            setKeys({
                google: user.googleApiKey || '',
                openai: user.openaiApiKey || '',
                groq: user.groqApiKey || '',
                cerebras: user.cerebrasApiKey || '',
                openrouter: user.openrouterApiKey || '',
                mistral: user.mistralApiKey || '',
                together: user.togetherApiKey || '',
                ollamaUrl: user.ollamaUrl || 'http://localhost:11434',
                ollamaModel: user.ollamaModel || 'llama3.2'
            });
            autoFetchOllama(user.ollamaUrl);
        }
    }, [user?.id, user?.googleApiKey, user?.openaiApiKey, user?.groqApiKey, user?.cerebrasApiKey, user?.openrouterApiKey, user?.mistralApiKey, user?.togetherApiKey, user?.ollamaUrl, user?.ollamaModel]);

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ name, password: password || undefined, creativeContext });
            await showAlert(t('settings.success'));
            setPassword('');
        } catch (e) {
            await showAlert("Erro ao atualizar perfil.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestOllama = async () => {
        setTestingOllama(true);
        setOllamaStatus(null);
        try {
            const endpoint = (keys.ollamaUrl || 'http://localhost:11434').replace(/\/+$/, '');
            const models = await fetchInstalledOllamaModels(endpoint);
            setInstalledOllamaModels(models);

            if (models.length > 0) {
                const modelNames = models.map(m => `${m.name}${m.size ? ` (${m.size})` : ''}`).join(', ');
                setOllamaStatus(`✅ Conectado ao Ollama! ${models.length} modelo(s) pronto(s): ${modelNames}`);
            } else {
                const res = await fetch(`${endpoint}/api/tags`).catch(() => null);
                if (res && res.ok) {
                    setOllamaStatus(`✅ Conectado ao Ollama! Nenhum modelo baixado ainda. Baixe um modelo abaixo.`);
                } else {
                    setOllamaStatus(`⚠️ Ollama conectado, mas sem modelos detectados.`);
                }
            }
        } catch (e: any) {
            setOllamaStatus(`❌ Não foi possível conectar ao Ollama em ${keys.ollamaUrl}. Certifique-se de que o Ollama está aberto no PC/Pinokio.`);
        } finally {
            setTestingOllama(false);
        }
    };

    const handleSaveKeys = async () => {
        setIsSaving(true);
        try {
            updateApiKeys({
                google: keys.google,
                openai: keys.openai,
                groq: keys.groq,
                cerebras: keys.cerebras,
                openrouter: keys.openrouter,
                mistral: keys.mistral,
                together: keys.together,
                ollamaUrl: keys.ollamaUrl,
                ollamaModel: keys.ollamaModel
            });
            await showAlert("Configurações e Chaves de IA salvas com sucesso!");
        } catch (e) {
            console.error("Save keys error:", e);
            await showAlert("Erro ao salvar chaves API.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white">
            <Navbar />
            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-8">{t('settings.title')}</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="w-full md:w-64 shrink-0 flex flex-col justify-between">
                        <nav className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('apikeys')}
                                className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${activeTab === 'apikeys' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <Key className="w-4 h-4 text-primary" /> {t('settings.tab_keys')}
                            </button>
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`text-left px-4 py-3 rounded-lg flex items-center gap-3 font-medium transition-colors ${activeTab === 'profile' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <User className="w-4 h-4" /> {t('settings.tab_profile')}
                            </button>
                        </nav>

                        <div className="mt-8 p-4 bg-zinc-900 border border-white/5 rounded-lg text-center">
                            <p className="text-xs text-zinc-500 uppercase font-bold mb-1">IAPLAY Studio</p>
                            <p className="text-sm font-mono text-primary">v{__APP_VERSION__}</p>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1">

                        {/* PROFILE TAB */}
                        {activeTab === 'profile' && (
                            <div className="bg-surface border border-white/10 rounded-2xl p-8 space-y-6 animate-in fade-in">
                                <h2 className="text-xl font-bold mb-4">{t('settings.tab_profile')}</h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">{t('settings.name')}</label>
                                        <input
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">{t('settings.email')}</label>
                                        <input
                                            value={user?.email}
                                            disabled
                                            className="w-full bg-zinc-900 border border-white/5 rounded-xl p-3 text-zinc-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="text-sm font-bold text-white">Memória Criativa Pessoal (DNA Sônico)</h3>
                                        <div className="px-2 py-0.5 bg-primary/20 text-primary rounded text-[10px] font-bold">ATIVO</div>
                                    </div>
                                    <p className="text-xs text-zinc-400 mb-4">
                                        Ensine a IA sobre o seu estilo musical, sua banda ou preferências perenes.
                                        O IAPlay sempre lerá estas instruções antes de compor qualquer letra para você.
                                    </p>
                                    <textarea
                                        rows={4}
                                        value={creativeContext}
                                        onChange={(e) => setCreativeContext(e.target.value)}
                                        placeholder="Ex: Sou compositor de MPB moderna e Indie. Gosto de metáforas poéticas, rimas ricas e ritmo sincopado. Evite temas superficiais e clichês..."
                                        className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white focus:border-primary outline-none custom-scrollbar"
                                    />
                                </div>

                                <div className="pt-6 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-white mb-4">{t('settings.security')}</h3>
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">{t('settings.new_password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                autoComplete="new-password"
                                                placeholder="Deixe em branco para manter a atual"
                                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none pr-10"
                                            />
                                            <button
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-3 text-zinc-500 hover:text-white"
                                            >
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={isSaving}
                                        className="px-6 py-2.5 bg-primary hover:bg-[#e05626] rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Save className="w-4 h-4" />
                                        {isSaving ? t('common.saving') : t('settings.save_changes')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* API KEYS TAB */}
                        {activeTab === 'apikeys' && (
                            <div className="bg-surface border border-white/10 rounded-2xl p-8 space-y-6 animate-in fade-in">
                                <div>
                                    <h2 className="text-xl font-bold mb-2">{t('settings.tab_keys')}</h2>
                                    <p className="text-sm text-zinc-400 mb-4">
                                        Configure o Ollama (100% Grátis e Local no Pinokio) ou insira suas chaves de API para usar os modelos de nuvem.
                                    </p>

                                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-xs space-y-2 text-zinc-300">
                                        <div className="flex items-center gap-2 font-bold text-white text-sm">
                                            <Shield className="w-4 h-4 text-primary" /> Execução Direta e Segura no Navegador
                                        </div>
                                        <p>
                                            Suas chaves são salvas localmente no seu navegador e utilizadas em chamadas diretas para os provedores de IA.
                                        </p>
                                        <p className="text-zinc-400">
                                            💡 Obtenha chaves gratuitas em <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold inline-flex items-center gap-1">Google AI Studio <ExternalLink className="w-3 h-3" /></a>, <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold inline-flex items-center gap-1">Groq Console <ExternalLink className="w-3 h-3" /></a> ou <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-bold inline-flex items-center gap-1">OpenRouter <ExternalLink className="w-3 h-3" /></a>.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* OLLAMA LOCAL SECTION */}
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                                <label className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                                                    🦙 Ollama (IA Local / Pinokio - 100% Grátis & Offline)
                                                </label>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleTestOllama}
                                                disabled={testingOllama}
                                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                                            >
                                                {testingOllama ? "Testando..." : "Testar Conexão"}
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">URL / Endpoint do Ollama</label>
                                                <input
                                                    type="text"
                                                    value={keys.ollamaUrl}
                                                    onChange={(e) => setKeys({ ...keys, ollamaUrl: e.target.value })}
                                                    placeholder="http://localhost:11434"
                                                    className="w-full bg-black border border-white/10 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none font-mono text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-zinc-400 uppercase mb-1">Modelo Selecionado</label>
                                                {installedOllamaModels.length > 0 ? (
                                                    <select
                                                        value={keys.ollamaModel}
                                                        onChange={(e) => setKeys({ ...keys, ollamaModel: e.target.value })}
                                                        className="w-full bg-black border border-emerald-500/50 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none font-mono text-xs"
                                                    >
                                                        {installedOllamaModels.map(m => (
                                                            <option key={m.name} value={m.name}>
                                                                {m.name} {m.size ? `(${m.size})` : ''} {m.parameterSize ? `[${m.parameterSize}]` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={keys.ollamaModel}
                                                        onChange={(e) => setKeys({ ...keys, ollamaModel: e.target.value })}
                                                        placeholder="llama3.2, deepseek-r1:8b, mistral..."
                                                        className="w-full bg-black border border-white/10 rounded-xl p-2.5 text-white focus:border-emerald-500 outline-none font-mono text-xs"
                                                    />
                                                )}
                                            </div>
                                        </div>

                                        {/* Modelos Detectados Localmente */}
                                        {installedOllamaModels.length > 0 && (
                                            <div className="space-y-1.5 pt-1">
                                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                                    📦 Modelos Baixados no seu PC ({installedOllamaModels.length}):
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {installedOllamaModels.map(m => (
                                                        <button
                                                            key={m.name}
                                                            type="button"
                                                            onClick={() => setKeys({ ...keys, ollamaModel: m.name })}
                                                            className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${keys.ollamaModel === m.name ? 'bg-emerald-500 text-black font-bold shadow-lg shadow-emerald-500/20' : 'bg-black/60 text-zinc-300 border border-white/10 hover:border-emerald-500/50'}`}
                                                        >
                                                            <span>{m.name}</span>
                                                            {m.size && <span className="text-[10px] opacity-70">({m.size})</span>}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Modelos Populares Disponíveis Online */}
                                        <div className="space-y-2 pt-2 border-t border-white/5">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                                                🌐 Modelos Recomendados (Baixar no Terminal / Pinokio):
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {POPULAR_OLLAMA_MODELS.map(pm => {
                                                    const isInstalled = installedOllamaModels.some(im => im.name.startsWith(pm.name));
                                                    return (
                                                        <div
                                                            key={pm.name}
                                                            className={`p-2 rounded-xl border text-xs flex items-center justify-between gap-2 ${isInstalled ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-black/40 border-white/5'}`}
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-mono font-bold text-white text-xs">{pm.name}</span>
                                                                    {isInstalled && <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded">BAIXADO</span>}
                                                                </div>
                                                                <p className="text-[10px] text-zinc-400 truncate">{pm.desc}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    await navigator.clipboard.writeText(`ollama run ${pm.name}`);
                                                                    showAlert(`Comando 'ollama run ${pm.name}' copiado! Cole no seu terminal ou Pinokio.`);
                                                                }}
                                                                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] font-mono whitespace-nowrap transition-colors"
                                                                title="Copiar comando de instalação"
                                                            >
                                                                Copiar
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {ollamaStatus && (
                                            <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 text-xs font-mono text-zinc-300 animate-in fade-in">
                                                {ollamaStatus}
                                            </div>
                                        )}
                                        <p className="text-[10px] text-zinc-400">
                                            💡 Não requer chave de API nem internet! Executa direto no seu PC/Pinokio.
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Google Gemini API Keys (Recomendado)</label>
                                        <textarea
                                            rows={3}
                                            value={keys.google}
                                            onChange={(e) => setKeys({ ...keys, google: e.target.value })}
                                            placeholder="Cole suas chaves aqui (AIzaSy...), uma por linha."
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Modelo: Gemini 2.0 Flash / 1.5 Flash (Gratuito no Google AI Studio). Suporta múltiplas chaves.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Groq API Keys</label>
                                        <textarea
                                            rows={2}
                                            value={keys.groq}
                                            onChange={(e) => setKeys({ ...keys, groq: e.target.value })}
                                            placeholder="gsk_..., uma por linha"
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Modelos: Llama 3.3 70B, Llama 3.1 8B, Mixtral, DeepSeek R1.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">⚡ Cerebras Cloud API Keys (Grátis - Ultra-Rápido)</label>
                                        <textarea
                                            rows={2}
                                            value={keys.cerebras}
                                            onChange={(e) => setKeys({ ...keys, cerebras: e.target.value })}
                                            placeholder="csk-..., uma por linha (api.cerebras.ai)"
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Modelos: Llama 3.3 70B, Llama 3.1 8B (até 2.000 tokens/segundo no Tier Gratuito).</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">🌐 OpenRouter API Keys (Modelos Grátis)</label>
                                        <textarea
                                            rows={2}
                                            value={keys.openrouter}
                                            onChange={(e) => setKeys({ ...keys, openrouter: e.target.value })}
                                            placeholder="sk-or-v1-..., uma por linha (openrouter.ai)"
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Modelos: Llama 3.3 70B Free, Gemini 2.0 Flash Lite Free, DeepSeek R1 Free.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">OpenAI API Keys</label>
                                        <textarea
                                            rows={2}
                                            value={keys.openai}
                                            onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
                                            placeholder="sk-..., uma por linha"
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Modelos: GPT-4o Mini, GPT-4o.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">🇫🇷 Mistral AI API Keys</label>
                                        <textarea
                                            rows={2}
                                            value={keys.mistral}
                                            onChange={(e) => setKeys({ ...keys, mistral: e.target.value })}
                                            placeholder="Chave da API da Mistral AI, uma por linha (console.mistral.ai)"
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Modelos: Mistral Small, Pixtral 12B, Open Mixtral 8x7B.</p>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">🚀 Together AI API Keys</label>
                                        <textarea
                                            rows={2}
                                            value={keys.together}
                                            onChange={(e) => setKeys({ ...keys, together: e.target.value })}
                                            placeholder="Chave da API da Together AI, uma por linha (together.ai)"
                                            className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none font-mono text-xs"
                                        />
                                        <p className="text-[10px] text-zinc-500 mt-1">Modelos: Llama 3.3 70B Turbo, Llama 3.1 8B, DeepSeek R1.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t border-white/10">
                                    <button
                                        onClick={handleSaveKeys}
                                        className="px-6 py-2.5 bg-primary hover:bg-[#e05626] rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Shield className="w-4 h-4" />
                                        {t('settings.save_keys')}
                                    </button>
                                </div>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
};

