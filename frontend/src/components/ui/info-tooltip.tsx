import { Info } from "lucide-react";
import type { GameInfoDetail } from "@/constants/gameinfoconst";

interface InfoTooltipProps {
  info: GameInfoDetail;
  className?: string;
}

export function InfoTooltip({ info, className = "" }: InfoTooltipProps) {
  return (
    <div className={`relative inline-flex items-center group ${className}`}>
      <Info className="size-3.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-help shrink-0" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 p-3 rounded-xl border border-white/10 bg-black/90 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none text-left">
        <div className="font-semibold text-foreground mb-1">{info.title}</div>
        <div className="text-[11px] leading-relaxed text-muted-foreground font-normal">
          {info.description}
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black/90 border-r border-b border-white/10 rotate-45" />
      </div>
    </div>
  );
}
