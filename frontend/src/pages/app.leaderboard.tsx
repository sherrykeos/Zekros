import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Trophy, Crown, Medal, Users, Lock } from "lucide-react";
import { GlassPanel, SectionHeader } from "@/components/app/primitives";

export const Route = createFileRoute("/app/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — ZEKROS" }] }),
  component: LeaderboardPage,
});

type Player = {
  rank: number;
  name: string;
  initials: string;
  rating: number;
  wins: number;
  rate: string;
  trend: "up" | "down" | "flat";
};

// TODO: replace with backed leaderboard fetch
const GLOBAL: Player[] = [
  { rank: 1, name: "neon.fox", initials: "NF", rating: 2841, wins: 1203, rate: "71%", trend: "up" },
  { rank: 2, name: "ghostline", initials: "GL", rating: 2790, wins: 1041, rate: "69%", trend: "flat" },
  { rank: 3, name: "kappa_77", initials: "K7", rating: 2762, wins: 989, rate: "67%", trend: "up" },
  { rank: 4, name: "Vector_91", initials: "V9", rating: 2701, wins: 932, rate: "66%", trend: "down" },
  { rank: 5, name: "anvil", initials: "AN", rating: 2680, wins: 870, rate: "65%", trend: "up" },
  { rank: 6, name: "echo.sigma", initials: "ES", rating: 2655, wins: 812, rate: "64%", trend: "flat" },
  { rank: 7, name: "matte_black", initials: "MB", rating: 2611, wins: 778, rate: "63%", trend: "up" },
  { rank: 8, name: "p41ndrop", initials: "PD", rating: 2597, wins: 745, rate: "62%", trend: "down" },
  { rank: 9, name: "halcyon", initials: "HC", rating: 2580, wins: 702, rate: "61%", trend: "up" },
  { rank: 10, name: "zero.kelvin", initials: "ZK", rating: 2563, wins: 163, rate: "65%", trend: "up" },
];

const WEEKLY = GLOBAL.slice().sort((a, b) => b.wins % 13 - a.wins % 13).map((p, i) => ({ ...p, rank: i + 1 }));
const MONTHLY = GLOBAL.slice().reverse().map((p, i) => ({ ...p, rank: i + 1 }));

type Tab = "Global" | "Weekly" | "Monthly" | "Friends";
const TABS: Tab[] = ["Global", "Weekly", "Monthly", "Friends"];

function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("Global");
  const list = tab === "Global" ? GLOBAL : tab === "Weekly" ? WEEKLY : MONTHLY;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Leaderboard"
        description="Mock ladder — backed by D3T once seasons begin."
      />

      <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5">
        {TABS.map((t) => {
          const soon = t === "Friends";
          return (
            <button
              key={t}
              disabled={soon}
              onClick={() => setTab(t)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs transition-colors ${
                tab === t
                  ? "bg-white/[0.10] text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              } ${soon ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {t}
              {soon && <span className="rounded border border-white/10 px-1 py-0.5 text-[9px] uppercase tracking-wider">Soon</span>}
            </button>
          );
        })}
      </div>

      {tab === "Friends" ? (
        <GlassPanel className="flex flex-col items-center justify-center gap-3 p-16 text-center">
          <Users className="size-5 text-muted-foreground" />
          <div className="font-display text-base">Friends leaderboard coming soon</div>
          <p className="max-w-sm text-xs text-muted-foreground">
            Once the social system launches, you'll see your friends' standings here.
          </p>
        </GlassPanel>
      ) : (
        <>
          {/* Podium */}
          <div className="grid gap-3 sm:grid-cols-3">
            {list.slice(0, 3).map((p) => (
              <Podium key={p.rank} player={p} />
            ))}
          </div>

          {/* Table */}
          <GlassPanel className="overflow-hidden">
            <div className="grid grid-cols-[60px_1fr_90px_90px_80px] gap-2 border-b border-white/[0.06] px-4 py-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Rating</span>
              <span className="text-right">Wins</span>
              <span className="text-right">Win %</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.ul
                key={tab}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {list.map((p) => (
                  <li
                    key={p.name}
                    className="grid grid-cols-[60px_1fr_90px_90px_80px] items-center gap-2 border-t border-white/5 px-4 py-2.5 text-sm hover:bg-white/[0.02]"
                  >
                    <span className="font-mono text-xs text-muted-foreground">#{p.rank}</span>
                    <div className="flex min-w-0 items-center gap-2.5">
                      <div className="grid size-7 shrink-0 place-items-center rounded-md bg-gradient-to-br from-white/30 to-white/5 text-[10px] font-semibold ring-1 ring-white/10">
                        {p.initials}
                      </div>
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="text-right font-mono text-xs">{p.rating}</span>
                    <span className="text-right text-xs text-muted-foreground">{p.wins}</span>
                    <span className="text-right text-xs text-muted-foreground">{p.rate}</span>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </GlassPanel>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <Lock className="size-3" /> Season 01 begins July 14. Standings reset weekly.
          </div>
        </>
      )}
    </div>
  );
}

function Podium({ player }: { player: Player }) {
  const Icon = player.rank === 1 ? Crown : player.rank === 2 ? Trophy : Medal;
  const tone =
    player.rank === 1
      ? "from-white/[0.18] via-white/[0.06] to-transparent border-white/20"
      : player.rank === 2
        ? "from-white/[0.12] via-white/[0.04] to-transparent border-white/15"
        : "from-white/[0.08] via-white/[0.02] to-transparent border-white/10";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: player.rank * 0.04 }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${tone}`}
    >
      <div className="flex items-center justify-between">
        <Icon className="size-4 text-muted-foreground" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Rank #{player.rank}
        </span>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-white/30 to-white/5 font-display text-sm font-semibold ring-1 ring-white/15">
          {player.initials}
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-base font-semibold tracking-tight">
            {player.name}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {player.wins} wins · {player.rate}
          </div>
        </div>
      </div>
      <div className="mt-4 font-display text-2xl font-semibold tracking-tight text-gradient">
        {player.rating}
      </div>
    </motion.div>
  );
}
