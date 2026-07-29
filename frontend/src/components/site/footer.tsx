export function Footer() {
  const cols = [
    {
      title: "Product",
      links: ["Features", "Modes", "How it works", "Replay"],
    },
    { title: "Company", links: ["About", "Careers", "Press", "Contact"] },
    {
      title: "Resources",
      links: ["Documentation", "Changelog", "Status", "Brand"],
    },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies", "Security"] },
  ];

  return (
    <footer className="relative px-4 pb-12 pt-8">
      <div className="mx-auto max-w-6xl">
        <div className="hairline mb-12" />
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="grid size-7 place-items-center rounded-md bg-gradient-to-br from-white/95 to-white/60 text-[10px] font-bold text-black">
                Z
              </div>
              <span className="font-display text-sm font-semibold tracking-[0.18em]">
                ZEKROS
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              A real-time strategy game by ZEROTH Labs. Designed for repeat
              play.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {c.title}
              </div>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#"
                      className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mt-14" />
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <div>
            © {new Date().getFullYear()} ZEROTH Labs. All rights reserved.
          </div>
          <div className="font-mono uppercase tracking-[0.18em]">
            v0.1 · Alpha
          </div>
        </div>
      </div>
    </footer>
  );
}
