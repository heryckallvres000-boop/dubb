import { VoiceProfile } from '../types/hud';

class VoiceEngineService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private isSpeaking: boolean = false;
  private synth: SpeechSynthesis | null = null;
  private dataArray: Uint8Array<ArrayBuffer> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
    }
  }

  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.analyser = this.audioCtx.createAnalyser();
        this.analyser.fftSize = 64;
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.connect(this.analyser);
        this.analyser.connect(this.audioCtx.destination);
        this.dataArray = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public getFrequencyData(): Uint8Array<ArrayBuffer> {
    if (this.analyser && this.dataArray) {
      this.analyser.getByteFrequencyData(this.dataArray);
      return this.dataArray;
    }
    return new Uint8Array(new ArrayBuffer(32)).fill(0);
  }

  public playSoundEffect(type: 'turbo' | 'click' | 'power' | 'switch') {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      if (type === 'turbo') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'power') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(440, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'switch') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.05);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch {
      // Audio playback failsafe
    }
  }

  public speak(
    text: string,
    langCode: string,
    voiceProfile: VoiceProfile,
    volume: number,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onStart) onStart();
      setTimeout(() => {
        if (onEnd) onEnd();
      }, 2000);
      return;
    }

    this.initAudio();
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = Math.max(0, Math.min(1, volume / 100));
    utterance.pitch = voiceProfile.pitch;
    utterance.rate = voiceProfile.rate;
    utterance.lang = langCode;

    // Pick best matching available system voice
    const voices = this.synth.getVoices();
    if (voices && voices.length > 0) {
      const langPrefix = langCode.split('-')[0].toLowerCase();
      const matched = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) &&
          (voiceProfile.gender === 'female'
            ? v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('woman') || v.name.toLowerCase().includes('maria') || v.name.toLowerCase().includes('zira')
            : !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('woman'))
      ) || voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

      if (matched) {
        utterance.voice = matched;
      }
    }

    // Simulate audio analyzer activity with subtle carrier oscillator
    let carrierOsc: OscillatorNode | null = null;
    let carrierGain: GainNode | null = null;

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.audioCtx && this.analyser) {
        try {
          carrierOsc = this.audioCtx.createOscillator();
          carrierGain = this.audioCtx.createGain();
          carrierOsc.type = 'sine';
          carrierOsc.frequency.setValueAtTime(240 * voiceProfile.pitch, this.audioCtx.currentTime);
          carrierGain.gain.setValueAtTime(0.0001, this.audioCtx.currentTime); // Inaudible or ultra-quiet carrier to drive analyser
          carrierOsc.connect(carrierGain);
          carrierGain.connect(this.analyser);
          carrierOsc.start();
        } catch {
          // ignore
        }
      }
      if (onStart) onStart();
    };

    const cleanup = () => {
      this.isSpeaking = false;
      if (carrierOsc) {
        try {
          carrierOsc.stop();
          carrierOsc.disconnect();
        } catch {
          // ignore
        }
        carrierOsc = null;
      }
      if (onEnd) onEnd();
    };

    utterance.onend = cleanup;
    utterance.onerror = cleanup;

    this.synth.speak(utterance);
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const voiceEngine = new VoiceEngineService();
