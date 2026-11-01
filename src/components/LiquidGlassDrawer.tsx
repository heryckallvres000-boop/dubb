import { useState } from 'react';
import { X, Volume2, Globe, Sliders, User, Mic, Type, Sparkles, RefreshCw, Play, Check } from 'lucide-react';
import { AnimeScene, HUDSettings, LanguageCode, LanguageOption, VoiceProfile, SubtitleStyle, SubtitlePosition } from '../types/hud';
import { TOP_LANGUAGES, VOICE_PROFILES } from '../data/animeScenes';
import { voiceEngine } from '../services/voiceEngine';

interface LiquidGlassDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: HUDSettings;
  onUpdateSettings: (updates: Partial<HUDSettings>) => void;
  currentVoice: VoiceProfile;
  currentScene: AnimeScene;
  onSpeakTest: (text: string, voice: VoiceProfile) => void;
  isTestingVoice: boolean;
}

export function LiquidGlassDrawer({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  currentVoice,
  currentScene,
  onSpeakTest,
  isTestingVoice,
}: LiquidGlassDrawerProps) {
  const [customPhrase, setCustomPhrase] = useState('');
  const [testSent, setTestSent] = useState(false);

  const handleCustomSpeak = () => {
    const textToSpeak = customPhrase.trim() || 'AuraDub ativado com sucesso!';
    onSpeakTest(textToSpeak, currentVoice);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 2000);
  };

  const swapLanguages = () => {
    const prevSource = settings.sourceLanguage;
    const prevTarget = settings.targetLanguage;
    onUpdateSettings({
      sourceLanguage: prevTarget,
      targetLanguage: prevSource,
    });
    voiceEngine.playSoundEffect('switch');
  };

  return (
    <aside
      id="hud-drawer"
      aria-label="Painel de Configurações AuraDub"
      className={`fixed top-0 right-0 bottom-0 z-40 w-80 sm:w-96 liquid-drawer flex flex-col p-5 overflow-y-auto space-y-4 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Cabeçalho do Drawer */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div>
          <h2 className="font-bold text-sm text-white font-display flex items-center gap-2">
            AuraDub Settings
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </h2>
          <p className="text-[10px] text-slate-400">Painel de Controle Flutuante</p>
        </div>
        <button
          id="close-btn"
          onClick={() => {
            onClose();
            voiceEngine.playSoundEffect('click');
          }}
          className="p-1.5 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
          title="Fechar painel"
          aria-label="Fechar painel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Card 1: Dublagem Automática */}
      <div className="liquid-card p-3.5 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">Dublagem Automática</span>
          <span className="text-[10px] text-cyan-400">
            {settings.autoDubbing ? 'Ativo em Tempo Real' : 'Pausado Manualmente'}
          </span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoDubbing}
            onChange={(e) => {
              onUpdateSettings({ autoDubbing: e.target.checked });
              voiceEngine.playSoundEffect('click');
            }}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
        </label>
      </div>

      {/* Card 2: Top 10 Idiomas */}
      <div className="liquid-card p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Idiomas (Top 10 Globais)
          </span>
          <button
            onClick={swapLanguages}
            className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/40 border border-cyan-500/20 cursor-pointer"
            title="Inverter idiomas"
          >
            ⇄ Inverter
          </button>
        </div>

        <div>
          <label className="text-[9px] text-slate-400 block uppercase font-semibold mb-1">
            Áudio de Origem (Anime)
          </label>
          <select
            value={settings.sourceLanguage}
            onChange={(e) => {
              onUpdateSettings({ sourceLanguage: e.target.value as LanguageCode });
              voiceEngine.playSoundEffect('switch');
            }}
            className="w-full bg-slate-900 border border-white/15 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {TOP_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900">
                {lang.flag} {lang.label} ({lang.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[9px] text-slate-400 block uppercase font-semibold mb-1">
            Sua Dublagem (Destino)
          </label>
          <select
            value={settings.targetLanguage}
            onChange={(e) => {
              onUpdateSettings({ targetLanguage: e.target.value as LanguageCode });
              voiceEngine.playSoundEffect('switch');
            }}
            className="w-full bg-slate-900 border border-white/15 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
          >
            {TOP_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-slate-900">
                {lang.flag} {lang.label} ({lang.code.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Card 3: Mixer de Volume */}
      <div className="liquid-card p-3.5 space-y-3">
        {/* Dub Volume */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-white">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Volume da Dublagem IA
            </span>
            <span className="text-cyan-400 font-mono tabular-nums">{settings.dubVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.dubVolume}
            onChange={(e) => onUpdateSettings({ dubVolume: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Original Volume */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-white">
            <span className="text-slate-300">Áudio Original do Anime</span>
            <span className="text-slate-400 font-mono tabular-nums">{settings.originalVolume}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.originalVolume}
            onChange={(e) => onUpdateSettings({ originalVolume: Number(e.target.value) })}
            className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
        </div>

        {/* Smart Audio Ducking */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] font-semibold text-white block">Auto-Ducking Dinâmico</span>
            <span className="text-[9px] text-slate-400">Diminui ruído de fundo ao falar</span>
          </div>
          <input
            type="checkbox"
            checked={settings.audioDucking}
            onChange={(e) => onUpdateSettings({ audioDucking: e.target.checked })}
            className="w-4 h-4 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Card 4: Perfis de Voz */}
      <div className="liquid-card p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-pink-400" />
            Perfil de Voz do Personagem
          </span>
          <span className="text-[9px] font-mono text-cyan-400">
            Pitch: {currentVoice.pitch}x
          </span>
        </div>

        <select
          value={settings.selectedVoiceId}
          onChange={(e) => {
            onUpdateSettings({ selectedVoiceId: e.target.value });
            voiceEngine.playSoundEffect('switch');
          }}
          className="w-full bg-slate-900 border border-white/15 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
        >
          {VOICE_PROFILES.map((voice) => (
            <option key={voice.id} value={voice.id} className="bg-slate-900">
              {voice.name} ({voice.description})
            </option>
          ))}
        </select>

        {/* Selected voice details */}
        <div className="bg-slate-950/60 border border-white/10 rounded-xl p-2 text-[11px] space-y-1">
          <div className="flex justify-between text-slate-300">
            <span>Anime de Origem:</span>
            <span className="font-semibold text-white">{currentVoice.anime}</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Timbre & Cadência:</span>
            <span className="text-cyan-300">{currentVoice.description}</span>
          </div>
        </div>

        {/* Test voice synthesis button */}
        <button
          onClick={() => {
            const previewPhrases: Record<string, string> = {
              snk: 'Eu vou lutar até o fim!',
              jjk: 'Não se preocupe, eu sou o mais forte.',
              cp: 'Eu sou especial, vou até a lua.',
              ds: 'Incendeie seu coração!',
            };
            const phrase = previewPhrases[currentScene.id] || 'Teste de voz do sistema AuraDub.';
            onSpeakTest(phrase, currentVoice);
          }}
          disabled={isTestingVoice}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-500/30 text-xs font-semibold text-pink-300 hover:text-white hover:border-pink-400 transition-all cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{isTestingVoice ? 'Falando agora...' : 'Testar Tom da Voz 🔊'}</span>
        </button>
      </div>

      {/* Card 5: Customizador da Legenda */}
      <div className="liquid-card p-3.5 space-y-2.5">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-amber-400" />
          Estilo da Legenda HUD
        </span>

        {/* Style Selector */}
        <div className="grid grid-cols-3 gap-1 text-[11px]">
          {(['cyber', 'glass', 'neon'] as SubtitleStyle[]).map((st) => (
            <button
              key={st}
              onClick={() => onUpdateSettings({ subtitleStyle: st })}
              className={`py-1 rounded-lg border capitalize cursor-pointer transition-all ${
                settings.subtitleStyle === st
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Size Selector */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-400 text-[10px]">Tamanho da Fonte</span>
          <div className="flex gap-1">
            {(['sm', 'base', 'lg'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => onUpdateSettings({ fontSize: sz })}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border cursor-pointer ${
                  settings.fontSize === sz
                    ? 'bg-white/20 border-white text-white font-bold'
                    : 'bg-white/5 border-white/10 text-slate-400'
                }`}
              >
                {sz.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Romaji toggle */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[11px] font-semibold text-white block">Exibir Romaji</span>
            <span className="text-[9px] text-slate-400">Transliteração fonética japonesa</span>
          </div>
          <input
            type="checkbox"
            checked={settings.showRomaji}
            onChange={(e) => onUpdateSettings({ showRomaji: e.target.checked })}
            className="w-4 h-4 accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Card 6: Testar Frase Personalizada */}
      <div className="liquid-card p-3.5 space-y-2">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          Falar Frase Customizada
        </span>
        <div className="flex gap-1.5">
          <input
            type="text"
            value={customPhrase}
            onChange={(e) => setCustomPhrase(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomSpeak()}
            placeholder="Digite algo para dublar..."
            className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleCustomSpeak}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center shrink-0"
            title="Sintetizar fala"
          >
            {testSent ? <Check className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
        </div>
      </div>
    </aside>
  );
}
