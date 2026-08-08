import { useState } from "react";
import { motion } from "motion/react";
import { SectionHeader } from "./features";
import {
  Swords,
  Bot,
  Users,
  Globe,
  ShieldCheck,
  Sparkles,
  Check,
  Copy,
  Brain,
  Cpu,
  Smartphone,
} from "lucide-react";

export function Modes() {
  const [botLevel, setBotLevel] = useState<"smart" | "ai">("smart");
  const [roomCopied, setRoomCopied] = useState<boolean>(false);

  const handleCopyRoom = () => {
    setRoomCopied(true);
    setTimeout(() => setRoomCopied(false), 2000);
  };

  return (
    <section id="modes" className="relative overflow-hidden px-4 py-24 md:py-32">
      {/* Background ambient light */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.02] blur-[150px]" />

      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Game Modes"
          title="Zekros Moods"
          desc="From local pass-and-play to adaptive neural bots and custom private rooms."
        />

        {/* Spacious 4-Card Grid */}
        <div className="mt-14 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

          {/* CARD 1: LOCAL PVP (Pass & Play) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:bg-black/80 flex flex-col justify-between"
          >
            {/* Background Overlay */}
            <img
              src="/assets/hero-pvp-element.gif"
              alt="Local PvP Pass & Play"
              className="absolute inset-0 size-full object-cover opacity-20 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10">
                  <Swords className="size-5 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/80 uppercase">
                  PASS & PLAY
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Local PvP
                </h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">
                  Two players battle on the exact same device. Play anywhere offline with zero connection required.
                </p>
              </div>
            </div>

            {/* Offline Status Badge */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-white/70">
                <div className="flex items-center gap-2">
                  <Smartphone className="size-3.5 text-white/50" />
                  <span>SAME DEVICE</span>
                </div>
                <span className="font-semibold text-white">Offline Ready</span>
              </div>
            </div>
          </motion.div>

          {/* CARD 2: BOT ENGINE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:bg-black/80 flex flex-col justify-between"
          >
            {/* Background Overlay */}
            <img
              src="/assets/bot-pi-engine.gif"
              alt="Bot Mode"
              className="absolute inset-0 size-full object-cover opacity-20 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10">
                  <Bot className="size-5 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/80 uppercase">
                  <Sparkles className="size-2.5 text-white/60" />
                  SMART & AI
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Bot Engine
                </h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">
                  Practice against fast deterministic Smart Bots or deep adaptive Neural AI models.
                </p>
              </div>
            </div>

            {/* Micro Selector */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/10">
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-black/60 p-1">
                <button
                  onClick={() => setBotLevel("smart")}
                  className={`rounded-lg py-1.5 text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    botLevel === "smart"
                      ? "bg-white/80 text-black font-semibold shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Cpu className="inline-block size-3 mr-1" />
                  Smart
                </button>
                <button
                  onClick={() => setBotLevel("ai")}
                  className={`rounded-lg py-1.5 text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    botLevel === "ai"
                      ? "bg-white/80 text-black font-semibold shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Brain className="inline-block size-3 mr-1" />
                  Neural AI
                </button>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: CUSTOM ROOMS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:bg-black/80 flex flex-col justify-between"
          >
            {/* Background Overlay */}
            <img
              src="/assets/custom-room-bg.jpg"
              alt="Custom Rooms"
              className="absolute inset-0 size-full object-cover opacity-20 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10">
                  <ShieldCheck className="size-5 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/80 uppercase">
                  PASSCODE LOBBY
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Custom Rooms
                </h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">
                  Host private matches with custom grid dimensions, piece limits, and turn timers.
                </p>
              </div>
            </div>

            {/* Room Code Badge */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/10">
              <button
                onClick={handleCopyRoom}
                className="w-full flex items-center justify-between rounded-xl border border-white/15 bg-black/60 px-3 py-2 font-mono text-xs text-white/80 transition-all hover:bg-white/10 cursor-pointer"
              >
                <span className="text-[11px] text-white/50">ROOM CODE</span>
                <span className="font-bold text-white tracking-wider">#ZK-9042</span>
                {roomCopied ? (
                  <Check className="size-3.5 text-emerald-400" />
                ) : (
                  <Copy className="size-3.5 text-white/50" />
                )}
              </button>
            </div>
          </motion.div>

          {/* CARD 4: MULTIPLAYER */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl transition-all duration-500 hover:border-white/30 hover:bg-black/80 flex flex-col justify-between"
          >
            {/* Background Overlay */}
            <img
              src="/assets/ai-multiplayer-mesh.gif"
              alt="Multiplayer Global Network"
              className="absolute inset-0 size-full object-cover opacity-20 mix-blend-luminosity transition-transform duration-700 group-hover:scale-105 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/85 to-black/95 pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/10">
                  <Globe className="size-5 text-white" />
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-white/80 uppercase">
                  <span className="relative flex size-1.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-400" />
                  </span>
                  LIVE MATCHMAKING
                </span>
              </div>

              <div>
                <h3 className="font-display text-xl font-bold text-white tracking-tight">
                  Multiplayer
                </h3>
                <p className="mt-2 text-xs text-white/70 leading-relaxed">
                  Instant regional matchmaking across global nodes with real-time spectator feeds.
                </p>
              </div>
            </div>

            {/* Active Network Status */}
            <div className="relative z-10 mt-8 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/60 px-3 py-2 font-mono text-[11px] text-white/70">
                <div className="flex items-center gap-2">
                  <Users className="size-3.5 text-white/50" />
                  <span>NETWORK</span>
                </div>
                <span className="font-semibold text-white">1,482 Online</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
