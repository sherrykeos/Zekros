import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Info,
  BookOpen,
  Sparkles,
  RefreshCcw,
  Keyboard,
  Building2,
  Cpu,
  ChevronDown,
} from "lucide-react";
import type { ComponentType } from "react";
import { GlassPanel, SectionHeader } from "@/components/app/primitives";

export const Route = createFileRoute("/app/about")({
  head: () => ({ meta: [{ title: "About — ZEKROS" }] }),
  component: AboutPage,
});

const FAQ = [
  {
    q: "What is ZEKROS?",
    a: "ZEKROS is a strategy game by ZEROTH Labs. It reimagines a classic grid duel with dynamic boards, disappearing pieces, and reclaim tokens — every match evolves under your decisions.",
  },
  {
    q: "How are matches different from a normal grid duel?",
    a: "Boards scale from 3×3 to 6×6, each player has a cap on active pieces, and the oldest piece vanishes once that cap is exceeded — pulling the board into constant motion.",
  },
  {
    q: "What are Reclaim Tokens?",
    a: "Reclaim Tokens let you remove one of your own pieces from the board on your turn instead of placing a new one — a tactical reset for clutch moments.",
  },
  {
    q: "Can I play offline?",
    a: "Yes. Local and AI matches run fully client-side. Multiplayer requires an account once the backend launches.",
  },
  {
    q: "Is there a mobile version?",
    a: "The full experience is responsive today. Native apps are on the roadmap after the web platform stabilizes.",
  },
];

const SHORTCUTS = [
  { keys: ["⌘", "K"], label: "Open command bar" },
  { keys: ["⌘", "/"], label: "Focus search" },
  { keys: ["G", "P"], label: "Go to Play" },
  { keys: ["G", "H"], label: "Go to History" },
  { keys: ["G", "L"], label: "Go to Leaderboard" },
  { keys: ["?"], label: "Show all shortcuts" },
];

function AboutPage() {
  return (
    <div className="space-y-10">
      <SectionHeader
        title="About ZEKROS"
        description="A premium strategy experience by ZEROTH Labs."
      />

      <Section title="What is ZEKROS" icon={Info}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          ZEKROS turns a familiar grid into a living arena. Boards shift in
          size, pieces decay, and tokens let you rewrite the board mid-fight. It
          is built for fast, expressive matches — beautifully simple to play,
          deep to master.
        </p>
      </Section>

      <Section title="Game rules" icon={BookOpen}>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            · Players alternate turns placing a single piece on an empty cell.
          </li>
          <li>
            · Win length is auto-derived from board size (3×3 → 3 in a row, 4×4
            → 4, etc.).
          </li>
          <li>
            · Each player has a cap on Active Pieces equal to the board size.
          </li>
          <li>
            · When you exceed the cap, your oldest piece vanishes from the
            board.
          </li>
          <li>
            · On your turn, you may spend a Reclaim Token to remove one of your
            own pieces.
          </li>
        </ul>
      </Section>

      <Section title="Dynamic pieces" icon={Sparkles}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The board is never static. As your active-piece count nears its cap,
          the oldest pieces pulse to warn you — placing the next one removes
          them entirely. This keeps every position fluid and rewards forward
          planning.
        </p>
      </Section>

      <Section title="Reclaim Tokens" icon={RefreshCcw}>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Reclaim Tokens are a tactical lifeline. Spend one to take back a piece
          you've already placed, opening space and disrupting your opponent's
          reads. Token counts are configurable per match (0–10).
        </p>
      </Section>

      <Section title="Frequently asked questions" icon={Info}>
        <div className="divide-y divide-white/5">
          {FAQ.map((f, i) => (
            <FAQRow key={i} q={f.q} a={f.a} />
          ))}
        </div>
      </Section>

      <Section title="Keyboard shortcuts" icon={Keyboard}>
        <div className="grid gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((s, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
            >
              <span className="text-sm">{s.label}</span>
              <div className="flex items-center gap-1">
                {s.keys.map((k, j) => (
                  <kbd
                    key={j}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Version" icon={Cpu}>
        <div className="grid gap-2 sm:grid-cols-3">
          <Meta label="Build" value="0.1.0-preview.3" />
          <Meta label="Engine" value="D3T · pre-alpha" />
          <Meta label="Release" value="Jun 28, 2026" />
        </div>
      </Section>

      <Section title="Credits" icon={Building2}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Powered by
            </div>
            <div className="mt-1 font-display text-base font-semibold">
              D3T Engine
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Custom strategy engine handling dynamic boards, vanish queues, and
              reclaim logic.
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Built by
            </div>
            <div className="mt-1 font-display text-base font-semibold">
              ZEROTH Labs
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              A studio crafting premium digital products with obsessive
              attention to detail.
            </p>
          </div>
        </div>
      </Section>

      <div className="pt-2 text-center text-[11px] text-muted-foreground">
        © {new Date().getFullYear()} ZEROTH Labs. All rights reserved.
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-3 inline-flex items-center gap-2">
        <Icon className="size-3.5 text-muted-foreground" />
        <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </h3>
      </div>
      <GlassPanel className="p-5">{children}</GlassPanel>
    </section>
  );
}

function FAQRow({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left text-sm"
      >
        <span className="font-medium">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="text-muted-foreground"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-mono text-sm">{value}</div>
    </div>
  );
}
