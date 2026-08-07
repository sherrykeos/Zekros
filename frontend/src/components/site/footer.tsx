import { motion } from "motion/react";
import { Link } from "@tanstack/react-router";
import { APP_CONSTANTS } from "@/constants/appConstants";

interface FooterLink {
  label: string;
  href: string;
  search?: { tab: "about" | "privacy" | "terms" | "cookies" };
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const navSections: FooterSection[] = [
  {
    title: "Features",
    links: [
      { label: "Play Now", href: "/app/play" },
      { label: "Multiplayer", href: "/app/multiplayer" },
      { label: "AI Battle", href: "/app/setup" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about", search: { tab: "about" } },
      { label: "Privacy Policy", href: "/about", search: { tab: "privacy" } },
      { label: "Terms of Service", href: "/about", search: { tab: "terms" } },
      { label: "Cookies", href: "/about", search: { tab: "cookies" } },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#050505] pt-24 pb-5 border-white/[0.08] text-foreground select-none">
           {/* -------------------------------------------------------------------------- */}
      {/* Multi-layered Cinematic Background                                        */}
      {/* -------------------------------------------------------------------------- */}

      {/* hero text and background */}
      <div>
        {/* Ambient Moving Blur Lights (Behind Hero Text) */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute left-1/4 top-12 size-96 rounded-full bg-blue-600/10 blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1.15, 1, 1.15],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute right-1/4 top-20 size-96 rounded-full bg-violet-600/10 blur-[140px]"
        />

        {/* -------------------------------------------------------------------------- */}
        {/* Hero Background Typography ("ZEKROS")                                     */}
        {/* -------------------------------------------------------------------------- */}
        <div className="text-center pointer-events-none relative top-26">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative font-display text-[21vw] font-black leading-none uppercase tracking-[0.08em] select-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.18] via-white/[0.05] to-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.9)] opacity-15"
            style={{
              WebkitTextStroke: "1px rgba(255, 255, 255, 0.08)",
            }}
          >
            ZEKROS
            {/* Metallic Sweep Reflection Effect */}
            <motion.div
              animate={{
                x: ["-100%", "200%"],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                repeatDelay: 11,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-overlay bg-clip-text"
            />
          </motion.h1>
        </div>
      </div>

       {/* Subtle Micro-Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_2px),linear-gradient(to_bottom,#ffffff04_1px,transparent_2px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-80" />

      {/* -------------------------------------------------------------------------- */}
      {/* Footer Content Grid                                                       */}
      {/* -------------------------------------------------------------------------- */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-[#050505]/25 via-[#050505]/10 to-transparent z-10" />
        {/* Subtle Micro-Grid Pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_2px),linear-gradient(to_bottom,#ffffff04_1px,transparent_2px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-90" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 pt-2 pb-14">
            {/* Left Column: Brand & Description */}
            <div className="space-y-6 max-w-sm">
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground/80 font-normal">
                ZEKROS is a modern competitive strategy game built around skill,
                tactical thinking and beautiful gameplay experiences.
              </p>

              <div className="social-links pt-3 flex items-center gap-2.5">
                {APP_CONSTANTS.socials.github && (
                  <a
                    href={APP_CONSTANTS.socials.github}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="GitHub"
                    className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground/80 hover:border-white/25 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </a>
                )}
                {APP_CONSTANTS.socials.linkedin && (
                  <a
                    href={APP_CONSTANTS.socials.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="LinkedIn"
                    className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground/80 hover:border-white/25 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                    </svg>
                  </a>
                )}
                {APP_CONSTANTS.socials.discord && (
                  <a
                    href={APP_CONSTANTS.socials.discord}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Discord"
                    className="grid size-8 place-items-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground/80 hover:border-white/25 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                  >
                    <svg className="size-4 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Right Navigation Columns (Features & Company) */}
            <div className="flex items-start gap-12 sm:gap-20">
              {navSections.map((sec) => (
                <div key={sec.title} className="space-y-4">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.26em] text-muted-foreground/70 font-semibold">
                    {sec.title}
                  </h3>
                  <ul className="space-y-3 font-mono text-xs">
                    {sec.links.map((link) => {
                      const isExternal = link.href === "#";
                      return (
                        <li key={link.label}>
                          {isExternal ? (
                            <a
                              href={link.href}
                              className="group inline-flex items-center gap-1.5 text-muted-foreground/70 transition-all duration-300 hover:text-foreground hover:translate-x-1.5"
                            >
                              <span className="h-px w-0 bg-primary/60 transition-all duration-300 group-hover:w-2" />
                              <span>{link.label}</span>
                            </a>
                          ) : (
                            <Link
                              to={link.href as any}
                              search={link.search as any}
                              className="group inline-flex items-center gap-1.5 text-muted-foreground/70 transition-all duration-300 hover:text-foreground hover:translate-x-1.5"
                            >
                              <span className="h-px w-0 bg-primary/60 transition-all duration-300 group-hover:w-2" />
                              <span>{link.label}</span>
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* -------------------------------------------------------------------------- */}
          {/* Bottom Bar                                                                */}
          {/* -------------------------------------------------------------------------- */}
          <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-4 sm:flex-row sm:items-center justify-between font-mono text-xs text-muted-foreground/70">
            {/* Left: company branding */}
            <p className="text-foreground/40 font-medium hover:text-purple-300 transition-colors cursor-default mb-1">KEOS Labs Product</p>

            {/* Center: Author Credit and copyright */}
            <div className="text-muted-foreground/60 text-center flex flex-col gap-1 ">
            
            <p>
              Made with passion by{" "}
              <span className="text-foreground/40 font-medium hover:text-white transition-colors cursor-default">
                Sherry Keos
              </span>
              </p>
              <div>© {new Date().getFullYear()} ZEKROS. Copyright reserved</div>
            </div>

            {/* Right: Version & Platform Status */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-muted-foreground/60">
                Version v{APP_CONSTANTS.version.version}
              </span>

              
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
