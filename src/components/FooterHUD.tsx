import { Sparkles, Keyboard } from 'lucide-react';

interface FooterHUDProps {
  onToggleDrawer: () => void;
}

export function FooterHUD({ onToggleDrawer }: FooterHUDProps) {
  return (
    <footer className="relative z-10 px-4 py-2.5 bg-slate-950/75 backdrop-blur-md text-[10px] sm:text-[11px] text-slate-400 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-1 select-none">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-slate-300 font-medium">
          Toque na aba colorida à direita para abrir ou fechar as configurações flutuantes.
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
        <span className="hidden md:inline">Atalhos: [Espaço] Dublar · [H] HUD · [← / →] Falas</span>
        <span className="hidden sm:inline" aria-hidden="true">·</span>
        <span className="text-cyan-400/80">Motor Neural Ativo</span>
      </div>
    </footer>
  );
}
