
import React, { useState } from 'react';
import { X, Music, Radio, Activity, Cloud, Zap, ShieldAlert, CheckCircle2, Info, Sparkles, Plus, Power } from 'lucide-react';
import { ArsenalSettings, AudioQuality } from '../types';
import { getSystemSettings } from '../services/settingsService';
import { useLanguage } from '../contexts/LanguageContext';

interface ArsenalOption {
  value: string;
  labelKey: string;
}

export const ARSENAL_OPTIONS = {
  mastering: [
    { value: 'Radio Ready', labelKey: 'radio_ready' },
    { value: 'Raw / Demo', labelKey: 'raw' },
    { value: 'Lo-Fi', labelKey: 'lo_fi' },
    { value: 'Cassette Tape', labelKey: 'cassette' },
    { value: 'Vinyl', labelKey: 'vinyl' },
    { value: 'Wide Stereo', labelKey: 'wide_stereo' },
    { value: 'Clean Mix', labelKey: 'clean_mix' },
    { value: 'Warm (Analog)', labelKey: 'warm' }
  ] as ArsenalOption[],
  rhythm: [
    { value: 'Syncopated', labelKey: 'syncopated' },
    { value: 'Four-on-the-Floor', labelKey: 'four_floor' },
    { value: 'Half-Time', labelKey: 'half_time' },
    { value: 'Double-Time', labelKey: 'double_time' },
    { value: 'Swing / Shuffle', labelKey: 'swing' },
    { value: 'Aggressive Drums', labelKey: 'aggressive_drums' },
    { value: 'Stomp & Clap', labelKey: 'stomp' }
  ] as ArsenalOption[],
  atmosphere: [
    { value: 'Cinematic', labelKey: 'cinematic' },
    { value: 'Ethereal', labelKey: 'ethereal' },
    { value: 'Cathedral Reverb', labelKey: 'huge_reverb' },
    { value: 'Live Performance', labelKey: 'live' },
    { value: 'Intimate / Dry', labelKey: 'intimate' },
    { value: 'Dark', labelKey: 'dark' },
    { value: 'Dreamy', labelKey: 'dreamy' }
  ] as ArsenalOption[],
  effects: [
    { value: 'Autotune', labelKey: 'autotune' },
    { value: 'Distortion', labelKey: 'distortion' },
    { value: 'Delay', labelKey: 'delay' },
    { value: 'Bitcrusher', labelKey: 'bitcrusher' },
    { value: 'Chorus', labelKey: 'chorus' },
    { value: 'Sidechain', labelKey: 'sidechain' }
  ] as ArsenalOption[]
};

interface ArsenalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ArsenalSettings;
  onChange: (newSettings: ArsenalSettings) => void;
}

