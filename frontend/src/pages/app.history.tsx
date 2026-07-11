import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { History, Search, Play } from "lucide-react";
import { EmptyState, GlassPanel, SectionHeader } from "@/components/app/primitives";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "Match History — ZEKROS" }] }),
  component: HistoryPage,
});

type Row = {
  id: string;
  mode: "Ranked" | "Smart AI" | "Perfect AI" | "Duel" | "Local";
  opponent: string;
  winner: "You" | "Opponent" | "Draw";
  duration: string;
  date: string;
  daysAgo: number;
  boardSize: 3 | 4 | 5 | 6;
};

// TODO: replace with paged history fetch + replay metadata
const ROWS: Row[] = [
  { id: "m_001", mode: "Ranked", opponent: "Vector_91", winner: "You", duration: "5:42", date: "Today, 14:21", daysAgo: 0, boardSize: 4 },
  { id: "m_002", mode: "Smart AI", opponent: "Smart AI", winner: "You", duration: "3:11", date: "Today, 12:08", daysAgo: 0, boardSize: 3 },
  { id: "m_003", mode: "Duel", opponent: "neon.fox", winner: "Opponent", duration: "7:30", date: "Yesterday, 19:45", daysAgo: 1, boardSize: 5 },
  { id: "m_004", mode: "Perfect AI", opponent: "Perfect AI", winner: "Draw", duration: "9:14", date: "Yesterday, 11:02", daysAgo: 1, boardSize: 4 },
  { id: "m_005", mode: "Ranked", opponent: "kappa_77", winner: "You", duration: "4:02", date: "Jun 26", daysAgo: 2, boardSize: 4 },
  { id: "m_006", mode: "Ranked", opponent: "ghostline", winner: "Opponent", duration: "6:18", date: "Jun 25", daysAgo: 3, boardSize: 5 },
  { id: "m_007", mode: "Local", opponent: "Local", winner: "You", duration: "2:45", date: "Jun 24", daysAgo: 4, boardSize: 3 },
  { id: "m_008", mode: "Smart AI", opponent: "Smart AI", winner: "Opponent", duration: "5:01", date: "Jun 22", daysAgo: 6, boardSize: 6 },
];

const MODES = ["All", "Ranked", "Smart AI", "Perfect AI", "Duel", "Local"] as const;
const RESULTS = ["All", "Win", "Loss", "Draw"] as const;
const DATES = ["All time", "Today", "7 days", "30 days"] as const;
const SORTS = ["Newest", "Oldest", "Longest", "Shortest"] as const;

function HistoryPage() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<(typeof MODES)[number]>("All");
  const [result, setResult] = useState<(typeof RESULTS)[number]>("All");
  const [date, setDate] = useState<(typeof DATES)[number]>("All time");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Newest");

  const filtered = useMemo(() => {
    const dur = (s: string) => {
      const [m, sec] = s.split(":").map(Number);
      return m * 60 + sec;
    };
    const within = (d: number) =>
      date === "All time" ||
      (date === "Today" && d === 0) ||
      (date === "7 days" && d <= 7) ||
      (date === "30 days" && d <= 30);

    const list = ROWS.filter((r) => {
      if (mode !== "All" && r.mode !== mode) return false;
      if (result === "Win" && r.winner !== "You") return false;
      if (result === "Loss" && r.winner !== "Opponent") return false;
      if (result === "Draw" && r.winner !== "Draw") return false;
      if (!within(r.daysAgo)) return false;
      if (q && !`${r.mode} ${r.opponent}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });

    list.sort((a, b) => {
      if (sort === "Newest") return a.daysAgo - b.daysAgo;
      if (sort === "Oldest") return b.daysAgo - a.daysAgo;
      if (sort === "Longest") return dur(b.duration) - dur(a.duration);
      return dur(a.duration) - dur(b.duration);
    });
    return list;
  }, [q, mode, result, date, sort]);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Match history"
        description="Every game you've played, with replays."
      />

      <GlassPanel className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex min-w-[200px] flex-1 items-center">
            <Search className="pointer-events-none absolute left-2.5 size-3.5 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search opponent or mode…"
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground/70 focus:border-white/20"
            />
          </div>
          <Pills label="Mode" value={mode} options={MODES} onChange={setMode} />
          <Pills label="Date" value={date} options={DATES} onChange={setDate} />
          <Pills label="Result" value={result} options={RESULTS} onChange={setResult} />
          <Pills label="Sort" value={sort} options={SORTS} onChange={setSort} />
        </div>
      </GlassPanel>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title="No matches found"
          description="Try clearing a filter or adjusting your search."
        />
      ) : (
        <div className="grid gap-2.5 md:grid-cols-2">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
            >
              <HistoryCard row={r} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function HistoryCard({ row }: { row: Row }) {
  const resultTone =
    row.winner === "You"
      ? "bg-white text-black"
      : row.winner === "Draw"
        ? "border border-white/10 bg-white/[0.04] text-foreground"
        : "border border-white/10 bg-white/[0.02] text-muted-foreground";

  return (
    <div className="glass group flex h-full flex-col gap-3 rounded-2xl p-4 transition-colors hover:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px]">
            {row.mode}
          </span>
          <span className="text-[11px] text-muted-foreground">{row.boardSize}×{row.boardSize}</span>
        </div>
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${resultTone}`}
        >
          {row.winner === "You" ? "Victory" : row.winner === "Draw" ? "Draw" : "Defeat"}
        </span>
      </div>

      <div className="font-display text-base font-semibold tracking-tight">
        vs {row.opponent}
      </div>

      <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-mono">{row.duration}</span>
          <span>{row.date}</span>
        </div>
        <Link
          to="/app/replay/$id"
          params={{ id: row.id }}
          className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-foreground transition-colors hover:bg-white/[0.08]"
        >
          <Play className="size-3" /> Replay
        </Link>
      </div>
    </div>
  );
}

function Pills<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs outline-none focus:border-white/20"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-background">
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
