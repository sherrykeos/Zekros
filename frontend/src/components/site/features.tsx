import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import {
  Grid3x3,
  Hourglass,
  RotateCcw,
  Cpu,
  Brain,
  Wifi,
  History,
  Settings2,
  ListOrdered,
  Network,
  Zap,
  Activity,
  Play,
  CheckCircle2,
  Sliders,
  Sparkles,
} from "lucide-react";

function SlowGif({
  src,
  alt,
  speed = 0.4,
  className,
}: {
  src: string;
  alt?: string;
  speed?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    let decoder: any = null;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    async function decodeAndPlay() {
      if (!("ImageDecoder" in window)) {
        setUseFallback(true);
        return;
      }

      try {
        const response = await fetch(src);
        if (!response.ok) throw new Error("Failed to fetch GIF");
        const buffer = await response.arrayBuffer();

        decoder = new (window as any).ImageDecoder({
          data: buffer,
          type: "image/gif",
        });

        await decoder.tracks.ready;
        const track = decoder.tracks.selectedTrack;
        const frameCount = track.frameCount;
        if (frameCount <= 1) {
          setUseFallback(true);
          return;
        }

        let frameIndex = 0;

        const renderNextFrame = async () => {
          if (isCancelled) return;
          try {
            const result = await decoder.decode({ frameIndex });
            const frame = result.image;
            const canvas = canvasRef.current;
            if (canvas && frame) {
              if (canvas.width !== frame.displayWidth || canvas.height !== frame.displayHeight) {
                canvas.width = frame.displayWidth;
                canvas.height = frame.displayHeight;
              }
              const ctx = canvas.getContext("2d");
              ctx?.clearRect(0, 0, canvas.width, canvas.height);
              ctx?.drawImage(frame, 0, 0);
            }

            const durationUs = frame.duration || 100000;
            const delayMs = durationUs / 1000 / speed;

            frame.close();
            frameIndex = (frameIndex + 1) % frameCount;

            if (!isCancelled) {
              timerId = setTimeout(renderNextFrame, delayMs);
            }
          } catch (err) {
            if (!isCancelled) setUseFallback(true);
          }
        };

        renderNextFrame();
      } catch (err) {
        if (!isCancelled) setUseFallback(true);
      }
    }

    decodeAndPlay();

    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
      if (decoder) {
        try {
          decoder.close();
        } catch (_) {}
      }
    };
  }, [src, speed]);

  if (useFallback) {
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-label={alt}
    />
  );
}

