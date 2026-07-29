import { useRouterState, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  Bell,
  Menu,
  Zap,
  Settings,
  User,
  LogOut,
  Palette,
  SlidersHorizontal,
  LogIn,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppShell } from "@/contexts/app-shell";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useLogout } from "@/hooks/useLogout";

const titleMap: Record<string, { title: string; crumb: string[] }> = {
  "/app": { title: "Dashboard", crumb: ["ZEKROS", "Dashboard"] },
  "/app/play": { title: "Play", crumb: ["ZEKROS", "Play"] },
  "/app/multiplayer": {
    title: "Multiplayer",
    crumb: ["ZEKROS", "Multiplayer"],
  },
  "/app/history": { title: "Match History", crumb: ["ZEKROS", "History"] },
  "/app/profile": { title: "Profile", crumb: ["ZEKROS", "Profile"] },
  "/app/settings": { title: "Settings", crumb: ["ZEKROS", "Settings"] },
  "/app/developer": {
    title: "Developer Console",
    crumb: ["ZEKROS", "Developer"],
  },
  "/app/leaderboard": {
    title: "Leaderboard",
    crumb: ["ZEKROS", "Leaderboard"],
  },
};

function initials(name?: string | null) {
  if (!name) return "ZK";

  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ZK"
  );
}

export function TopBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = titleMap[pathname] ?? { title: "ZEKROS", crumb: ["ZEKROS"] };
  const { setMobileNavOpen } = useAppShell();
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const user = currentUser.data;
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const displayName = user?.username ?? "Not signed in";
  const displayEmail = user?.email ?? "Account required for cloud features";
  const displayInitials = initials(displayName);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleSignOut = () => {
    logout.mutate();
    setProfileOpen(false);
  };

  const closeAndNavigate = (to: "/app/profile" | "/app/settings") => {
    setProfileOpen(false);
    void navigate({ to });
  };

  return (
    <header className="glass sticky top-0 z-30 flex h-14 items-center gap-3 rounded-2xl px-3">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="grid size-9 place-items-center rounded-lg border border-white/10 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" />
      </button>

      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0">
          <h1 className="ml-4 truncate font-display text-sm font-semibold tracking-wide opacity-55 sm:text-[15px]">
            {meta.title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 md:flex">
          <span className="relative grid size-1.5 place-items-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/50" />
            <span className="relative size-1.5 rounded-full bg-emerald-400" />
          </span>
          <span className="text-[11px] font-medium text-muted-foreground">
            Online
          </span>
        </div>

        <Link
          to="/app/play"
          className="hidden items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-[1.02] sm:inline-flex"
        >
          <Zap className="size-3.5" /> Quick Play
        </Link>

        <button
          className="relative grid size-9 place-items-center rounded-lg border border-white/10 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-foreground" />
        </button>

        <div ref={profileRef} className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="grid size-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-white/30 to-white/5 text-xs font-semibold ring-1 ring-white/10"
            aria-label="Profile"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt=""
                referrerPolicy="no-referrer"
                className="size-full object-cover"
              />
            ) : (
              displayInitials
            )}
          </button>
          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.14 }}
                className="glass-strong absolute right-0 top-11 z-50 w-64 rounded-xl p-2"
              >
                <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
                  <div className="grid size-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-white/30 to-white/5 text-xs font-semibold ring-1 ring-white/10">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="size-full object-cover"
                      />
                    ) : (
                      displayInitials
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {displayName}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {displayEmail}
                    </div>
                  </div>
                </div>
                <div className="hairline my-1" />
                {!user ? (
                  <Link
                    to="/auth/sign-in"
                    search={{}}
                    onClick={() => setProfileOpen(false)}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
                  >
                    <LogIn className="size-4" />
                    <span className="flex-1 text-left">Sign in</span>
                  </Link>
                ) : (
                  <>
                    <DropdownItem
                      icon={User}
                      label="Profile"
                      onClick={() => closeAndNavigate("/app/profile")}
                    />
                    <DropdownItem
                      icon={SlidersHorizontal}
                      label="Preferences"
                      onClick={() => closeAndNavigate("/app/settings")}
                    />
                    <DropdownItem
                      icon={Palette}
                      label="Theme"
                      rightSlot={
                        <span className="text-[10px] text-muted-foreground">
                          Dark
                        </span>
                      }
                    />
                    <DropdownItem
                      icon={Settings}
                      label="Settings"
                      onClick={() => closeAndNavigate("/app/settings")}
                    />
                    <div className="hairline my-1" />
                    <DropdownItem
                      icon={LogOut}
                      label={logout.isPending ? "Logging out" : "Log out"}
                      onClick={handleSignOut}
                    />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function DropdownItem({
  icon: Icon,
  label,
  rightSlot,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  rightSlot?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
    >
      <Icon className="size-4" />
      <span className="flex-1 text-left">{label}</span>
      {rightSlot}
    </button>
  );
}
