import { useState } from "react";
import { Info } from "lucide-react";
import type { GameInfoDetail } from "@/constants/gameinfoconst";

interface InfoTooltipProps {
  info: GameInfoDetail;
  className?: string;
}

export function InfoTooltip({ info, className = "" }: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`relative inline-flex items-center group ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="inline-flex items-center justify-center p-0.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        aria-label={info.title}
      >
        <Info className="size-3.5 text-muted-foreground/60 hover:text-foreground transition-colors shrink-0" />
      </button>

      <div
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-60 max-w-[calc(100vw-2rem)] p-3 rounded-xl border border-white/10 bg-black/95 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-xs transition-all duration-200 z-50 text-left ${
          isOpen
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none group-hover:opacity-100 group-hover:visible group-hover:pointer-events-auto"
        }`}
      >
        <div className="font-semibold text-foreground mb-1">{info.title}</div>
        <div className="text-[11px] leading-relaxed text-muted-foreground font-normal">
          {info.description}
        </div>
        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-black/95 border-r border-b border-white/10 rotate-45" />
      </div>
    </div>
  );
}
