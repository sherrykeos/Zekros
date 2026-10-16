import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { HeroPvPPreview } from "./hero-pvp-preview";
import { dispatchPlayNow } from "@/contexts/play-entry";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNavigate } from "@tanstack/react-router";
import { AeroShards } from "@/components/ui/AeroShards";
import PatternWaves from '@/components/ui/PatternWaves';

import { APP_CONSTANTS } from "@/constants/appConstants";

export function Hero() {
  const ease = [0.22, 1, 0.36, 1] as const;
  const currentUser = useCurrentUser();
  const user = currentUser.data;
  const navigate = useNavigate();

  const handlePlayNow = () => {
    if (user) {
      navigate({ to: "/app/play" });
    } else {
      dispatchPlayNow("default");
    }
  };

  return (
    <section className="relative isolate overflow-hidden px-4 pt-32 pb-16 md:pt-44 md:pb-24">
      {/* Hero-only AeroShards Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
  <PatternWaves
    preset="silk"
    color="#4b4e50"
    backgroundColor="#000000"
    fade="edges"
    interactive
    cursorSize={50}
    cursorStrength={0.6}
    pattern="dot"
    wave="silk"
    spacing={9}
    markSize={0.95}
    depth={0.95}
    light={0}
    shine={0.8}
    contrast={1.2}
    speed={0.35}
    scale={1}
    direction={20}
    opacity={1}
    fadeSize={0.5}
    characters=".:-=+*#%@"
    intro
    paused={false}
/>

        {/* <AeroShards
          className="size-full"
          flipX
          shardColor="#ffffff"
          accentColor="#ffffff"
          placement="full"
          material="glass"
          markers="plus"
          count={1300}
          depthOfField={0.75}
          vignette={0.3}
          mouseInteraction
          pulseOnClick
          holdToGather
          lightMode={false}
          shardSize={1}
          spread={1}
          twist={1}
          billow={1}
          speed={1}
          scale={1}
          glow={0.35}
          grain={0.06}
          intro
          mouseStrength={0.6}
          parallax={0.5}
          paused={false}
          onError={(err) => console.error("AeroShards error:", err)}
        /> */}
        {/* Soft bottom blend to transition smoothly into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>

      {/* ambient halo */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-white/[0.04] blur-[120px]" />
      {/* Subtle Micro-Grid Pattern */}
      {/* <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_4px),linear-gradient(to_bottom,#ffffff04_1px,transparent_2px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-90" /> */}
      
      <div className="relative z-10 mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:items-center px-4 sm:px-6 lg:px-8">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs text-muted-foreground"
          >
            <span className="size-1.5 rounded-full bg-white/70" />
            {APP_CONSTANTS.company.name}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease }}
            className="text-gradient mt-6 font-display text-5xl font-semibold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
          >
            Strategy,
            <br />
            evolved.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {APP_CONSTANTS.app.description.hero}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <button
              type="button"
              onClick={handlePlayNow}
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-[0_10px_40px_-10px_rgba(255,255,255,0.4)] transition-transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Play Now
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </button>
            <a
              href="#how"
              className="glass inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-white/[0.08]"
            >
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-10 flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-muted-foreground"
          >
            <span>Real-time</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Adaptive AI</span>
            <span className="size-1 rounded-full bg-white/20" />
            <span>Replayable</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease }}
          className="relative w-full max-w-md mx-auto lg:ml-auto lg:mr-0 lg:translate-x-8 xl:translate-x-14"
        >
          <HeroPvPPreview />
        </motion.div>
      </div>
    </section>
  );
}
