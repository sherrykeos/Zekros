import { createFileRoute } from "@tanstack/react-router";
import { Navigation } from "@/components/site/navigation";
import { Hero } from "@/components/site/hero";
import { Features } from "@/components/site/features";
import { HowItWorks } from "@/components/site/how";
import { Modes } from "@/components/site/modes";
import { Stats } from "@/components/site/stats";
import { FAQ } from "@/components/site/faq";
import { CTA } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZEKROS — Strategy, evolved. By ZEROTH Labs" },
      { name: "description", content: "ZEKROS is a real-time strategy game built on adaptive boards, vanishing pieces, and decisions that compound. A premium experience by ZEROTH Labs." },
      { property: "og:title", content: "ZEKROS — Strategy, evolved." },
      { property: "og:description", content: "A real-time strategy game built on adaptive boards and decisions that compound." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <Navigation />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Modes />
        <Stats />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
