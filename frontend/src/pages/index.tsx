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

import { APP_CONSTANTS, getPageTitle } from "@/constants/appConstants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${getPageTitle()}. By ${APP_CONSTANTS.company.name}` },
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
