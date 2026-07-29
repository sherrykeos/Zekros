import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  History,
  Play,
  Trophy,
  Users,
  Bot,
  Gamepad2,
  Clock,
  Calendar,
  Trash2,
  Filter,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { EmptyState, GlassPanel, SectionHeader } from "@/components/app/primitives";
import { RequireAuth } from "@/components/auth/require-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMatchList, useDeleteMatch } from "@/hooks/match";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { MatchHistoryItem } from "@/services/api/matchService";

export const Route = createFileRoute("/app/history")({
  head: () => ({ meta: [{ title: "Match History - ZEKROS" }] }),
  component: HistoryRoute,
});

function HistoryRoute() {
  return (
    <RequireAuth>
      <HistoryPage />
    </RequireAuth>
  );
}

type ModeFilter = "ALL" | "ONLINE" | "PBOT" | "NBOT" | "LOCAL";
type SizeFilter = "ALL" | "3" | "4" | "5" | "6";

function HistoryPage() {
  const { data: user } = useCurrentUser();
  const { data: response, isLoading, isError, refetch } = useMatchList(user?.id ? { userId: user.id } : undefined);
  const deleteMatchMutation = useDeleteMatch();

  const [modeFilter, setModeFilter] = useState<ModeFilter>("ALL");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("ALL");
  const [targetDeleteMatch, setTargetDeleteMatch] = useState<MatchHistoryItem | null>(null);

  const rawMatches: MatchHistoryItem[] = response?.data ?? [];

  // Filter and sort matches by timestamp (newest first)
  const filteredMatches = useMemo(() => {
    return rawMatches
      .filter((m) => {
        if (modeFilter !== "ALL" && m.gameMode !== modeFilter) return false;
        if (sizeFilter !== "ALL" && String(m.boardSize) !== sizeFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
  }, [rawMatches, modeFilter, sizeFilter]);

  const confirmDelete = async () => {
    if (!targetDeleteMatch) return;
    try {
      await deleteMatchMutation.mutateAsync({
        matchId: targetDeleteMatch.id,
        userId: user?.id,
      });
    } finally {
      setTargetDeleteMatch(null);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Match History"
        description="Every game recorded directly from the database with full step-by-step replay capability."
      />

      {/* Top Filter Bar */}
      <GlassPanel className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Filter className="size-3.5" /> Filter Matches
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Mode Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Mode:</span>
            {(["ALL", "ONLINE", "NBOT", "PBOT", "LOCAL"] as ModeFilter[]).map((mode) => {
              const label =
                mode === "ALL"
                  ? "All Modes"
                  : mode === "ONLINE"
                  ? "Online"
                  : mode === "NBOT"
                  ? "Smart AI"
                  : mode === "PBOT"
                  ? "Perfect AI"
                  : "Local";
              const active = modeFilter === mode;

              return (
                <button
                  key={mode}
                  onClick={() => setModeFilter(mode)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition-all ${
                    active
                      ? "bg-white text-black font-semibold shadow"
                      : "border border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="hidden h-4 w-px bg-white/10 sm:block" />

          {/* Size Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-muted-foreground mr-1">Size:</span>
            {(["ALL", "3", "4", "5", "6"] as SizeFilter[]).map((size) => {
              const label = size === "ALL" ? "All Sizes" : `${size}×${size}`;
              const active = sizeFilter === size;

              return (
                <button
                  key={size}
                  onClick={() => setSizeFilter(size)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                    active
                      ? "bg-white text-black font-semibold shadow"
                      : "border border-white/10 bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </GlassPanel>

      {/* Matches List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="h-32 animate-pulse p-6">
              <div className="h-4 w-1/3 rounded bg-white/10 mb-3" />
              <div className="h-3 w-1/2 rounded bg-white/5" />
            </GlassPanel>
          ))}
        </div>
      ) : isError ? (
        <GlassPanel className="p-6 text-center text-muted-foreground">
          <p>Failed to load match history from database.</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg border border-white/10 bg-white/5 px-4 py-1.5 text-xs text-foreground hover:bg-white/10"
          >
            Retry
          </button>
        </GlassPanel>
      ) : filteredMatches.length === 0 ? (
        <EmptyState
          icon={History}
          title={rawMatches.length === 0 ? "No Match History Found" : "No Matches Match Filters"}
          description={
            rawMatches.length === 0
              ? "Play a game in Online, vs Bot, or Local mode to view recorded matches here."
              : "Try adjusting or clearing your filters to view stored match history."
          }
          action={
            rawMatches.length > 0 ? (
              <button
                onClick={() => {
                  setModeFilter("ALL");
                  setSizeFilter("ALL");
                }}
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-foreground hover:bg-white/20"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/app/lobby"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-white/90"
              >
                <Gamepad2 className="size-4" /> Play a Match
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <MatchHistoryCard
              key={match.id}
              match={match}
              onPromptDelete={() => setTargetDeleteMatch(match)}
            />
          ))}
        </div>
      )}

      {/* Custom Sleek Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={Boolean(targetDeleteMatch)}
        matchId={targetDeleteMatch?.id}
        isDeleting={deleteMatchMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setTargetDeleteMatch(null)}
      />
    </div>
  );
}

function MatchHistoryCard({
  match,
  onPromptDelete,
}: {
  match: MatchHistoryItem;
  onPromptDelete: () => void;
}) {
  const playerX = match.participants?.find((p) => p.symbol === "X");
  const playerO = match.participants?.find((p) => p.symbol === "O");

  const nameX = playerX?.user?.displayName || playerX?.user?.username || playerX?.guestName || "Player X";
  const nameO = playerO?.user?.displayName || playerO?.user?.username || playerO?.guestName || "Player O";

  const winnerSymbol = match.result === "PLAYER_X" ? "X" : match.result === "PLAYER_O" ? "O" : null;

  const modeLabel =
    match.gameMode === "ONLINE"
      ? "Online Multiplayer"
      : match.gameMode === "PBOT"
      ? "vs Perfect Bot"
      : match.gameMode === "NBOT"
      ? "vs Smart Bot"
      : "Local Match";

  const modeIcon =
    match.gameMode === "ONLINE" ? (
      <Users className="size-3.5 text-sky-400" />
    ) : match.gameMode === "PBOT" || match.gameMode === "NBOT" ? (
      <Bot className="size-3.5 text-purple-400" />
    ) : (
      <Gamepad2 className="size-3.5 text-emerald-400" />
    );

  const formattedDate = match.createdAt
    ? new Date(match.createdAt).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Unknown Date";

  const durationSec = match.durationMs ? Math.round(match.durationMs / 1000) : null;

  return (
    <GlassPanel className="group relative p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/[0.04]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left column: Match details & players */}
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-0.5 text-[11px] font-medium text-foreground">
              {modeIcon}
              {modeLabel}
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {match.boardSize}×{match.boardSize} Board
            </span>

            {winnerSymbol ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-300">
                <Trophy className="size-3" /> Winner: {winnerSymbol === "X" ? nameX : nameO}
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                In Progress / Ended
              </span>
            )}
          </div>

          {/* Actual Player & Opponent Names */}
          <div className="flex items-center gap-4 text-sm font-medium">
            <span className={winnerSymbol === "X" ? "text-foreground font-semibold" : "text-muted-foreground"}>
              <strong className="text-foreground font-bold">X:</strong> {nameX}
            </span>
            <span className="text-xs text-muted-foreground">vs</span>
            <span className={winnerSymbol === "O" ? "text-foreground font-semibold" : "text-muted-foreground"}>
              <strong className="text-foreground font-bold">O:</strong> {nameO}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Calendar className="size-3" /> {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3" /> {durationSec ? `${durationSec}s` : `${match.totalMoves} moves`}
            </span>
          </div>
        </div>

        {/* Right column: Action buttons */}
        <div className="flex items-center gap-2 sm:self-center">
          <Link
            to="/app/replay/$id"
            params={{ id: match.id }}
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-medium text-foreground transition-all duration-200 hover:scale-105 hover:bg-white hover:text-black shadow-lg"
          >
            <Play className="size-3.5 fill-current" /> Replay
          </Link>

          <button
            onClick={onPromptDelete}
            title="Delete Match Record"
            className="grid size-9 place-items-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-colors hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}

function DeleteConfirmModal({
  open,
  matchId,
  isDeleting,
  onConfirm,
  onClose,
}: {
  open: boolean;
  matchId?: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent className="glass-strong max-w-md overflow-hidden rounded-3xl border-red-500/20 bg-background/95 p-0 text-foreground shadow-2xl">
        <div className="relative px-7 py-8 text-center space-y-4">
          <div className="pointer-events-none absolute -top-20 left-1/2 size-56 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />

          <div className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-500/30 bg-red-500/10 text-red-400">
            <AlertTriangle className="size-7" />
          </div>

          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
              Delete Match Record?
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to permanently delete match <span className="font-mono text-foreground font-semibold">#{matchId}</span> from the database? This action cannot be undone.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-foreground hover:bg-white/[0.08] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
              {isDeleting ? "Deleting..." : "Delete Record"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