export function Features() {
  const [activeBoardSize, setActiveBoardSize] = useState<string>("3x3");
  const [replayStep, setReplayStep] = useState<number>(14);

  return (
    <section id="features" className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-white/[0.02] blur-[140px]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Features"
          title="Where every move decays."
          desc="Adaptive arenas where spatial memory is your ultimate resource."
        />

        {/* Primary Bento Grid */}
        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Bento Card 1: Dynamic Boards & Arenas (Large 2 Columns) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 transition-all hover:bg-white/[0.04] md:col-span-2 flex flex-col justify-between"
          >
            {/* Top Info */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-muted-foreground">
                  <Grid3x3 className="size-3.5 text-white" />
                  <span>01 / ARENA ENGINE</span>
                </div>
                <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  Dynamic Reshaping Boards
                </h3>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                  The arena is an active combatant. Boards mutate between rounds — shifting dimensions, cell layouts, and tactical constraints.
                </p>
              </div>

              {/* Interactive Selector Pill */}
              <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/60 p-1.5 backdrop-blur-md">
                {["3x3", "4x4", "5x5"].map((size) => (
                  <button
                    key={size}
                    onClick={() => setActiveBoardSize(size)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                      activeBoardSize === size
                        ? "bg-white text-black shadow-md font-semibold"
                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Media Showcase with Dynamic Interactive Grid */}
            <div className="relative mt-6 min-h-[170px] sm:min-h-[190px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-6">
              {/* Background GIF */}
              <img
                src="/assets/arena-engine-mesh.gif"
                alt="Dynamic Arena Engine"
                className="absolute inset-0 size-full object-cover opacity-70 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/60" />

              {/* Left: Info & Mechanics Overlay */}
              <div className="relative z-10 space-y-2 max-w-xs">
                <div className="flex items-center gap-2 font-mono text-xs text-white/90">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-white/40 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-white/50" />
                  </span>
                  <span>Arena Layout: {activeBoardSize} Active</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {activeBoardSize === "3x3" && "Fast-paced blitz format. 3-piece limit before initial decay triggers."}
                  {activeBoardSize === "4x4" && "Tactical mid-size arena. 4-piece limit with expanding positional choices."}
                  {activeBoardSize === "5x5" && "Grandmaster arena layout. 5-piece limit requiring deep multi-line control."}
                </p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-white/70">
                  <span className="rounded bg-white/10 px-2 py-0.5 border border-white/10">
                    {activeBoardSize === "3x3" ? "9 Cells" : activeBoardSize === "4x4" ? "16 Cells" : "25 Cells"}
                  </span>
                  <span className="text-white/40">·</span>
                  <span className="text-gray-400 font-medium">Auto-Decay Cycle</span>
                </div>
              </div>

              {/* Right: Dynamic Empty Grid Representation */}
              <div className="relative z-10 flex items-center justify-center">
                <motion.div
                  key={activeBoardSize}
                  initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className={`grid gap-1.5 p-2.5 rounded-2xl border border-white/20 bg-black/85 backdrop-blur-2xl shadow-2xl ${
                    activeBoardSize === "3x3"
                      ? "grid-cols-3 size-32 sm:size-36"
                      : activeBoardSize === "4x4"
                      ? "grid-cols-4 size-36 sm:size-40"
                      : "grid-cols-5 size-40 sm:size-44"
                  }`}
                >
                  {Array.from({
                    length:
                      activeBoardSize === "3x3" ? 9 : activeBoardSize === "4x4" ? 16 : 25,
                  }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-white/15 bg-white/[0.04] transition-all duration-300 hover:border-white/30 hover:bg-white/[0.08]"
                    />
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: Neural Adaptive AI */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all hover:bg-white/[0.04] flex flex-col justify-between min-h-[420px]"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-muted-foreground">
                <Cpu className="size-3.5 text-white" />
                <span>02 / INTELLIGENCE</span>
              </div>
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">
                Adaptive AI Core
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Reads your playstyle, predicts move chains, and dynamically tunes its aggressiveness to keep you on the edge.
              </p>
            </div>

            {/* Visual Element */}
            <div className="relative mt-6 h-48 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/60">
              <SlowGif
                src="/assets/ai-multiplayer-mesh.gif"
                alt="AI Neural Engine"
                speed={0.7}
                className="size-full object-cover opacity-75 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
              
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between rounded-lg border border-white/10 bg-black/70 px-3 py-2 text-[11px]">
                <div className="flex items-center gap-2 font-mono text-white/90">
                  <Brain className="size-3.5 text-white animate-pulse" />
                  <span>Solver Depth: 18 Plies</span>
                </div>
                <span className="font-mono text-white/60">Win Prob: 84%</span>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 3: Disappearing Pieces */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 transition-all hover:bg-white/[0.04] flex flex-col justify-between min-h-[290px]"
          >
            {/* Full-card Background Image */}
            <img
              src="/assets/disappearing-pieces-bg.jpg"
              alt="Disappearing Pieces Graphic"
              className="absolute inset-0 size-full object-cover opacity-75 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/50" />

            {/* Top Info Overlay */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
                <Hourglass className="size-3.5 text-white" />
                <span>03 / DECAY MECHANIC</span>
              </div>
              <h3 className="mt-3.5 font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Disappearing Pieces
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Your oldest piece fades when a new one lands. Spatial memory becomes your primary resource.
              </p>
            </div>

            {/* Bottom Info Pill Widget */}
            <div className="relative z-10 mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/80 p-2.5 text-[11px] font-mono backdrop-blur-md">
              <span className="text-white/90 font-medium flex items-center gap-1.5">
                <Hourglass className="size-3.5 text-white/70 animate-spin" />
                Decay Window: 3-Turn Cycle
              </span>
              <span className="text-white/50">Piece Limit Exceeded</span>
            </div>
          </motion.div>

          {/* Bento Card 4: Reclaim Tokens */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 transition-all hover:bg-white/[0.04] flex flex-col justify-between min-h-[290px]"
          >
            {/* Full-card Background Image */}
            <img
              src="/assets/spatial-memory-bg.jpg"
              alt="Reclaim Tokens Graphic"
              className="absolute inset-0 size-full object-cover opacity-75 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/50" />

            {/* Top Info Overlay */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
                <RotateCcw className="size-3.5 text-white" />
                <span>04 / ECONOMY</span>
              </div>
              <h3 className="mt-3.5 font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Reclaim Tokens
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Spend a token to reclaim a vanishing cell in critical endgame moments. Tight economy, tighter decisions.
              </p>
            </div>

            {/* Bottom Info Pill Widget */}
            <div className="relative z-10 mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-black/80 p-2.5 text-[11px] font-mono backdrop-blur-md">
              <span className="text-white/90 font-medium flex items-center gap-1.5">
                <RotateCcw className="size-3.5 text-white/70" />
                Token Allowance: 3/Match
              </span>
              <span className="text-white font-semibold">-1 Token</span>
            </div>
          </motion.div>

          {/* Bento Card 5: Custom Rooms & Rules */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 transition-all hover:bg-white/[0.04] flex flex-col justify-between min-h-[290px]"
          >
            {/* Full-card Background Image with custom-room-bg.jpg */}
            <img
              src="/assets/custom-room-bg.jpg"
              alt="Custom Room Background"
              className="absolute inset-0 size-full object-cover opacity-75 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/50" />

            {/* Top Info Overlay */}
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-muted-foreground backdrop-blur-md">
                <Settings2 className="size-3.5 text-white" />
                <span>05 / CUSTOM LOBBIES</span>
              </div>
              <h3 className="mt-3.5 font-display text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
                Custom Private Rooms
              </h3>
              <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                Create custom matches, configure rulesets, and share instant room codes to challenge friends in real time.
              </p>
            </div>

            {/* Bottom Info Pill Widget - Room Code & Share */}
            <div className="relative z-10 mt-5 space-y-2 rounded-xl border border-white/10 bg-black/85 p-3 backdrop-blur-md">
              <div className="flex items-center justify-between text-[11px] font-mono text-white/90">
                <span className="text-white/60">ROOM CODE</span>
                <span className="font-bold tracking-widest text-white">#ZK-8492</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-white/70 pt-1.5 border-t border-white/10">
                <span>Play with Friends</span>
                <span className="rounded bg-white/10 px-2 py-0.5 text-white/90 font-medium">Instant Invite</span>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Secondary Feature Matrix (Bottom Row Cards) */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Card 1: Match Replay */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white">
                  <History className="size-4" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
                  TIME TRAVEL
                </span>
              </div>

              <h4 className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
                Match Replay
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Step through past encounters move-by-move to analyze strategy and decisions.
              </p>
            </div>

            <div className="mt-4 flex items-center justify-between text-[11px] font-mono text-white/70 border-t border-white/10 pt-2.5">
              <span className="flex items-center gap-1">
                <Play className="size-3 text-white/50" />
                Scrubber Mode
              </span>
              <span className="text-white/40">Move 14/28</span>
            </div>
          </motion.div>

          {/* Card 2: Custom Game Rules */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white">
                  <Sliders className="size-4" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
                  RULE ENGINE
                </span>
              </div>

              <h4 className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
                Custom Parameters
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Tune board sizes (3×3 to 5×5), piece decay limits, and token budgets.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-white/70 border-t border-white/10 pt-2.5">
              <Sparkles className="size-3 text-white/50" />
              <span>Custom Rulesets</span>
            </div>
          </motion.div>

          {/* Card 3: Adaptive & Perfect AI */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white">
                  <Brain className="size-4" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
                  AI ENGINES
                </span>
              </div>

              <h4 className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
                Adaptive & Perfect AI
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Practice against an adaptive heuristic bot or the Minimax Perfect Solver.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-white/70 border-t border-white/10 pt-2.5">
              <Cpu className="size-3 text-white/50" />
              <span>Minimax Engine</span>
            </div>
          </motion.div>

          {/* Card 4: Pass & Play Local PvP */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-all hover:bg-white/[0.05] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-white">
                  <Zap className="size-4" />
                </div>
                <span className="text-[10px] font-mono tracking-widest text-white/50 uppercase">
                  LOCAL PVP
                </span>
              </div>

              <h4 className="mt-3 font-display text-base font-semibold tracking-tight text-foreground">
                Pass & Play Mode
              </h4>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                Battle friends turn-by-turn on a single device with zero setup or lag.
              </p>
            </div>

            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-white/70 border-t border-white/10 pt-2.5">
              <CheckCircle2 className="size-3 text-white/50" />
              <span>Same Screen PvP</span>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}

function SecondaryCard({
  icon: Icon,
  tag,
  title,
  desc,
  graphic,
  badge,
}: {
  icon: any;
  tag: string;
  title: string;
  desc: string;
  graphic?: string;
  badge?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.05] flex flex-col justify-between"
    >
      {graphic && (
        <div className="absolute inset-0 -z-10 opacity-20 transition-opacity group-hover:opacity-30">
          <img src={graphic} alt="" className="size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
      )}

      <div>
        <div className="flex items-center justify-between">
          <div className="grid size-9 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-white">
            <Icon className="size-4" />
          </div>
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">
            {tag}
          </span>
        </div>

        <h4 className="mt-4 font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h4>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {desc}
        </p>
      </div>

      {badge && (
        <div className="mt-4 flex items-center gap-1.5 text-[11px] font-mono text-white/70">
          <Sparkles className="size-3 text-white/50" />
          <span>{badge}</span>
        </div>
      )}
    </motion.div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl text-center"
    >
      <div className="text-[10px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-gradient mt-3 font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {desc && (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {desc}
        </p>
      )}
    </motion.div>
  );
}

