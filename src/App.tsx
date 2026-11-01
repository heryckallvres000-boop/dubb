import { useState, useEffect, useCallback, useMemo } from 'react';
import { AnimeScene, HUDSettings, VoiceProfile } from './types/hud';
import { ANIME_SCENES, TOP_LANGUAGES, VOICE_PROFILES } from './data/animeScenes';
import { voiceEngine } from './services/voiceEngine';
import { HeaderHUD } from './components/HeaderHUD';
import { AnimePlayerStage } from './components/AnimePlayerStage';
import { SubtitleHUDBox } from './components/SubtitleHUDBox';
import { LiquidGlassDrawer } from './components/LiquidGlassDrawer';
import { FooterHUD } from './components/FooterHUD';

export default function App() {
  // Current anime scene
  const [currentScene, setCurrentScene] = useState<AnimeScene>(ANIME_SCENES[0]);
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(0);

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Audio / Playback states
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isPlayingScene, setIsPlayingScene] = useState<boolean>(false);
  const [isTestingVoice, setIsTestingVoice] = useState<boolean>(false);

  // HUD Settings
  const [settings, setSettings] = useState<HUDSettings>({
    autoDubbing: true,
    sourceLanguage: 'ja',
    targetLanguage: 'pt-BR',
    dubVolume: 85,
    originalVolume: 40,
    audioDucking: true,
    selectedVoiceId: ANIME_SCENES[0].defaultVoiceId,
    gameTurbo: true,
    showRomaji: true,
    subtitleStyle: 'cyber',
    subtitlePosition: 'bottom',
    fontSize: 'base',
    lowLatencyMode: true,
    autoPlayScene: false,
  });

  // Current active line
  const currentLine = currentScene.lines[currentLineIndex] || currentScene.lines[0];

  // Current active voice profile
  const currentVoice = useMemo<VoiceProfile>(() => {
    return (
      VOICE_PROFILES.find((v) => v.id === settings.selectedVoiceId) ||
      VOICE_PROFILES[0]
    );
  }, [settings.selectedVoiceId]);

  // Current language options
  const sourceLangOption = useMemo(() => {
    return (
      TOP_LANGUAGES.find((l) => l.code === settings.sourceLanguage) ||
      TOP_LANGUAGES[0]
    );
  }, [settings.sourceLanguage]);

  const targetLangOption = useMemo(() => {
    return (
      TOP_LANGUAGES.find((l) => l.code === settings.targetLanguage) ||
      TOP_LANGUAGES[1]
    );
  }, [settings.targetLanguage]);

  // Handle scene selection
  const handleSelectScene = (scene: AnimeScene) => {
    setCurrentScene(scene);
    setCurrentLineIndex(0);
    // Sync default voice of scene if not manually customized
    setSettings((prev) => ({
      ...prev,
      selectedVoiceId: scene.defaultVoiceId,
    }));
    voiceEngine.stopSpeaking();
    setIsPlayingAudio(false);
  };

  // Play Dubbed Voice for current line
  const handlePlayDub = useCallback(() => {
    const textToSpeak =
      currentLine.translations[settings.targetLanguage] ||
      currentLine.translations['pt-BR'] ||
      currentLine.originalText;

    voiceEngine.speak(
      textToSpeak,
      targetLangOption.speechLang,
      currentVoice,
      settings.dubVolume,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  }, [currentLine, settings.targetLanguage, settings.dubVolume, targetLangOption.speechLang, currentVoice]);

  const handleStopDub = useCallback(() => {
    voiceEngine.stopSpeaking();
    setIsPlayingAudio(false);
  }, []);

  // Update line index
  const handleNextLine = useCallback(() => {
    if (currentLineIndex < currentScene.lines.length - 1) {
      setCurrentLineIndex((prev) => prev + 1);
    }
  }, [currentLineIndex, currentScene.lines.length]);

  const handlePrevLine = useCallback(() => {
    if (currentLineIndex > 0) {
      setCurrentLineIndex((prev) => prev - 1);
    }
  }, [currentLineIndex]);

  // Auto-dubbing trigger when line changes if enabled
  useEffect(() => {
    if (settings.autoDubbing && isPlayingScene) {
      handlePlayDub();
    }
  }, [currentLineIndex, settings.autoDubbing, isPlayingScene, handlePlayDub]);

  // Scene auto-advance timer when scene is playing
  useEffect(() => {
    if (!isPlayingScene) return;

    const interval = setInterval(() => {
      setCurrentLineIndex((prev) => {
        if (prev < currentScene.lines.length - 1) {
          return prev + 1;
        } else {
          return 0; // Loop scene
        }
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isPlayingScene, currentScene.lines.length]);

  // Voice test speech
  const handleSpeakTest = (text: string, voice: VoiceProfile) => {
    setIsTestingVoice(true);
    voiceEngine.speak(
      text,
      targetLangOption.speechLang,
      voice,
      settings.dubVolume,
      () => setIsTestingVoice(true),
      () => setIsTestingVoice(false)
    );
  };

  // Settings update helper
  const handleUpdateSettings = (updates: Partial<HUDSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (isPlayingAudio) {
          handleStopDub();
        } else {
          handlePlayDub();
        }
      } else if (e.key === 'h' || e.key === 'H') {
        setIsDrawerOpen((prev) => !prev);
        voiceEngine.playSoundEffect('switch');
      } else if (e.key === 'ArrowRight') {
        handleNextLine();
      } else if (e.key === 'ArrowLeft') {
        handlePrevLine();
      } else if (e.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayingAudio, handlePlayDub, handleStopDub, handleNextLine, handlePrevLine]);

  return (
    <div className="relative flex flex-col justify-between h-screen w-screen overflow-hidden bg-[#030508] text-slate-100 select-none">
      {/* Background Anime Player Simulation Stage */}
      <AnimePlayerStage
        currentScene={currentScene}
        isPlayingScene={isPlayingScene}
        onTogglePlayScene={() => {
          setIsPlayingScene((prev) => !prev);
          voiceEngine.playSoundEffect('click');
        }}
        onRestartScene={() => {
          setCurrentLineIndex(0);
          voiceEngine.playSoundEffect('power');
        }}
        settings={settings}
        currentLineIndex={currentLineIndex}
      />

      {/* Top Header Navigation */}
      <HeaderHUD
        currentScene={currentScene}
        allScenes={ANIME_SCENES}
        onSelectScene={handleSelectScene}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onToggleDrawer={() => {
          setIsDrawerOpen((prev) => !prev);
          voiceEngine.playSoundEffect('switch');
        }}
        isDrawerOpen={isDrawerOpen}
      />

      {/* Central Floating Subtitle HUD */}
      <SubtitleHUDBox
        currentLine={currentLine}
        totalLines={currentScene.lines.length}
        currentLineIndex={currentLineIndex}
        onNextLine={handleNextLine}
        onPrevLine={handlePrevLine}
        settings={settings}
        sourceLangOption={sourceLangOption}
        targetLangOption={targetLangOption}
        currentVoice={currentVoice}
        isPlayingAudio={isPlayingAudio}
        onPlayDub={handlePlayDub}
        onStopDub={handleStopDub}
      />

      {/* Side Trigger Button (Exact match from prototype with glowing gradient tab) */}
      <button
        id="trigger-btn"
        onClick={() => {
          setIsDrawerOpen((prev) => !prev);
          voiceEngine.playSoundEffect('click');
        }}
        aria-label="Alternar Painel AuraDub"
        aria-expanded={isDrawerOpen}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-30 w-8 h-20 sm:w-9 sm:h-24 bg-gradient-to-b from-cyan-400 via-purple-600 to-pink-500 rounded-l-2xl shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center justify-center text-white font-bold text-lg hover:w-11 transition-all cursor-pointer group active:scale-95"
      >
        <span className={`transform transition-transform duration-300 ${isDrawerOpen ? 'rotate-180' : 'group-hover:-translate-x-0.5'}`}>
          〈
        </span>
      </button>

      {/* Backdrop overlay for mobile when drawer is open */}
      {isDrawerOpen && (
        <div
          onClick={() => setIsDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-35 sm:hidden transition-opacity"
        />
      )}

      {/* Liquid Glass Drawer */}
      <LiquidGlassDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        currentVoice={currentVoice}
        currentScene={currentScene}
        onSpeakTest={handleSpeakTest}
        isTestingVoice={isTestingVoice}
      />

      {/* Bottom Screen Footer */}
      <FooterHUD onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)} />
    </div>
  );
}
