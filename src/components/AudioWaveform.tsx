import { useEffect, useRef } from 'react';
import { voiceEngine } from '../services/voiceEngine';

interface AudioWaveformProps {
  isActive: boolean;
  barCount?: number;
  height?: number;
  colorScheme?: 'cyan' | 'gradient' | 'violet';
}

export function AudioWaveform({
  isActive,
  barCount = 18,
  height = 28,
  colorScheme = 'gradient',
}: AudioWaveformProps) {
  const barsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    let animId: number;

    const updateBars = () => {
      const data = voiceEngine.getFrequencyData();
      const hasRealAudio = data.some((v) => v > 10);

      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        let scale = 0.15;
        if (isActive) {
          if (hasRealAudio) {
            const dataIndex = Math.floor((i / barCount) * data.length);
            scale = Math.max(0.15, (data[dataIndex] || 0) / 255);
          } else {
            // Simulated fluid waveform when audio is active
            const t = Date.now() / 150;
            const wave = Math.sin(t + i * 0.45) * 0.5 + 0.5;
            const secondary = Math.cos(t * 1.3 - i * 0.3) * 0.3 + 0.3;
            scale = Math.max(0.2, Math.min(1, (wave + secondary) * 0.75));
          }
        }
        bar.style.transform = `scaleY(${scale})`;
      });

      animId = requestAnimationFrame(updateBars);
    };

    animId = requestAnimationFrame(updateBars);
    return () => cancelAnimationFrame(animId);
  }, [isActive, barCount]);

  return (
    <div
      className="flex items-center justify-center gap-1 overflow-hidden px-1"
      style={{ height: `${height}px` }}
      aria-label="Audio visualizer"
    >
      {Array.from({ length: barCount }).map((_, idx) => {
        let barColor = 'bg-cyan-400';
        if (colorScheme === 'gradient') {
          barColor =
            idx % 3 === 0
              ? 'bg-cyan-400'
              : idx % 3 === 1
              ? 'bg-purple-400'
              : 'bg-pink-500';
        } else if (colorScheme === 'violet') {
          barColor = idx % 2 === 0 ? 'bg-indigo-400' : 'bg-fuchsia-400';
        }

        return (
          <div
            key={idx}
            ref={(el) => {
              if (el) barsRef.current[idx] = el;
            }}
            className={`w-1 rounded-full transition-transform duration-75 origin-bottom ${barColor} shadow-[0_0_8px_rgba(6,182,212,0.6)]`}
            style={{
              height: '100%',
              transform: 'scaleY(0.15)',
            }}
          />
        );
      })}
    </div>
  );
}
