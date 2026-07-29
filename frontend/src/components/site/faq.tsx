import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { Plus } from "lucide-react";
import { SectionHeader } from "./features";

const faqs = [
  {
    q: "What is ZEKROS?",
    a: "A real-time strategy game built around adaptive boards, decaying pieces, and a token economy. Minimal on the surface, deep underneath.",
  },
  {
    q: "Is it competitive?",
    a: "Yes. A tuned ranked ladder, replay tooling, and a configurable ruleset for tournaments. Designed for repeat play, not novelty.",
  },
  {
    q: "What platforms are supported?",
    a: "ZEKROS runs in any modern browser. Native clients for desktop and mobile are on the roadmap after public launch.",
  },
  {
    q: "How does the AI work?",
    a: "Two tiers: an adaptive opponent that mirrors your patterns, and an optional solver for perfect-play study sessions.",
  },
  {
    q: "When can I play?",
    a: "Private alpha is live for invited testers. Public access opens in waves — join the list below to be notified.",
  },
  {
    q: "Who is building this?",
    a: "ZEROTH Labs. A small, opinionated team focused on systems-driven games with long half-lives.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <SectionHeader eyebrow="FAQ" title="Frequently asked." />
        <div className="mt-14 space-y-2">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="glass overflow-hidden rounded-2xl"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-display text-sm font-medium md:text-base">
                    {f.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Plus className="size-4 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
