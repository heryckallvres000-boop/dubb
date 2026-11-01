import { Zap, Tv, SlidersHorizontal, Volume2, Sparkles } from 'lucide-react';
import { AnimeScene, HUDSettings } from '../types/hud';
import { voiceEngine } from '../services/voiceEngine';

interface HeaderHUDProps {
  currentScene: AnimeScene;
  allScenes: AnimeScene[];
  onSelectScene: (scene: AnimeScene) => void;
  settings: HUDSettings;
  onUpdateSettings: (updates: Partial<HUDSettings>) => void;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
}

export function HeaderHUD({
  currentScene,
  allScenes,
  onSelectScene,
  settings,
  onUpdateSettings,
  onToggleDrawer,
  isDrawerOpen,
}: HeaderHUDProps) {
  const toggleTurbo = () => {
    const nextTurbo = !settings.gameTurbo;
    onUpdateSettings({ gameTurbo: nextTurbo });
    voiceEngine.playSoundEffect(nextTurbo ? 'turbo' : 'switch');
  };

  return (
    <header className="relative z-20 px-3 py-2.5 sm:px-5 sm:py-3 flex items-center justify-between bg-slate-950/75 backdrop-blur-md border-b border-white/10">
      {/* Brand Zone */}
      <div className="flex items-center gap-2.5 shrink-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-400 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-black text-xs shadow-[0_0_12px_rgba(6,182,212,0.6)]">
          ⚡
        </div>
        <div>
          <h1 className="font-bold text-xs sm:text-sm tracking-wider text-white font-display flex items-center gap-2">
            AURADUB HUD
            <span className="hidden sm:inline-block text-[10px] text-cyan-400/80 font-normal border border-cyan-500/30 px-1.5 py-0.2 rounded bg-cyan-950/40">
              v2.5 AI
            </span>
          </h1>
        </div>
      </div>

      {/* Middle Zone: Scene Switcher Selector */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center bg-slate-900/80 border border-white/15 rounded-xl px-2.5 py-1 text-xs text-slate-200">
          <Tv className="w-3.5 h-3.5 text-cyan-400 mr-1.5 shrink-0" />
          <select
            value={currentScene.id}
            onChange={(e) => {
              const selected = allScenes.find((s) => s.id === e.target.value);
              if (selected) {
                onSelectScene(selected);
                voiceEngine.playSoundEffect('switch');
              }
            }}
            className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-2 font-medium"
            aria-label="Selecionar Cena de Anime"
          >
            {allScenes.map((scene) => (
              <option key={scene.id} value={scene.id} className="bg-slate-900 text-slate-200">
                {scene.animeName} - {scene.character}
              </option>
            ))}
          </select>
        </div>

        {/* Live Audio indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl">
          <Volume2 className="w-3 h-3 text-cyan-400" />
          <span className="tabular-nums font-mono text-cyan-300">{settings.dubVolume}%</span>
        </div>
      </div>

      {/* Right Zone: Game Turbo & Drawer Toggle */}
      <div className="flex items-center gap-2">
        {/* Modo Game Turbo Toggle */}
        <button
          onClick={toggleTurbo}
          className={`flex items-center gap-1.5 text-[10px] sm:text-xs px-2.5 py-1 sm:py-1.5 rounded-full font-semibold border transition-all cursor-pointer ${
            settings.gameTurbo
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
              : 'bg-slate-900/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
          }`}
          title="Alternar Modo Game Turbo (Baixa Latência)"
        >
          <Zap className={`w-3.5 h-3.5 ${settings.gameTurbo ? 'text-cyan-400 fill-cyan-400 animate-pulse' : 'text-slate-400'}`} />
          <span className="hidden xs:inline">Modo Game Turbo</span>
          <span className="xs:hidden">Turbo</span>
          <span className="text-[9px] uppercase tracking-wide opacity-80">
            {settings.gameTurbo ? 'Ativo' : 'Off'}
          </span>
        </button>

        {/* Drawer Trigger Shortcut */}
        <button
          onClick={onToggleDrawer}
          className={`p-1.5 sm:p-2 rounded-xl border transition-colors cursor-pointer flex items-center justify-center ${
            isDrawerOpen
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="Abrir Painel de Configurações AuraDub"
          aria-label="Abrir Painel de Configurações"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
