import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type PlayEntryIntent = "default" | "multiplayer";

type PlayEntryState = {
  open: boolean;
  intent: PlayEntryIntent;
  openEntry: (intent?: PlayEntryIntent) => void;
  closeEntry: () => void;
  accountRequiredOpen: boolean;
  openAccountRequired: () => void;
  closeAccountRequired: () => void;
};

const Ctx = createContext<PlayEntryState | null>(null);

/**
 * Global Play-Now entry orchestration. Lives at the root so any button
 * (landing nav, hero, CTA, in-app quick action) can open the entry modal
 * without prop drilling.
 */
export function PlayEntryProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [intent, setIntent] = useState<PlayEntryIntent>("default");
  const [accountRequiredOpen, setAccountRequiredOpen] = useState(false);

  const openEntry = useCallback((i: PlayEntryIntent = "default") => {
    setIntent(i);
    setOpen(true);
  }, []);
  const closeEntry = useCallback(() => setOpen(false), []);

  // Global event bridge — lets non-React or deeply nested code call `dispatchPlayNow()`.
  useEffect(() => {
    const onPlay = (e: Event) => {
      const ce = e as CustomEvent<{ intent?: PlayEntryIntent }>;
      openEntry(ce.detail?.intent ?? "default");
    };
    window.addEventListener("zekros:play-now", onPlay as EventListener);
    return () => window.removeEventListener("zekros:play-now", onPlay as EventListener);
  }, [openEntry]);

  return (
    <Ctx.Provider
      value={{
        open,
        intent,
        openEntry,
        closeEntry,
        accountRequiredOpen,
        openAccountRequired: () => setAccountRequiredOpen(true),
        closeAccountRequired: () => setAccountRequiredOpen(false),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function usePlayEntry() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePlayEntry must be used within PlayEntryProvider");
  return c;
}

/** Fire-and-forget helper for non-React call sites (landing page anchors etc.). */
export function dispatchPlayNow(intent: PlayEntryIntent = "default") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("zekros:play-now", { detail: { intent } }));
}
