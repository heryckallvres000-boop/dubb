import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';
import { AnimeScene, HUDSettings } from '../types/hud';

interface AnimePlayerStageProps {
  currentScene: AnimeScene;
  isPlayingScene: boolean;
  onTogglePlayScene: () => void;
  onRestartScene: () => void;
  settings: HUDSettings;
  currentLineIndex: number;
}

export function AnimePlayerStage({
  currentScene,
  isPlayingScene,
  onTogglePlayScene,
  onRestartScene,
  settings,
  currentLineIndex,
}: AnimePlayerStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Subtle floating anime particles canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool based on ambient type
    const count = settings.gameTurbo ? 35 : 20;
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: -Math.random() * 1.2 - 0.3,
      alpha: Math.random() * 0.7 + 0.3,
      pulse: Math.random() * 0.05,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * 0.003) * p.pulse;

        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

        // Particle color based on ambient
        if (currentScene.bgAmbient === 'battle') {
          ctx.fillStyle = `rgba(249, 115, 22, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
        } else if (currentScene.bgAmbient === 'city') {
          ctx.fillStyle = `rgba(6, 182, 212, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
        } else if (currentScene.bgAmbient === 'cyber') {
          ctx.fillStyle = `rgba(236, 72, 153, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
        } else {
          ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(0.1, Math.min(0.8, p.alpha))})`;
        }

        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [currentScene.bgAmbient, settings.gameTurbo]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden select-none bg-slate-950">
      {/* Background Anime Image with CSS fallback */}
      <img
        src={currentScene.backgroundUrl}
        alt={currentScene.title}
        referrerPolicy="no-referrer"
        onLoad={() => setImageLoaded(true)}
        className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ${
          imageLoaded ? 'opacity-45 scale-100' : 'opacity-0 scale-105'
        } ${isPlayingScene ? 'animate-[pulse_10s_ease-in-out_infinite]' : ''}`}
      />

      {/* Styled Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030508] via-transparent to-[#030508]/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030508]/60 via-transparent to-[#030508]/60 pointer-events-none" />

      {/* Subtle Dynamic Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-70"
      />

      {/* Floating HUD Badges & Scene Info */}
      <div className="absolute top-16 left-4 sm:left-6 z-10 flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded backdrop-blur-md uppercase">
            {currentScene.animeName}
          </span>
          <span className="text-[10px] text-slate-300 font-mono bg-black/50 border border-white/10 px-2 py-0.5 rounded backdrop-blur-md">
            {currentScene.episode}
          </span>
        </div>
        <h2 className="text-sm sm:text-lg font-bold text-white tracking-wide font-display drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {currentScene.title}
        </h2>
      </div>

      {/* Scene Player Control HUD Overlay (Bottom-Left) */}
      <div className="absolute bottom-16 sm:bottom-18 left-4 sm:left-6 z-10 flex items-center gap-2 bg-slate-950/70 border border-white/15 px-3 py-1.5 rounded-2xl backdrop-blur-md">
        <button
          onClick={onTogglePlayScene}
          className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-400 hover:bg-white/10 transition-colors cursor-pointer"
          title={isPlayingScene ? 'Pausar reprodução da cena' : 'Reproduzir cena do anime'}
          aria-label={isPlayingScene ? 'Pausar' : 'Reproduzir'}
        >
          {isPlayingScene ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
        </button>
        <button
          onClick={onRestartScene}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Reiniciar cena"
          aria-label="Reiniciar cena"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="h-4 w-px bg-white/15" />
        <span className="text-[10px] font-mono text-slate-400">
          Cena <span className="text-cyan-300 font-bold">{currentLineIndex + 1}</span>/{currentScene.lines.length}
        </span>
      </div>

      {/* Latency & Hardware Monitor Tag (Top-Right) */}
      <div className="hidden lg:flex absolute top-16 right-16 z-10 items-center gap-3 bg-slate-950/60 border border-white/10 px-3 py-1 rounded-xl backdrop-blur-md text-[10px] font-mono text-slate-300 pointer-events-none">
        <span>LATÊNCIA: <strong className="text-emerald-400 font-bold">12ms</strong></span>
        <span className="text-white/20">|</span>
        <span>BUFFER IA: <strong className="text-cyan-400">STREAMING</strong></span>
        <span className="text-white/20">|</span>
        <span>FPS: <strong className="text-yellow-400">60</strong></span>
      </div>
    </div>
  );
}
