import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import {
  LayoutDashboard,
  Gamepad2,
  Users,
  History,
  User,
  Settings,
  Trophy,
  Award,
  Info,
  ChevronLeft,
  X,
} from "lucide-react";
import { useAppShell } from "@/contexts/app-shell";
import type { ComponentType } from "react";

import { APP_CONSTANTS } from "@/constants/appConstants";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
};

const items: NavItem[] = [
  // { to: "/app", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/play", label: "Play", icon: Gamepad2 },
  { to: "/app/multiplayer", label: "Multiplayer", icon: Users },
  { to: "/app/history", label: "History", icon: History },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: Settings },
  { to: "/app/about", label: "About", icon: Info },
  // { to: "/app/achievements", label: "Achievements", icon: Award, badge: "Soon", disabled: true },
  // { to: "/app/leaderboard", label: "Leaderboard", icon: Trophy, badge: "Soon", disabled: true },
];

const upitems: NavItem[] = [
  {
    to: "/app/achievements",
    label: "Achievements",
    icon: Award,
    badge: "Soon",
    disabled: true,
  },
  {
    to: "/app/leaderboard",
    label: "Leaderboard",
    icon: Trophy,
    badge: "Soon",
    disabled: true,
  },
];

function SidebarInner({
  collapsed,
  onNavigate,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <a href="/" className="flex items-center gap-2.5">
          <img
            src="/assets/zekroslogo.png"
            alt="ZEKROS"
            className="size-7 shrink-0 object-contain"
          />
          {!collapsed && (
            <span className="font-display text-sm font-semibold tracking-[0.18em]">
              {APP_CONSTANTS.app.name}
            </span>
          )}
        </a>
      </div>

      <div className="hairline mx-3" />

      <nav className="flex-1 space-y-0.5 p-3">
        {items.map((item) => {
          const active =
            item.to === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.to);
          const Icon = item.icon;
          const content = (
            <motion.span
              whileHover={{ x: collapsed ? 0 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              } ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="size-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.span>
          );

          if (item.disabled) {
            return (
              <div key={item.to} title={item.label}>
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>

      <nav className="flex-1 space-y-0.5 p-3">
        {upitems.map((item) => {
          const active =
            item.to === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.to);
          const Icon = item.icon;
          const content = (
            <motion.span
              whileHover={{ x: collapsed ? 0 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors ${
                active
                  ? "bg-white/[0.08] text-foreground"
                  : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground"
              } ${item.disabled ? "cursor-not-allowed opacity-60" : ""}`}
            >
              {active && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-y-1 left-0 w-0.5 rounded-r bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <Icon className="size-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </motion.span>
          );

          if (item.disabled) {
            return (
              <div key={item.to} title={item.label}>
                {content}
              </div>
            );
          }

          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              title={collapsed ? item.label : undefined}
            >
              {content}
            </Link>
          );
        })}
      </nav>
      <div className="hairline mx-3" />

      <div className="p-3">
        <div className="p-2 text-center overflow-hidden">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {/* <span className="relative grid size-2 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/60" />
                  <span className="relative size-2 rounded-full bg-emerald-400" />
                </span> */}
                <span className="text-xs font-medium text-muted-foreground">
                  Version : {APP_CONSTANTS.version.version} · {APP_CONSTANTS.version.stage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppShell();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 34 }}
      className="glass hidden h-[calc(100vh-1rem)] shrink-0 rounded-2xl lg:block"
    >
      <SidebarInner collapsed={sidebarCollapsed} />

      <button
        onClick={toggleSidebar}
        aria-label="Collapse sidebar"
        className="absolute -right-3 top-16 grid size-6 place-items-center rounded-full border border-white/10 bg-background text-muted-foreground transition-colors hover:text-foreground"
      >
        <motion.span animate={{ rotate: sidebarCollapsed ? 180 : 0 }}>
          <ChevronLeft className="size-3.5" />
        </motion.span>
      </button>
    </motion.aside>
  );
}

export function MobileSidebar() {
  const { mobileNavOpen, setMobileNavOpen } = useAppShell();
  return (
    <AnimatePresence>
      {mobileNavOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileNavOpen(false)}
          />
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            className="glass-strong fixed inset-y-2 left-2 z-50 w-64 rounded-2xl lg:hidden"
          >
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute right-3 top-3 grid size-7 place-items-center rounded-lg border border-white/10 text-muted-foreground"
              aria-label="Close"
            >
              <X className="size-3.5" />
            </button>
            <SidebarInner
              collapsed={false}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
