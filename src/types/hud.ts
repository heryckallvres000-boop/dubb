export type LanguageCode =
  | 'ja'
  | 'pt-BR'
  | 'en'
  | 'es'
  | 'fr'
  | 'de'
  | 'it'
  | 'ko'
  | 'ru'
  | 'zh';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  flag: string;
  speechLang: string;
}

export interface DialogueLine {
  id: string;
  originalText: string;
  romaji?: string;
  character: string;
  timestamp: string;
  translations: Record<LanguageCode, string>;
}

export interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  anime: string;
  pitch: number;
  rate: number;
  bassGain: number; // dB
  trebleGain: number; // dB
  distortion: number; // 0 to 1
  gender: 'male' | 'female' | 'other';
  colorTag: string;
}

export interface AnimeScene {
  id: string;
  title: string;
  animeName: string;
  episode: string;
  backgroundUrl: string;
  character: string;
  defaultVoiceId: string;
  lines: DialogueLine[];
  bgAmbient: 'battle' | 'city' | 'cyber' | 'blade';
}

export type SubtitleStyle = 'cyber' | 'glass' | 'neon' | 'manga';
export type SubtitlePosition = 'bottom' | 'center' | 'top';

export interface HUDSettings {
  autoDubbing: boolean;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  dubVolume: number; // 0 to 100
  originalVolume: number; // 0 to 100
  audioDucking: boolean;
  selectedVoiceId: string;
  gameTurbo: boolean;
  showRomaji: boolean;
  subtitleStyle: SubtitleStyle;
  subtitlePosition: SubtitlePosition;
  fontSize: 'sm' | 'base' | 'lg' | 'xl';
  lowLatencyMode: boolean;
  autoPlayScene: boolean;
}
