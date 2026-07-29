import { useState } from "react";
import { motion } from "motion/react";
import { DoorOpen, DoorClosed, Users, Wifi, Clock, Lock } from "lucide-react";
import { SectionHeader } from "@/components/app/primitives";

// TODO: Hook to socket connection status from `useSocketStatus()` (Phase 4).
const connection = { online: true, latency: 42 };

// TODO: replace with `GET /rooms/recent` (backend, Phase 4).
const recentRooms = [
  { code: "ZK-4F2A", host: "Mira K.", mode: "4×4 · Reclaim", at: "2h ago" },
  { code: "ZK-91XB", host: "Theo R.", mode: "5×5 · Standard", at: "Yesterday" },
  { code: "ZK-22PD", host: "Anya L.", mode: "4×4 · Endless", at: "2d ago" },
];

export function MultiplayerPanel({
  onCreate,
  onJoin,
}: {
  onCreate?: () => void;
  onJoin?: (code?: string) => void;
}) {
  const [code, setCode] = useState("");

  return (
    <section>
      <SectionHeader
        title="Custom Rooms"
        description="Create a room, join with a code, or rejoin a recent lobby."
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span
              className={`size-1.5 rounded-full ${connection.online ? "bg-bone" : "bg-smoke"}`}
            />
            {connection.online ? `Online · ${connection.latency}ms` : "Offline"}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Create */}
        <motion.button
          whileHover={{ y: -3 }}
          onClick={onCreate}
          className="glass group relative flex flex-col items-start overflow-hidden rounded-2xl p-5 text-left"
        >
          <div className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
            <DoorOpen className="size-5" strokeWidth={1.6} />
          </div>
          <div className="mt-6 font-display text-base font-semibold">
            Create room
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Private lobby. Share the code with your friends.
          </p>
          <span className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Generate →
          </span>
        </motion.button>

        {/* Join with code */}
        <div className="glass relative flex flex-col items-start overflow-hidden rounded-2xl p-5">
          <div className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04]">
            <DoorClosed className="size-5" strokeWidth={1.6} />
          </div>
          <div className="mt-6 font-display text-base font-semibold">
            Join with code
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Drop in by entering a 6-character room code.
          </p>
          <div className="mt-4 flex w-full items-center gap-2">
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.toUpperCase().slice(0, 7))
              }
              placeholder="ZK-XXXX"
              className="h-10 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 font-mono text-sm uppercase tracking-[0.18em] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-white/20"
            />
            <button
              onClick={() => onJoin?.(code)}
              className="h-10 rounded-lg bg-primary px-4 text-xs font-medium text-primary-foreground"
            >
              Join
            </button>
          </div>
        </div>

        {/* Invite friends — coming soon */}
        <div className="relative flex flex-col items-start overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.015] p-5">
          <div className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground">
            <Users className="size-5" strokeWidth={1.6} />
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="font-display text-base font-semibold">
              Invite friends
            </div>
            <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
              <Lock className="size-2.5" /> Soon
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Bring your circle into private rooms with a single tap.
          </p>
        </div>
      </div>

      {/* Recent rooms */}
      <div className="mt-5 glass overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Recent rooms
          </div>
          <Wifi className="size-3.5 text-muted-foreground" />
        </div>
        <ul className="divide-y divide-white/[0.04]">
          {recentRooms.map((r) => (
            <li
              key={r.code}
              className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <div className="min-w-0">
                <div className="font-mono text-sm tracking-[0.16em]">
                  {r.code}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">
                  {r.host} · {r.mode}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Clock className="size-3" /> {r.at}
                </span>
                <button
                  onClick={() => onJoin?.(r.code)}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-white/[0.08]"
                >
                  Rejoin
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
