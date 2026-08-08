import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/site/navigation";
import { Footer } from "@/components/site/footer";
import { motion, AnimatePresence } from "motion/react";
import { APP_CONSTANTS, getPageTitle } from "@/constants/appConstants";
import { ZekrosLogo } from "@/components/brand/zekros-logo";

// Define schema for optional tab search parameter
interface AboutSearch {
  tab?: "about" | "privacy" | "terms" | "cookies";
}

export const Route = createFileRoute("/about")({
  validateSearch: (search: Record<string, unknown>): AboutSearch => {
    return {
      tab: (search.tab as any) || "about",
    };
  },
  head: () => {
    return {
      meta: [
        { title: getPageTitle("Information & Guidelines") },
        {
          name: "description",
          content: `Review information, legal guidelines, and details for ZEKROS and ${APP_CONSTANTS.company.name}.`,
        },
      ],
    };
  },
  component: AboutPage,
});

function AboutPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const activeTab = (search.tab || "about") as "about" | "privacy" | "terms" | "cookies";

  const setTab = (tab: "about" | "privacy" | "terms" | "cookies") => {
    navigate({
      search: { tab },
    });
  };

  const tabs = [
    { id: "about" as const, label: "About" },
    { id: "privacy" as const, label: "Privacy Policy" },
    { id: "terms" as const, label: "Terms of Service" },
    // { id: "cookies" as const, label: "Cookies" },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#050505] text-foreground flex flex-col justify-between">
      <Navigation />

      {/* Main Content */}
      <main className="relative flex-grow pt-32 pb-24">
        {/* Decorative Grid & Ambient Background Lighting */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-70" />
        <div className="pointer-events-none absolute left-1/2 top-1/4 size-[500px] -translate-x-1/2 rounded-full bg-purple-600/4 blur-[120px]" />

        <div className="relative z-10 mx-auto max-w-4xl px-6">
          {/* Page Heading */}
          {/* <div className="space-y-4 text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-100/20 bg-purple-500/10 px-3 py-1 text-xs font-mono text-gray-100">
              <span>ZEKROS PORTAL</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-black tracking-tight text-gray-300 uppercase">
              Information & Guidelines
            </h1>
          </div> */}

          {/* Premium Tab Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 border-b border-white/5 pb-6 mb-12">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`relative px-4 py-2 text-xs sm:text-sm font-mono tracking-wider uppercase rounded-xl transition-all duration-300 ${
                    active
                      ? "text-white bg-white/5 border border-white/10"
                      : "text-muted-foreground hover:text-white hover:bg-white/[0.02] border border-transparent"
                  }`}
                >
                  {t.label}
                  {active && (
                    <motion.div
                      layoutId="activeTabGlow"
                      className="absolute inset-x-4 -bottom-6 h-px bg-purple-500/30 blur-[2px]"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Pane */}
          <div className="min-h-[300px]">
            <AnimatePresence mode="wait">
              {activeTab === "about" && (
                <motion.div
                  key="about-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-12"
                >
                  {/* The Game Section */}
                  <div className="group relative rounded-2xl border border-white/5 bg-white/[0.01] p-8 sm:p-10 shadow-2xl backdrop-blur-sm transition-all hover:border-white/10">
                    <div className="flex flex-col md:flex-row md:items-start gap-8">
                      <div className="shrink-0">
                        <ZekrosLogo variant="emblem" className="w-16 text-purple-400" />
                      </div>
                      <div className="space-y-4">
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                          THE GAME — ZEKROS
                        </h2>
                        <p className="text-sm leading-relaxed text-muted-foreground/90">
                          ZEKROS turns a classic grid duel into a fluid, living strategy arena. Grid sizes adapt dynamically from 3×3 to 5×5, active pieces expire automatically, and tactical Reclaim Tokens let you reshape the board mid-fight.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground/90">
                          Built for fast, competitive matches, ZEKROS is designed to be beautifully simple to pick up, yet incredibly deep to master.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* The Studio Section */}
                  <div className="group relative rounded-2xl border border-white/5 bg-white/[0.01] p-8 sm:p-10 shadow-2xl backdrop-blur-sm transition-all hover:border-white/10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 place-items-center rounded-xl border border-white/15 bg-gradient-to-br from-white/15 via-white/5 to-transparent font-display text-xs font-bold text-white shadow-sm">
                          K
                        </div>
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
                          THE STUDIO — KEOS LABS
                        </h2>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground/90">
                        KEOS Labs is an independent creative studio dedicated to developing premium digital software, games, and tactile user experiences. We obsess over typography, micro-interactions, layout alignment, and beautiful motion.
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground/90">
                        Our development approach is guided by restraint and design excellence. We aim to build memorable software that feels expensive, premium, and satisfying to interact with.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "privacy" && (
                <motion.div
                  key="privacy-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground/90 font-normal"
                >
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      1. Data Collection
                    </h2>
                    <p>
                      We collect personal identifiers such as usernames, email addresses, and provider credentials (e.g. Google OAuth payloads) solely to manage authentication, player profiles, game states, and matchmaking logs.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      2. Data Usage
                    </h2>
                    <p>
                      Your data is processed exclusively to deliver the core competitive multiplayer services, save local game histories, populate the public leaderboards, and secure matches against cheating. We do not sell or lease player data.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      3. Security Measures
                    </h2>
                    <p>
                      Your session tokens are securely encrypted using standard web token protocols (JWT) and stored via HttpOnly cookies to protect player profiles from cross-site scripting (XSS) vulnerabilities.
                    </p>
                  </section>
                </motion.div>
              )}

              {activeTab === "terms" && (
                <motion.div
                  key="terms-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground/90 font-normal"
                >
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      1. Acceptable Use
                    </h2>
                    <p>
                      By accessing ZEKROS, you agree not to execute automated scripts, bots, modified game clients, or cheating tools designed to gain an unfair advantage in public matchmaking or multiplayer rooms.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      2. User Accounts
                    </h2>
                    <p>
                      You are responsible for keeping your credentials and OAuth authentication linkages secure. Custom rooms and multiplayer modes require active sign-in to guarantee persistent statistics, rankings, and lobby synchronization.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      3. Service Availability
                    </h2>
                    <p>
                      ZEKROS is provided as-is without any warranties of uninterrupted operation. We reserve the right to modify game balances, wipe seasonal leaderboards, or terminate accounts demonstrating hostile, abusive, or disruptive behaviors.
                    </p>
                  </section>
                </motion.div>
              )}

              {/* {activeTab === "cookies" && (
                <motion.div
                  key="cookies-pane"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground/90 font-normal"
                >
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      1. What are cookies?
                    </h2>
                    <p>
                      Cookies are small text identifiers saved on your device by the web browser. They store persistent player parameters, authentication hashes, and system preferences.
                    </p>
                  </section>
                  <section className="space-y-3">
                    <h2 className="font-display text-lg font-bold text-white tracking-tight uppercase">
                      2. How ZEKROS uses cookies
                    </h2>
                    <p>
                      ZEKROS utilizes secure, HTTP-only cookies to verify session authentication, store JWT refresh tokens, track sound/mute settings, and maintain matchmaking reconnect links. These are strictly essential for providing gameplay functionality.
                    </p>
                  </section>
                </motion.div>
              )} */}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
