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
import { InteractiveGridBackground } from "@/components/ui/interactive-grid-background";

import { APP_CONSTANTS, getPageTitle } from "@/constants/appConstants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ZEKROS :)" },
      {
        name: "description",
        content: `${APP_CONSTANTS.app.description.short} A premium experience by ${APP_CONSTANTS.company.name}.`,
      },
      { property: "og:title", content: getPageTitle() },
      {
        property: "og:description",
        content: APP_CONSTANTS.app.description.short,
      },
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
        <div className="relative isolate">
          {/* Interactive Blueprint Grid with Cursor Glow & Subtle Magnification */}
          <InteractiveGridBackground
            opacity={0.05} // Base grid opacity (0.0 to 1.0)
            hoverOpacity={0.2} // Spotlight glow brightness on hover (0.0 to 1.0)
            hoverRadius={160} // Spotlight radius in pixels (default: 260px)
            hoverScale={1.05} // Magnification zoom under cursor (1.05 = 5% scaleup)
            hoverColorLight="#FFFDD0" // Glowing line color in Light mode
            hoverColorDark="#FFFDD0" // Glowing line color in Dark mode (e.g. #38bdf8 cyan, #818cf8 indigo, #34d399 emerald)
            gridSize={40} // Grid cell size in px (default: 48px / 3rem)
          />
          <div className="relative z-10">
            <Features />
            <HowItWorks />
            <Modes />
            <Stats />
            <FAQ />
            <CTA />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
