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
import {
  APP_CONSTANTS,
  getPageTitle,
  getCopyrightString,
} from "@/constants/appConstants";

export const Route = createFileRoute("/app/about")({
  head: () => ({ meta: [{ title: getPageTitle("About") }] }),
  component: AboutPage,
});

const FAQ = [
  {
    q: `What is ${APP_CONSTANTS.app.name}?`,
    a: `${APP_CONSTANTS.app.name} is a strategy game by ${APP_CONSTANTS.company.name}. It reimagines a classic grid duel with dynamic boards, disappearing pieces, and reclaim tokens — every match evolves under your decisions.`,
  },
  {
    q: "How are matches different from a normal grid duel?",
    a: "Boards scale from 3×3 to 5×5, each player has a cap on active pieces, and the oldest piece vanishes once that cap is exceeded — pulling the board into constant motion.",
  },
  {
    q: "What are Reclaim Tokens?",
    a: "Reclaim Tokens let you remove one of your own pieces from the board on your turn instead of placing a new one — a tactical reset for clutch moments.",
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
        title={`About ${APP_CONSTANTS.app.name}`}
        description={`A premium strategy experience by ${APP_CONSTANTS.company.name}.`}
      />

      <Section title={`What is ${APP_CONSTANTS.app.name}`} icon={Info}>
        <p className="text-sm leading-relaxed text-muted-foreground hover:text-white">
          {APP_CONSTANTS.app.description.full}
        </p>
      </Section>

      <Section title="Game rules" icon={BookOpen}>
        <ul className="space-y-2 text-sm text-muted-foreground hover:text-white">
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
        <p className="text-sm leading-relaxed text-muted-foreground hover:text-white">
          The board is never static. As your active-piece count nears its cap,
          the oldest pieces pulse to warn you — placing the next one removes
          them entirely. This keeps every position fluid and rewards forward
          planning.
        </p>
      </Section>

      <Section title="Reclaim Tokens" icon={RefreshCcw}>
        <p className="text-sm leading-relaxed text-muted-foreground hover:text-white">
          Reclaim Tokens are a tactical lifeline. Spend one to take back a piece
          you've already placed, opening space and disrupting your opponent's
          reads. Token counts are configurable per match (0–10).
        </p>
      </Section>

      <Section title="Version" icon={Cpu}>
        <div className="grid gap-2 sm:grid-cols-3">
          <Meta label="Build" value={APP_CONSTANTS.version.build} />
          <Meta label="Engine" value={APP_CONSTANTS.version.engine.version} />
          <Meta label="Release" value={APP_CONSTANTS.version.releaseDate} />
        </div>
      </Section>

      <Section title="Credits" icon={Building2}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Powered by
            </div>
            <div className="mt-1 font-display text-base font-semibold">
              {APP_CONSTANTS.version.engine.name}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {APP_CONSTANTS.version.engine.description}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Built by
            </div>
            <div className="mt-1 font-display text-base font-semibold">
              {APP_CONSTANTS.company.name}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {APP_CONSTANTS.company.tagline}
            </p>
          </div>
        </div>
      </Section>

      <div className="pt-2 text-center text-[11px] text-muted-foreground">
        {getCopyrightString()}
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