export const ArsenalModal: React.FC<ArsenalProps> = ({ isOpen, onClose, settings, onChange }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'master' | 'rhythm' | 'atmos' | 'inst' | 'fx'>('inst');
  const [hoveredDesc, setHoveredDesc] = useState<string | null>(null);
  const [instrumentInput, setInstrumentInput] = useState("");

  const systemSettings = getSystemSettings();
  const instrumentsList = systemSettings.listInstruments || [];

  // Early return AFTER hooks to respect React's Rules of Hooks
  if (!isOpen) return null;

  // Defensive extraction to prevent crashes if settings are undefined/partially formed
  const safeSettings: ArsenalSettings = {
    quality: settings?.quality || AudioQuality.STUDIO,
    mastering: settings?.mastering || [],
    rhythm: settings?.rhythm || [],
    atmosphere: settings?.atmosphere || [],
    effects: settings?.effects || [],
    instruments: settings?.instruments || [],
    forceInstruments: settings?.forceInstruments || false,
    reverbLevel: settings?.reverbLevel !== undefined ? settings.reverbLevel : 50,
    isReverbActive: settings?.isReverbActive || false,
  };

  const toggleSetting = (category: keyof ArsenalSettings, value: string) => {
    const currentList = (safeSettings[category] as string[]) || [];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    
    onChange({ ...safeSettings, [category]: newList });
  };

  const addInstrument = () => {
    const val = instrumentInput.trim();
    if(val && !safeSettings.instruments.includes(val)) {
        onChange({ ...safeSettings, instruments: [...safeSettings.instruments, val] });
        setInstrumentInput("");
    }
  };

  const removeInstrument = (val: string) => {
      onChange({ ...safeSettings, instruments: safeSettings.instruments.filter(i => i !== val) });
  };

  const TabButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        activeTab === id 
          ? 'border-primary text-primary' 
          : 'border-transparent text-zinc-400 hover:text-white'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#09090b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#09090b] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{t('arsenal.title')}</h2>
              <p className="text-xs text-zinc-400">{t('arsenal.subtitle')}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors bg-zinc-900 p-2 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quality Selector (Always Visible) */}
        <div className="p-4 bg-zinc-950 border-b border-white/5 flex gap-3 overflow-x-auto shrink-0 custom-scrollbar">
            {Object.values(AudioQuality).map(q => (
                <button
                    key={q}
                    onClick={() => onChange({ ...safeSettings, quality: q })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${
                        safeSettings.quality === q 
                        ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                        : 'bg-zinc-900 border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                    }`}
                >
                    <CheckCircle2 className={`w-3 h-3 ${safeSettings.quality === q ? 'opacity-100' : 'opacity-0'}`} />
                    {q}
                </button>
            ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-zinc-900 px-2 overflow-x-auto shrink-0 custom-scrollbar">
            <TabButton id="inst" icon={Music} label={t('arsenal.instruments')} />
            <TabButton id="master" icon={Radio} label={t('arsenal.mastering')} />
            <TabButton id="rhythm" icon={Activity} label={t('arsenal.rhythm')} />
            <TabButton id="atmos" icon={Cloud} label={t('arsenal.atmosphere')} />
            <TabButton id="fx" icon={Zap} label={t('arsenal.effects')} />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar bg-[#050505] flex-1">
          
          {activeTab === 'inst' && (
            <section className="animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex flex-col gap-6">
                    {/* Header Controls */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                         <div className="flex items-center gap-3">
                              <div className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors ${safeSettings.forceInstruments ? 'bg-primary' : 'bg-zinc-700'}`} onClick={() => onChange({ ...safeSettings, forceInstruments: !safeSettings.forceInstruments })}>
                                  <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${safeSettings.forceInstruments ? 'translate-x-4' : 'translate-x-0'}`} />
                              </div>
                              <label className="text-sm text-zinc-200 font-bold">{t('arsenal.force_instruments')}</label>
                         </div>
                         <div className="flex items-center gap-2 w-full md:w-auto">
                            <input 
                                value={instrumentInput}
                                onChange={(e) => setInstrumentInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addInstrument()}
                                placeholder={t('arsenal.input_placeholder')}
                                className="flex-1 md:w-64 bg-black border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-primary outline-none"
                            />
                            <button onClick={addInstrument} className="p-2 bg-zinc-800 border border-white/10 rounded-lg text-white hover:bg-zinc-700"><Plus className="w-4 h-4"/></button>
                         </div>
                    </div>

                    {/* Active Tags */}
                    {safeSettings.instruments.length > 0 && (
                        <div className="flex flex-wrap gap-2 p-4 bg-zinc-900/30 rounded-xl border border-white/5 border-dashed min-h-[60px]">
                            {safeSettings.instruments.map(inst => (
                                <span key={inst} className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold flex items-center gap-2 animate-in zoom-in duration-200">
                                    {inst}
                                    <button onClick={() => removeInstrument(inst)} className="hover:text-white"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Suggestions */}
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 flex items-center gap-2"><Sparkles className="w-3 h-3" /> {t('arsenal.suggestions')}</h4>
                        <div className="flex flex-wrap gap-2">
                            {instrumentsList.map(inst => {
                                const isSelected = safeSettings.instruments.includes(inst);
                                return (
                                    <button
                                        key={inst}
                                        onClick={() => isSelected ? removeInstrument(inst) : onChange({ ...safeSettings, instruments: [...safeSettings.instruments, inst] })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                                            isSelected 
                                            ? 'bg-zinc-900 border-zinc-700 text-zinc-600 line-through opacity-50 cursor-default' 
                                            : 'bg-zinc-900 border-white/10 text-zinc-400 hover:bg-white/10 hover:text-white hover:border-white/30'
                                        }`}
                                    >
                                        {inst}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
          )}

          {activeTab === 'master' && (
            <section className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4 pl-1 border-l-2 border-primary">{t('arsenal.headers.texture')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ARSENAL_OPTIONS.mastering.map(opt => (
                    <ToggleBadge 
                        key={opt.value} 
                        label={t(`arsenal.options.${opt.labelKey}.label`)}
                        desc={t(`arsenal.options.${opt.labelKey}.desc`)}
                        active={safeSettings.mastering.includes(opt.value)}
                        onClick={() => toggleSetting('mastering', opt.value)}
                        onHover={setHoveredDesc}
                        onLeave={() => setHoveredDesc(null)}
                    />
                ))}
                </div>
            </section>
          )}

          {activeTab === 'rhythm' && (
            <section className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4 pl-1 border-l-2 border-primary">{t('arsenal.headers.groove')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ARSENAL_OPTIONS.rhythm.map(opt => (
                    <ToggleBadge 
                        key={opt.value} 
                        label={t(`arsenal.options.${opt.labelKey}.label`)}
                        desc={t(`arsenal.options.${opt.labelKey}.desc`)}
                        active={safeSettings.rhythm.includes(opt.value)}
                        onClick={() => toggleSetting('rhythm', opt.value)}
                        onHover={setHoveredDesc}
                        onLeave={() => setHoveredDesc(null)}
                    />
                ))}
                </div>
            </section>
          )}

          {activeTab === 'atmos' && (
            <section className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                
                {/* Reverb Controller */}
                <div className="bg-zinc-900 border border-white/10 p-6 rounded-xl">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-zinc-800 rounded">
                                <Cloud className="w-4 h-4 text-zinc-400" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-zinc-200 block">{t('arsenal.reverb')}</label>
                                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{safeSettings.isReverbActive ? t('arsenal.active') : t('arsenal.off')}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => onChange({ ...safeSettings, isReverbActive: !safeSettings.isReverbActive })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${safeSettings.isReverbActive ? 'bg-primary' : 'bg-zinc-700'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${safeSettings.isReverbActive ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className={`transition-all duration-300 ${safeSettings.isReverbActive ? 'opacity-100' : 'opacity-30 pointer-events-none grayscale'}`}>
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs text-zinc-400 font-medium">{t('arsenal.intensity')}</span>
                            <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded">{safeSettings.reverbLevel !== undefined ? safeSettings.reverbLevel : 50}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max="100" 
                            value={safeSettings.reverbLevel !== undefined ? safeSettings.reverbLevel : 50}
                            onChange={(e) => onChange({ ...safeSettings, reverbLevel: parseInt(e.target.value) })}
                            className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-zinc-500 font-bold uppercase">
                            <span>{t('arsenal.dry')}</span>
                            <span>{t('arsenal.wet')}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4 pl-1 border-l-2 border-primary">{t('arsenal.headers.vibe')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {ARSENAL_OPTIONS.atmosphere.map(opt => (
                        <ToggleBadge 
                            key={opt.value} 
                            label={t(`arsenal.options.${opt.labelKey}.label`)}
                            desc={t(`arsenal.options.${opt.labelKey}.desc`)}
                            active={safeSettings.atmosphere.includes(opt.value)}
                            onClick={() => toggleSetting('atmosphere', opt.value)}
                            onHover={setHoveredDesc}
                            onLeave={() => setHoveredDesc(null)}
                        />
                    ))}
                    </div>
                </div>

                {safeSettings.atmosphere.includes('Live Performance') && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-3 animate-in fade-in">
                        <ShieldAlert className="w-5 h-5 text-yellow-500" />
                        <p className="text-xs text-yellow-200">{t('arsenal.live_warning')}</p>
                    </div>
                )}
            </section>
          )}

           {activeTab === 'fx' && (
            <section className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h3 className="text-sm font-bold text-zinc-500 uppercase mb-4 pl-1 border-l-2 border-primary">{t('arsenal.headers.post')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {ARSENAL_OPTIONS.effects.map(opt => (
                    <ToggleBadge 
                        key={opt.value} 
                        label={t(`arsenal.options.${opt.labelKey}.label`)}
                        desc={t(`arsenal.options.${opt.labelKey}.desc`)}
                        active={safeSettings.effects.includes(opt.value)}
                        onClick={() => toggleSetting('effects', opt.value)}
                        onHover={setHoveredDesc}
                        onLeave={() => setHoveredDesc(null)}
                    />
                ))}
                </div>
            </section>
          )}

        </div>

        {/* Info Panel & Footer (Fixed) */}
        <div className="border-t border-white/10 bg-[#09090b] shrink-0 flex flex-col relative z-20">
            
            {/* Dynamic Description Box - Fixed Height to prevent jumping */}
            <div className="h-[80px] px-6 py-3 flex items-center justify-center border-b border-white/5 bg-zinc-900/80 backdrop-blur-sm">
                {hoveredDesc ? (
                    <div className="w-full flex gap-4 items-center animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <div className="p-2 bg-primary/20 rounded-full shrink-0">
                            <Info className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-sm text-zinc-200 leading-relaxed font-medium">{hoveredDesc}</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-zinc-600 text-xs italic opacity-50">
                        <Sparkles className="w-3 h-3" />
                        {t('arsenal.suggestions')}
                    </div>
                )}
            </div>

            {/* Action Button */}
            <div className="p-4 bg-[#09090b]">
                <button 
                    onClick={onClose}
                    className="w-full py-3.5 bg-primary hover:bg-violet-600 text-white font-bold rounded-xl transition-all shadow-[0_4px_20px_rgba(139,92,246,0.3)] active:scale-[0.99] flex items-center justify-center gap-2"
                >
                    <CheckCircle2 className="w-5 h-5" />
                    {t('arsenal.confirm')}
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

interface ToggleBadgeProps {
  label: string;
  desc: string;
  active: boolean;
  onClick: () => void;
  onHover: (desc: string) => void;
  onLeave: () => void;
}

const ToggleBadge: React.FC<ToggleBadgeProps> = ({ 
  label,
  desc,
  active, 
  onClick,
  onHover,
  onLeave
}) => {
  return (
    <button
        onClick={onClick}
        onMouseEnter={() => onHover(desc)}
        onMouseLeave={onLeave}
        className={`
            relative overflow-hidden px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 border flex flex-col items-center justify-center text-center gap-1 h-full min-h-[70px] w-full
            ${active
                ? 'bg-primary/20 border-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20 hover:bg-white/5 hover:text-zinc-200'
            }
        `}
    >
        {active && <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-bl-md shadow-[0_0_5px_#8b5cf6]" />}
        {label}
    </button>
  );
};
