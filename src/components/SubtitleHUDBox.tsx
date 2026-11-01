import { useState } from 'react';
import { Volume2, Play, Pause, SkipForward, SkipBack, Copy, Check, Sparkles, Mic } from 'lucide-react';
import { DialogueLine, HUDSettings, LanguageOption, VoiceProfile } from '../types/hud';
import { AudioWaveform } from './AudioWaveform';
import { voiceEngine } from '../services/voiceEngine';

interface SubtitleHUDBoxProps {
  currentLine: DialogueLine;
  totalLines: number;
  currentLineIndex: number;
  onNextLine: () => void;
  onPrevLine: () => void;
  settings: HUDSettings;
  sourceLangOption: LanguageOption;
  targetLangOption: LanguageOption;
  currentVoice: VoiceProfile;
  isPlayingAudio: boolean;
  onPlayDub: () => void;
  onStopDub: () => void;
}

export function SubtitleHUDBox({
  currentLine,
  totalLines,
  currentLineIndex,
  onNextLine,
  onPrevLine,
  settings,
  sourceLangOption,
  targetLangOption,
  currentVoice,
  isPlayingAudio,
  onPlayDub,
  onStopDub,
}: SubtitleHUDBoxProps) {
  const [copied, setCopied] = useState(false);

  // Get translated line or fallback
  const translatedText =
    currentLine.translations[settings.targetLanguage] ||
    currentLine.translations['pt-BR'] ||
    currentLine.originalText;

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Subtitle style classes
  const getStyleClasses = () => {
    switch (settings.subtitleStyle) {
      case 'neon':
        return 'bg-slate-950/90 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.35)]';
      case 'manga':
        return 'bg-black/95 border-amber-400/40 shadow-[0_0_25px_rgba(251,191,36,0.25)]';
      case 'glass':
        return 'bg-slate-900/40 border-white/20 backdrop-blur-2xl shadow-2xl';
      case 'cyber':
      default:
        return 'bg-slate-950/85 border-white/20 backdrop-blur-xl shadow-2xl';
    }
  };

  // Font size classes
  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case 'sm':
        return 'text-xs sm:text-sm';
      case 'lg':
        return 'text-base sm:text-lg';
      case 'xl':
        return 'text-lg sm:text-xl';
      case 'base':
      default:
        return 'text-sm sm:text-base';
    }
  };

  // Position classes
  const getPositionClass = () => {
    switch (settings.subtitlePosition) {
      case 'top':
        return 'mt-6 mb-auto';
      case 'center':
        return 'my-auto';
      case 'bottom':
      default:
        return 'mb-14 sm:mb-18 mt-auto';
    }
  };

  return (
    <div
      className={`relative z-10 mx-auto w-11/12 max-w-lg ${getPositionClass()} ${getStyleClasses()} border p-4 sm:p-5 rounded-2xl transition-all duration-300 text-center select-none group`}
    >
      {/* Top Meta Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] font-mono">
        {/* Language conversion pill */}
        <div className="flex items-center gap-1.5 text-cyan-400 font-semibold tracking-wider">
          <span className="text-slate-300">{sourceLangOption.flag} {sourceLangOption.code.toUpperCase()}</span>
          <span className="text-pink-400">➔</span>
          <span className="text-cyan-300 font-bold">{targetLangOption.flag} {targetLangOption.code.toUpperCase()}</span>
          <span className="hidden sm:inline text-slate-500">· {targetLangOption.label}</span>
        </div>

        {/* Voice profile & Character indicator */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden xs:inline">
            {currentLine.character}
          </span>
          <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono text-[9px]">
            {currentVoice.name}
          </span>
        </div>
      </div>

      {/* Japanese Original & Romaji (if enabled) */}
      <div className="mb-2.5">
        <div className="text-xs sm:text-sm text-slate-300/90 font-medium tracking-wide">
          {currentLine.originalText}
        </div>
        {settings.showRomaji && currentLine.romaji && (
          <div className="text-[11px] text-slate-400 font-mono italic mt-0.5">
            {currentLine.romaji}
          </div>
        )}
      </div>

      {/* Main Translated Subtitle Line (Dubbed Text) */}
      <div className="relative py-1">
        <blockquote className={`${getFontSizeClass()} font-bold text-white tracking-wide leading-relaxed font-display`}>
          "{translatedText}"
        </blockquote>
      </div>

      {/* Audio Waveform Equalizer (reacts when audio dub is playing) */}
      <div className="my-2.5 flex items-center justify-center">
        <AudioWaveform
          isActive={isPlayingAudio}
          barCount={settings.gameTurbo ? 22 : 16}
          height={22}
          colorScheme={settings.gameTurbo ? 'gradient' : 'cyan'}
        />
      </div>

      {/* Subtitle Control Bar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2 text-xs">
        {/* Navigation Lines: Prev / Next */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              onPrevLine();
              voiceEngine.playSoundEffect('click');
            }}
            disabled={currentLineIndex === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Fala anterior"
            aria-label="Fala anterior"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 tabular-nums px-1">
            {currentLineIndex + 1}/{totalLines}
          </span>
          <button
            onClick={() => {
              onNextLine();
              voiceEngine.playSoundEffect('click');
            }}
            disabled={currentLineIndex === totalLines - 1}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
            title="Próxima fala"
            aria-label="Próxima fala"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Play/Listen Dub Button */}
        <button
          onClick={() => {
            if (isPlayingAudio) {
              onStopDub();
            } else {
              onPlayDub();
            }
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shadow-md ${
            isPlayingAudio
              ? 'bg-rose-500 text-white shadow-rose-500/30 animate-pulse'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/20 active:scale-95'
          }`}
          title="Ouvir dublagem em tempo real com a voz sintetizada do personagem"
        >
          {isPlayingAudio ? (
            <>
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pausar Dub</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5" />
              <span>Ouvir Dublagem IA</span>
            </>
          )}
        </button>

        {/* Copy Subtitle Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/10 transition-colors cursor-pointer"
            title="Copiar texto da legenda"
            aria-label="Copiar legenda"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
