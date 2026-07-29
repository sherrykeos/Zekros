import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { dispatchPlayNow } from "@/contexts/play-entry";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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

export function Navigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const currentUser = useCurrentUser();
  const user = currentUser.data;

  useEffect(() => {
    return scrollY.on("change", (v) => setScrolled(v > 12));
  }, [scrollY]);

  const links = [
    { label: "Features", href: "#features" },
    { label: "How it works", href: "#how" },
    { label: "Modes", href: "#modes" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <div
        className={`flex w-full max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 transition-all duration-300 ${
          scrolled ? "glass-strong" : "border border-transparent"
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="font-display text-sm font-semibold tracking-[0.18em]">
            ZEKROS
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/app/play"
              className="hidden items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-sm font-medium text-foreground transition-all hover:bg-white/[0.08] hover:border-white/20 active:scale-[0.98] md:inline-flex"
            >
              <div className="grid size-6 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-white/30 to-white/5 text-[10px] font-semibold ring-1 ring-white/10">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="size-full object-cover"
                  />
                ) : (
                  initials(user.username)
                )}
              </div>
              <span className="max-w-[100px] truncate">{user.username}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => dispatchPlayNow("default")}
              className="hidden items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.98] md:inline-flex"
            >
              Play Now
              <ArrowRight className="size-3.5" />
            </button>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            className="grid size-9 place-items-center rounded-lg border border-white/10 md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong absolute inset-x-4 top-20 rounded-2xl p-3 md:hidden"
        >
          <div className="flex flex-col">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            {user ? (
              <Link
                to="/app/play"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-white/[0.08]"
              >
                <div className="grid size-6 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-white/30 to-white/5 text-[10px] font-semibold ring-1 ring-white/10">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      referrerPolicy="no-referrer"
                      className="size-full object-cover"
                    />
                  ) : (
                    initials(user.username)
                  )}
                </div>
                <span className="truncate">{user.username}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  dispatchPlayNow("default");
                }}
                className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3.5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Play Now <ArrowRight className="size-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}

function Logo() {
  return (
    <div className="relative grid size-7 place-items-center rounded-md bg-gradient-to-br from-white/95 to-white/60 text-[10px] font-bold text-black shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
      Z
    </div>
  );
}
