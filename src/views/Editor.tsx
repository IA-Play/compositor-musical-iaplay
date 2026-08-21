import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Project, AIProvider, MusicType, AudioQuality, DetailedInstruction } from '../types';
import { ArsenalModal } from '../components/Arsenal';
import {
    generateLyrics,
    optimizeLyrics,
    structureSunoPrompt,
    generateStyleTags,
    generateByArtistFlow,
    analyzeArtistDNA,
    fetchArtistSongs
} from '../services/aiService';
import {
    ArrowLeft, Save, Copy, Loader2,
    Sliders, Check, Cpu, FileText,
    Mic2, X, Share2, Database, LayoutTemplate, MoreHorizontal, FileAudio, Wand2,
    Upload, Download, HelpCircle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getSystemSettings } from '../services/settingsService';
import { GuidedTour, TourStep } from '../components/GuidedTour';
import { fetchInstalledOllamaModels, OllamaModelInfo, checkOllamaStatus } from '../services/ollamaService';
import { generateUUID } from '../utils/uuid';
import { useAIStream } from '../services/useAIStream';


interface EditorProps {
    project: Project;
    setProject: (p: Project) => void;
    onSave: () => void;
    saveStatus: 'saved' | 'saving' | 'error' | 'unsaved';
}

export const Editor: React.FC<EditorProps> = ({ project, setProject, onSave, saveStatus }) => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user, updateApiKeys } = useAuth();
    const { isStreaming, streamedText } = useAIStream();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // UI State
    const [showArsenal, setShowArsenal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState("");
    const [copyFeedback, setCopyFeedback] = useState("");
    const [styleInput, setStyleInput] = useState("");
    const [customInstruction, setCustomInstruction] = useState("");

    const [activeTab, setActiveTab] = useState<'controls' | 'lyrics' | 'output'>('lyrics');
    const [showTour, setShowTour] = useState(false);

    // Feature States
    const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.GOOGLE);
    const [generatedPrompt, setGeneratedPrompt] = useState("");

    // Ollama Dynamic Detection
    const [ollamaModels, setOllamaModels] = useState<OllamaModelInfo[]>([]);
    const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>(() => user?.ollamaModel || 'llama3.2');
    const [loadingOllama, setLoadingOllama] = useState(false);
    const [isOllamaOnline, setIsOllamaOnline] = useState<boolean | null>(null);

    const refreshOllama = async () => {
        setLoadingOllama(true);
        const online = await checkOllamaStatus();
        setIsOllamaOnline(online);
        if (online) {
            const models = await fetchInstalledOllamaModels();
            setOllamaModels(models);
            if (models.length > 0 && !models.some(m => m.name === selectedOllamaModel)) {
                setSelectedOllamaModel(models[0].name);
                updateApiKeys({ ollamaModel: models[0].name });
            }
        }
        setLoadingOllama(false);
    };

    useEffect(() => {
        refreshOllama();
    }, [aiProvider]);

    const [sysSettings, setSysSettings] = useState(getSystemSettings());

    const tourSteps: TourStep[] = [
        {
            target: '[data-tour="arsenal"]',
            title: 'Arsenal de Produção',
            content: 'Injete metadados técnicos de estúdio (BPM, ambiência, reverbs, distorções). Isso força as IAs (Suno/Udio) a respeitarem a sua visão em vez de gerarem arranjos aleatórios.',
            position: 'right'
        },
        {
            target: '[data-tour="lyric-engine"]',
            title: 'Motor Lírico IA',
            content: 'Componha do zero ou otimize letras existentes. O otimizador de métrica ajusta as sílabas e quebras de linha para casar perfeitamente com o ritmo e BPM escolhidos.',
            position: 'right'
        },
        {
            target: '[data-tour="dna"]',
            title: 'Autópsia de DNA Sônico',
            content: 'Analise e copie a identidade sônica de qualquer artista consagrado. O motor mapeia instrumentos, ritmos e efeitos característicos diretamente para o seu Arsenal.',
            position: 'right'
        },
        {
            target: '[data-tour="structured-prompt"]',
            title: 'Prompt Estruturado Final',
            content: 'Aqui está seu prompt profissional compilado com meta-tags precisas. Copie e cole na tela de criação do Suno/Udio para obter o resultado ideal de primeira!',
            position: 'left'
        }
    ];

    useEffect(() => {
        setSysSettings(getSystemSettings());
        
        // Disparar o tour automaticamente para novos usuários
        const completed = localStorage.getItem('iaplay_tour_completed');
        if (completed !== 'true') {
            const timer = setTimeout(() => {
                setShowTour(true);
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    // --- IMPORT & EXPORT ACTIONS ---
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                if (!event.target?.result || typeof event.target.result !== 'string') return;
                const rawData = JSON.parse(event.target.result);
                if (!rawData.title || !rawData.arsenal) {
                    showAlert(t('dashboard.invalid_file') || "Arquivo inválido");
                    return;
                }
                setProject({
                    ...rawData,
                    id: project.id,
                    userId: project.userId,
                    updatedAt: new Date()
                });
                showAlert(t('dashboard.import_success') || "Projeto importado com sucesso!");
            } catch (err) {
                console.error(err);
                showAlert(t('dashboard.import_error') || "Erro ao importar arquivo");
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleExport = () => {
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `iaplay-project-${project.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Custom Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        placeholder?: string;
        value: string;
        type: 'prompt' | 'alert' | 'select';
        options?: string[];
        onConfirm: (val: string) => void;
    }>({ isOpen: false, title: '', value: '', type: 'alert', options: [], onConfirm: () => { } });

    const showPrompt = (title: string, placeholder?: string): Promise<string | null> => {
        return new Promise((resolve) => {
            setModalConfig({
                isOpen: true,
                title,
                placeholder,
                value: '',
                type: 'prompt',
                options: [],
                onConfirm: (val) => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    resolve(val || null);
                }
            });
        });
    };

    const showSelect = (title: string, options: string[]): Promise<string | null> => {
        return new Promise((resolve) => {
            setModalConfig({
                isOpen: true,
                title,
                value: '',
                type: 'select',
                options,
                onConfirm: (val) => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    resolve(val || null);
                }
            });
        });
    };

    const showAlert = (title: string): Promise<void> => {
        return new Promise((resolve) => {
            setModalConfig({
                isOpen: true,
                title,
                value: '',
                type: 'alert',
                options: [],
                onConfirm: () => {
                    setModalConfig(prev => ({ ...prev, isOpen: false }));
                    resolve();
                }
            });
        });
    };

    const runWithFailover = async (msg: string, task: () => Promise<void>) => {
        setIsLoading(true);
        setLoadingMessage(msg);
        try {
            await task();
        } catch (e: any) {
            console.error(e);
            showAlert(e.message || t('messages.generic_error'));
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }
    };

    // --- HELPER ACTIONS ---

    const addStyleTag = (tag: string) => {
        if (!project.styles.includes(tag)) {
            setProject({ ...project, styles: [...project.styles, tag] });
        }
        setStyleInput("");
    };

    const removeStyleTag = (tag: string) => {
        setProject({ ...project, styles: project.styles.filter(s => s !== tag) });
    };

    const handleStyleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && styleInput.trim()) {
            addStyleTag(styleInput.trim());
        }
    };

    // AI Actions
    const handleGenerateLyrics = async () => {
        const theme = await showPrompt(
            t('editor.prompt_theme') || "Sobre o que será a música?",
            t('editor.prompt_theme_ex') || "Ex: Um guerreiro enfrentando seus medos..."
        );
        if (!theme) return;

        await runWithFailover(t('messages.generating_lyrics') || "Compondo sua letra...", async () => {
            const result = await generateLyrics(
                { ...project, title: theme || project.title },
                aiProvider,
                theme,
                user?.creativeContext
            );
            if (!result || result.trim().length < 10) {
                throw new Error("A IA retornou uma resposta vazia. Verifique suas chaves de API ou conexão com o Ollama.");
            }
            setProject({ ...project, lyrics: result });
        });
    };

    const handleOptimizeLyrics = async () => {
        await runWithFailover(t('messages.polishing'), async () => {
            const result = await optimizeLyrics(project.lyrics);
            setProject({ ...project, lyrics: result });
        });
    };

    const handleGenerateStructure = async () => {
        await runWithFailover(t('messages.prompt_engineering'), async () => {
            const result = await structureSunoPrompt(project, aiProvider);
            setGeneratedPrompt(result);
            setProject({ ...project, promptFinal: result });
        });
    };

    const handleExtractTags = async () => {
        if (!project.lyrics) return;
        await runWithFailover(t('messages.extracting_tags'), async () => {
            // Passa a letra e o que o usuário preencheu no "Engenharia de Som" (project.styles e project.arsenal)
            const userStyles = project.styles || [];
            const arsenalInstruments = project.arsenal?.instruments || [];
            const context = `Letra: \n${project.lyrics}\n\nEstilos OBRIGATÓRIOS definidos pelo usuário (DEVEM aparecer nas tags): ${userStyles.join(', ')}.\nInstrumentos selecionados: ${arsenalInstruments.join(', ')}.\nArsenal completo: ${JSON.stringify(project.arsenal)}`;
            const tags = await generateStyleTags(context, aiProvider);
            const aiTags = tags.split(',').map(s => s.trim()).filter(s => s.length > 0);

            // MERGE FORÇADO: Estilos do compositor sempre presentes + tags da IA sem duplicatas
            const userStylesLower = userStyles.map(s => s.toLowerCase());
            const filteredAiTags = aiTags.filter(tag => {
                const tagLower = tag.toLowerCase();
                // Remove tags da IA que sejam idênticas ou muito similares aos estilos do usuário
                return !userStylesLower.some(us => us === tagLower || tagLower.includes(us) || us.includes(tagLower));
            });

            const mergedTags = [...userStyles, ...filteredAiTags];
            setProject({ ...project, extractedStyles: mergedTags });
        });
    };

    const handleArtistMode = async () => {
        const artist = await showPrompt(t('editor.prompt_artist'), t('editor.prompt_artist_ex'));
        if (!artist) return;

        setIsLoading(true);
        setLoadingMessage("Buscando sucessos do artista...");
        let songs: string[] = [];
        try {
            songs = await fetchArtistSongs(artist);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
            setLoadingMessage("");
        }

        if (songs.length === 0) {
            await showAlert("Não foi possível encontrar músicas famosas para este artista no momento. Tente novamente.");
            return;
        }

        const selectedSong = await showSelect(`Qual música do ${artist} você quer como inspiração?`, songs);
        if (!selectedSong) return;

        await runWithFailover(t('messages.channeling_artist').replace('{artist}', artist), async () => {
            // Pass the selected song as the topic
            const { generatedLyrics } = await generateByArtistFlow(artist, project.styles, selectedSong);
            setProject({ ...project, lyrics: generatedLyrics, artistInspiration: artist });
            await showAlert(`Letra recriada e inspirada na vibe de "${selectedSong}" do ${artist}!`);
        });
    };

    const handleSonicDNA = async () => {
        const artistName = await showPrompt(t('editor.prompt_dna'), t('editor.prompt_dna_ex'));
        if (!artistName) return;
        await runWithFailover(t('messages.autopsy'), async () => {
            const dna = await analyzeArtistDNA(artistName, aiProvider);

            // Mapper to clean up and ensure types match
            const newArsenal = {
                ...project.arsenal,
                instruments: Array.from(new Set([...project.arsenal.instruments, ...(dna.arsenal?.instruments || [])])),
                rhythm: Array.from(new Set([...project.arsenal.rhythm, ...(dna.arsenal?.ritmo || [])])),
                atmosphere: Array.from(new Set([...project.arsenal.atmosphere, ...(dna.arsenal?.atmosfera || [])])),
                effects: Array.from(new Set([...project.arsenal.effects, ...(dna.arsenal?.efeitos || [])]))
            };

            const dnaInstruction: DetailedInstruction = {
                id: generateUUID(),
                section: "VOCAL DNA",
                instruction: dna.vocalDnaInstruction || dna.goldenPrompt
            };

            setProject({
                ...project,
                title: project.title === t('editor.new_idea') ? `DNA: ${dna.artist || artistName}` : project.title,
                artistInspiration: dna.artist || artistName,
                sentiment: dna.sentiment || project.sentiment,
                styles: Array.from(new Set([...project.styles, ...(dna.styleTags || [])])),
                arsenal: newArsenal,
                detailedInstructions: [dnaInstruction, ...project.detailedInstructions]
            });

            await showAlert(t('editor.dna_success'));
        });
    };



    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopyFeedback(t('common.copied'));
        setTimeout(() => setCopyFeedback(""), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-screen bg-background text-white overflow-hidden font-sans"
        >
            <Navbar />

            {/* SUB-HEADER / TOOLBAR */}
            <div className="h-14 border-b border-white/10 bg-zinc-950 flex items-center justify-between px-6 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{t('editor.project_caps')}</span>
                        <span className="font-bold text-sm text-white truncate max-w-[200px]">{project.title}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {copyFeedback && <span className="text-green-400 text-xs font-bold animate-pulse">{copyFeedback}</span>}

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".json"
                    />

                    <button
                        onClick={handleImportClick}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title={t('dashboard.btn_import') || "Importar JSON"}
                    >
                        <Upload className="w-4 h-4" />
                    </button>

                    <button
                        onClick={handleExport}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title={t('common.export_json') || "Exportar JSON"}
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setShowTour(true)}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title="Iniciar Tour Guiado"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </button>

                    <button
                        onClick={onSave}
                        className={`px-6 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${saveStatus === 'unsaved' ? 'bg-yellow-500 text-black hover:bg-yellow-400' : 'bg-green-600 text-white hover:bg-green-500'}`}
                    >
                        <Save className="w-4 h-4" /> {saveStatus === 'saved' ? t('editor.saved') : t('editor.btn_save')}
                    </button>
                </div>
            </div>

            {/* MAIN 3-COLUMN LAYOUT */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

                {/* 1. LEFT SIDEBAR - CONTROLS (340px) */}
                <div className={`${activeTab === 'controls' ? 'flex' : 'hidden'} md:flex w-full md:w-[340px] border-r border-white/10 bg-zinc-900 overflow-y-auto custom-scrollbar pt-2 flex-col`}>
                    <div className="p-5 space-y-6">

                        {/* AI Engine */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                                <Cpu className="w-3 h-3" /> {t('editor.engine')}
                            </div>
                            <select
                                value={aiProvider}
                                onChange={(e) => setAiProvider(e.target.value as AIProvider)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-xs text-white focus:border-primary outline-none"
                            >
                                <option value={AIProvider.GOOGLE}>Google Gemini (Recomendado)</option>
                                <option value={AIProvider.OLLAMA}>🦙 Ollama (Local / Pinokio)</option>
                                <option value={AIProvider.GROQ}>⚡ Groq (Llama 3.3 Ultra-Rápido)</option>
                                <option value={AIProvider.CEREBRAS}>🚀 Cerebras Cloud (Grátis)</option>
                                <option value={AIProvider.OPENROUTER}>🌐 OpenRouter (Modelos Grátis)</option>
                                <option value={AIProvider.MISTRAL}>🇫🇷 Mistral AI</option>
                                <option value={AIProvider.TOGETHER}>Together AI</option>
                                <option value={AIProvider.OPENAI}>OpenAI (GPT-4o)</option>
                            </select>

                            {/* OLLAMA LOCAL DYNAMIC MODEL PICKER */}
                            {aiProvider === AIProvider.OLLAMA && (
                                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-2 animate-in fade-in">
                                    <div className="flex items-center justify-between text-[11px] font-bold">
                                        <span className="flex items-center gap-1.5 text-emerald-400">
                                            <span className={`w-2 h-2 rounded-full ${isOllamaOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                                            {isOllamaOnline ? `Ollama Online (${ollamaModels.length} modelo(s))` : 'Ollama Desconectado'}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={refreshOllama}
                                            disabled={loadingOllama}
                                            className="text-zinc-400 hover:text-white transition-colors"
                                            title="Atualizar lista de modelos instalados no PC"
                                        >
                                            <RefreshCw className={`w-3.5 h-3.5 ${loadingOllama ? 'animate-spin' : ''}`} />
                                        </button>
                                    </div>

                                    {ollamaModels.length > 0 ? (
                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Modelo Baixado:</label>
                                            <select
                                                value={selectedOllamaModel}
                                                onChange={(e) => {
                                                    setSelectedOllamaModel(e.target.value);
                                                    updateApiKeys({ ollamaModel: e.target.value });
                                                }}
                                                className="w-full bg-black border border-emerald-500/40 rounded-lg p-2 text-xs text-white focus:border-emerald-500 outline-none"
                                            >
                                                {ollamaModels.map(m => (
                                                    <option key={m.name} value={m.name}>
                                                        {m.name} {m.size ? `(${m.size})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-zinc-400 space-y-1">
                                            <p>{isOllamaOnline ? "Nenhum modelo baixado no Ollama." : "Inicie o Ollama no Pinokio ou PC."}</p>
                                            <p className="font-mono bg-black/60 p-1.5 rounded text-emerald-400 border border-white/5 select-all">
                                                ollama run llama3.2
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <input
                                value={project.title}
                                onChange={(e) => setProject({ ...project, title: e.target.value })}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 text-sm font-bold text-white focus:border-primary outline-none"
                                placeholder={t('editor.music_title')}
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <select
                                    value={project.language}
                                    onChange={e => setProject({ ...project, language: e.target.value as any })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-zinc-300"
                                >
                                    <option value="Português (Brasil)">{t('editor.pt_br')}</option>
                                    <option value="Inglês">{t('editor.en')}</option>
                                    <option value="Espanhol">{t('editor.es')}</option>
                                </select>
                                <select
                                    value={project.sentiment}
                                    onChange={e => setProject({ ...project, sentiment: e.target.value })}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-zinc-300"
                                >
                                    {(sysSettings?.listSentiments || ["Neutro", "Feliz", "Triste", "Épico", "Romântico", "Agressivo"]).map((s: string) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            <label className="flex items-center gap-2 px-1 cursor-pointer group">
                                <div className={`w-4 h-4 border rounded flex items-center justify-center transition-colors ${project.musicType === MusicType.INSTRUMENTAL ? 'bg-primary border-primary' : 'border-zinc-600 bg-transparent'}`} onClick={() => setProject({ ...project, musicType: project.musicType === MusicType.INSTRUMENTAL ? MusicType.VOCAL : MusicType.INSTRUMENTAL })}>
                                    {project.musicType === MusicType.INSTRUMENTAL && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="text-xs text-zinc-400 group-hover:text-white transition-colors">{t('editor.instrumental')}</span>
                            </label>
                        </section>

                        <div className="h-px bg-white/5 w-full" />

                        {/* Sound Engineering */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-wider">
                                <Sliders className="w-3 h-3" /> {t('editor.style_production')}
                            </div>

                            {/* Tags Input */}
                            <div className="flex flex-wrap gap-2 p-2 bg-zinc-900 border border-white/10 rounded-lg min-h-[40px]">
                                {project.styles.map((tag, i) => (
                                    <span key={i} className="text-[10px] bg-black border border-primary/30 text-primary px-2 py-0.5 rounded flex items-center gap-1">
                                        {tag}
                                        <button onClick={() => removeStyleTag(tag)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                    </span>
                                ))}
                                <input
                                    value={styleInput}
                                    onChange={(e) => setStyleInput(e.target.value)}
                                    onKeyDown={handleStyleKeyDown}
                                    className="flex-1 bg-transparent text-xs text-white outline-none min-w-[60px]"
                                    placeholder={t('editor.tags_placeholder')}
                                />
                            </div>

                            {/* Quick Suggestions */}
                            <div className="flex flex-wrap gap-1.5 pt-2">
                                <span className="text-[9px] text-zinc-600 font-bold uppercase mr-1 pt-1">{t('editor.suggestions')}:</span>
                                {(sysSettings?.listStyles || ["Pop", "Trap", "Synthwave"]).map((s: string) => (
                                    <button key={s} onClick={() => addStyleTag(s)} className="text-[10px] px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded text-zinc-400 hover:text-white transition-colors">{s}</button>
                                ))}
                            </div>

                            <select
                                value={project.arsenal.quality}
                                onChange={e => setProject({ ...project, arsenal: { ...project.arsenal, quality: e.target.value as AudioQuality } })}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-xs text-zinc-300 mt-2"
                            >
                                <option value={AudioQuality.MASTERED}>Alta Qualidade (Masterizado)</option>
                                <option value={AudioQuality.STUDIO}>Padrão (Estúdio)</option>
                                <option value={AudioQuality.RAW}>Raw (Demo)</option>
                            </select>

                            <button 
                                data-tour="arsenal"
                                onClick={() => setShowArsenal(true)} 
                                className="w-full py-3 bg-gradient-to-r from-primary to-[#ff8f66] hover:from-[#e05626] hover:to-primary rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all border border-white/10"
                            >
                                <Database className="w-3 h-3" /> {t('editor.open_arsenal')}
                            </button>
                        </section>

                        <div className="h-px bg-white/5 w-full" />

                        {/* Lyric Engine Grid */}
                        <section data-tour="lyric-engine" className="space-y-3 pb-4">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-green-400 uppercase tracking-wider">
                                <FileText className="w-3 h-3" /> {t('editor.lyrics_generator')}
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleGenerateLyrics} className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex flex-col items-center justify-center gap-1 text-center transition-colors group">
                                    <Wand2 className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-medium text-zinc-300">{t('editor.btn_generate')}</span>
                                </button>
                                <button onClick={handleArtistMode} className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex flex-col items-center justify-center gap-1 text-center transition-colors group">
                                    <Mic2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-medium text-zinc-300">{t('editor.btn_artist')}</span>
                                </button>
                                <button onClick={handleOptimizeLyrics} className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex flex-col items-center justify-center gap-1 text-center transition-colors group">
                                    <LayoutTemplate className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-medium text-zinc-300">{t('editor.btn_optimize')}</span>
                                </button>
                                <button 
                                    data-tour="dna"
                                    onClick={handleSonicDNA} 
                                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-white/5 rounded-lg flex flex-col items-center justify-center gap-1 text-center transition-colors group"
                                >
                                    <FileAudio className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-[10px] font-medium text-zinc-300">DNA Sônico</span>
                                </button>
                            </div>
                        </section>

                    </div>
                </div>

                {/* 2. CENTER - EDITOR (Fluid) */}
                <div className={`${activeTab === 'lyrics' ? 'flex' : 'hidden'} md:flex flex-1 bg-[#050505] p-4 md:p-10 flex flex-col relative overflow-hidden`}>
                    <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col h-full">

                        {/* Editor Header (Mac Style) */}
                        <div className="bg-zinc-900 rounded-t-xl border border-white/10 p-3 flex items-center justify-between select-none">
                            <div className="flex gap-1.5 ml-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 hover:bg-red-500 transition-colors" />
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 hover:bg-yellow-500 transition-colors" />
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 hover:bg-green-500 transition-colors" />
                            </div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{t('editor.composition_editor')}</span>
                            <button onClick={() => copyToClipboard(project.lyrics)} className="mr-2 text-zinc-500 hover:text-white transition-colors" title="Copiar">
                                <Copy className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Text Area */}
                        <textarea
                            value={isStreaming ? streamedText : project.lyrics}
                            onChange={(e) => !isStreaming && setProject({ ...project, lyrics: e.target.value })}
                            readOnly={isStreaming}
                            className={`flex-1 w-full bg-zinc-900/50 border-x border-b border-white/10 rounded-b-xl p-4 md:p-8 text-base md:text-lg font-mono leading-relaxed focus:outline-none resize-none text-zinc-200 placeholder-zinc-700 custom-scrollbar focus:bg-zinc-900/80 transition-colors ${isStreaming ? 'opacity-90' : ''}`}
                            placeholder="[Verse 1]&#10;Comece a escrever aqui ou use os botões à esquerda..."
                            spellCheck={false}
                        />

                        <div className="absolute bottom-6 md:bottom-12 right-10 md:right-14 text-[10px] text-zinc-600 font-mono pointer-events-none">
                            {project.lyrics.length} / 4000
                        </div>
                    </div>
                </div>

                {/* 3. RIGHT SIDEBAR - PROMPT & OUTPUT (320px) */}
                <div className={`${activeTab === 'output' ? 'flex' : 'hidden'} md:flex w-full md:w-[320px] border-l border-white/10 bg-zinc-900 overflow-y-auto custom-scrollbar flex flex-col p-5 gap-6`}>

                    <button
                        onClick={handleGenerateStructure}
                        className="w-full py-4 bg-primary hover:bg-[#e05626] rounded-xl font-bold text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                        <Cpu className="w-5 h-5" /> {t('editor.structure_final')}
                    </button>

                    {/* Prompt Output */}
                    <div data-tour="structured-prompt" className="flex-1 flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-green-400 uppercase">{t('editor.structured_prompt')}</label>
                            <button onClick={() => copyToClipboard(project.promptFinal)} className="text-zinc-500 hover:text-white"><Copy className="w-3 h-3" /></button>
                        </div>
                        <div className="flex-1 bg-black border border-white/10 rounded-xl p-4 relative group">
                            <textarea
                                value={project.promptFinal || generatedPrompt}
                                onChange={(e) => setProject({ ...project, promptFinal: e.target.value })}
                                className="w-full h-full bg-transparent text-[11px] font-mono text-green-500/90 focus:outline-none resize-none custom-scrollbar leading-relaxed"
                                placeholder="[PROMPT_GLOBAL: ...]&#10;O prompt estruturado aparecerá aqui."
                            />
                        </div>
                    </div>

                    {/* Style Tags Output */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">{t('editor.style_prompt')}</label>
                            <button onClick={handleExtractTags} className="text-[9px] bg-zinc-800 px-2 py-1 rounded text-zinc-400 hover:text-white">{t('editor.gen_styles')}</button>
                        </div>
                        <div className="bg-black border border-white/10 rounded-xl p-3 min-h-[80px] flex flex-wrap content-start gap-2">
                            {(project.extractedStyles || []).length > 0 ? (project.extractedStyles || []).map((t, i) => (
                                <span key={i} className="px-2 py-1 bg-zinc-900 text-primary border border-primary/20 rounded text-[10px] font-bold">{t}</span>
                            )) : <span className="text-[10px] text-zinc-700 italic w-full text-center mt-4">{t('editor.no_tags')}</span>}
                        </div>
                        <button onClick={() => copyToClipboard((project.extractedStyles || []).join(', '))} className="w-full mt-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-[10px] font-bold text-zinc-400 hover:text-white transition-colors">
                            Copiar Tags
                        </button>
                    </div>

                    {/* Advanced Tools */}
                    <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase mb-2 block">{t('editor.tools')}</label>
                        <button className="w-full py-2 bg-zinc-800 border border-white/5 rounded-lg text-xs text-zinc-300 flex items-center justify-center gap-2 hover:bg-zinc-700 mb-2">
                            <MoreHorizontal className="w-3 h-3" /> {t('editor.detailed_instructions')}
                        </button>
                        <input
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-white placeholder-zinc-700"
                            placeholder="Ex: Deixe mais agressivo, Salmos 23..."
                            value={customInstruction}
                            onChange={(e) => setCustomInstruction(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => window.open('https://suno.com', '_blank')}
                        className="w-full py-3.5 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-white/5 mt-auto transition-colors"
                    >
                        <Share2 className="w-3 h-3" /> {t('editor.open_suno')}
                    </button>
                </div>

                {/* Mobile Navigation Tabs */}
                <div className="md:hidden flex border-t border-white/10 bg-zinc-950 p-2 gap-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('controls')}
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'controls' ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/5 text-zinc-400'}`}
                    >
                        <Sliders className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Controles</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('lyrics')}
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'lyrics' ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/5 text-zinc-400'}`}
                    >
                        <FileText className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Letra</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('output')}
                        className={`flex-1 py-3 px-2 rounded-xl flex flex-col items-center gap-1 transition-all ${activeTab === 'output' ? 'bg-primary text-white shadow-lg shadow-primary/40' : 'bg-white/5 text-zinc-400'}`}
                    >
                        <Cpu className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">Suno/Udio</span>
                    </button>
                </div>

            </div>

            <ArsenalModal
                isOpen={showArsenal}
                onClose={() => setShowArsenal(false)}
                settings={project.arsenal}
                onChange={(newArsenal) => setProject({ ...project, arsenal: newArsenal })}
            />



            {/* Global Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-center p-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-8 mb-2">{loadingMessage}</h2>
                    <p className="text-zinc-500 text-sm">Aguarde um momento...</p>
                </div>
            )}

            {/* CUSTOM MODAL SYSTEM (Prompt, Select & Alert) */}
            {modalConfig.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
                    <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl flex flex-col gap-4 animate-in zoom-in duration-300">
                        <h2 className="text-sm font-bold text-white whitespace-pre-wrap leading-relaxed">{modalConfig.title}</h2>
                        {modalConfig.type === 'prompt' && (
                            <input
                                autoFocus
                                type="text"
                                className="w-full bg-black border border-white/10 rounded-xl p-3 text-white placeholder-zinc-700 text-sm focus:outline-none focus:border-primary/50"
                                placeholder={modalConfig.placeholder}
                                value={modalConfig.value}
                                onChange={(e) => setModalConfig({ ...modalConfig, value: e.target.value })}
                                onKeyDown={(e) => e.key === 'Enter' && modalConfig.onConfirm(modalConfig.value)}
                            />
                        )}
                        {modalConfig.type === 'select' && modalConfig.options && modalConfig.options.length > 0 && (
                            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                                {modalConfig.options.map((opt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setModalConfig({ ...modalConfig, value: opt })}
                                        className={`w-full text-left p-3 rounded-xl border text-sm transition-colors ${modalConfig.value === opt ? 'bg-primary/20 border-primary/50 text-white' : 'bg-black border-white/5 text-zinc-400 hover:bg-zinc-900 hover:text-white'}`}
                                    >
                                        {opt}
                                    </button>
                                // Indentação e estilo corrigido
                                ))}
                            </div>
                        )}
                        <div className="flex gap-2 justify-end mt-2">
                            {modalConfig.type !== 'alert' && (
                                <button
                                    className="px-4 py-2 rounded-lg text-xs font-bold text-zinc-400 hover:text-white bg-transparent transition-colors"
                                    onClick={() => modalConfig.onConfirm('')}
                                >
                                    Cancelar
                                </button>
                            )}
                            <button
                                className="px-5 py-2 min-w-[100px] rounded-lg text-xs font-bold text-white bg-primary hover:bg-[#e05626] shadow-lg shadow-primary/20 transition-all active:scale-95"
                                onClick={() => modalConfig.onConfirm(modalConfig.value)}
                            >
                                {modalConfig.type === 'prompt' ? 'Confirmar' : modalConfig.type === 'select' ? 'Escolher' : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <GuidedTour
                steps={tourSteps}
                isOpen={showTour}
                onClose={() => setShowTour(false)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />

        </motion.div>
    );
};
