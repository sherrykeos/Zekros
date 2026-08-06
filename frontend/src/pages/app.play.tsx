import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";

import { PlayHero } from "@/components/play/hero";
import { QuickActions } from "@/components/play/quick-actions";
import { GameModes } from "@/components/play/game-modes";
import { ContinueMatch } from "@/components/play/continue-match";
import { MultiplayerPanel } from "@/components/play/multiplayer-panel";
import { RecentActivity } from "@/components/play/recent-activity";
import { Tips } from "@/components/play/tips";
import { Featured } from "@/components/play/featured";
import { CreateRoomModal } from "@/components/play/modals/create-room";
import { JoinRoomModal } from "@/components/play/modals/join-room";
import { CustomMatchModal } from "@/components/play/modals/custom-match";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { usePlayEntry } from "@/contexts/play-entry";

export const Route = createFileRoute("/app/play")({
  head: () => ({
    meta: [
      { title: "Play â€” ZEKROS" },
      {
        name: "description",
        content:
          "The ZEKROS Play Hub. Pick a mode, match an opponent, or jump back into a game.",
      },
    ],
  }),
  component: PlayPage,
});

const MULTIPLAYER_IDS = new Set(["quick", "create", "join", "multiplayer"]);

function PlayPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { openAccountRequired } = usePlayEntry();

  const isGuest = !currentUser.data;

  // TODO: in Phase 5 hand off the chosen mode/config to a match-launch service.
  const handleQuickAction = (id: string) => {
    if (isGuest && MULTIPLAYER_IDS.has(id)) {
      openAccountRequired();
      return;
    }
    switch (id) {
      case "create":
        // setOpenCreate(true);
        void navigate({ to: "/app/lobby" as any, state: { mode: "create" } as any });
        break;
      case "join":
        setOpenJoin(true);
        break;
      case "custom":
        void navigate({
          to: "/app/setup" as any,
          state: { mode: "custom" } as any,
        });
        break;
      case "smart":
      case "perfect":
      case "local":
      case "quick":
      case "multiplayer":
        void navigate({ to: "/app/setup" as any, state: { mode: id } as any });
        break;
      default:
        void navigate({ to: "/app/setup" });
        break;
    }
  };

  const handleJoin = (code?: string) => {
    if (isGuest) {
      openAccountRequired();
      return;
    }
    setJoinCode(code ?? "");
    setOpenJoin(true);
  };

  const { data: user } = useCurrentUser();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-10 pb-6"
    >
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
          ZEKROS - Play
        </div>
        <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          welcome back, <span className="text-gradient"> {user?.username}</span>,
        </h1>
      </div>

      {/* <PlayHero onQuickPlay={() => handleQuickAction("quick")} /> */}

      {/* <ContinueMatch /> */}

      {/* <GameModes onLaunch={handleQuickAction} /> */}

      <QuickActions onSelect={handleQuickAction} />

      <MultiplayerPanel
        onCreate={() => handleQuickAction("create")}
        onJoin={handleJoin}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* <RecentActivity /> */}
        <Tips />
      </div>

      <Featured />

      <CreateRoomModal open={openCreate} onOpenChange={setOpenCreate} />
      <JoinRoomModal
        open={openJoin}
        onOpenChange={setOpenJoin}
        initialCode={joinCode}
      />
      <CustomMatchModal open={openCustom} onOpenChange={setOpenCustom} />
    </motion.div>
  );
}
