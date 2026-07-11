import { createFileRoute, Outlet } from "@tanstack/react-router";
import { motion } from "motion/react";
import { AppShellProvider } from "@/contexts/app-shell";
import { Sidebar, MobileSidebar } from "@/components/app/sidebar";
import { TopBar } from "@/components/app/topbar";
import { RightPanel } from "@/components/app/right-panel";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "ZEKROS — Console" },
      { name: "description", content: "The ZEKROS application shell. Play, analyze, and configure." },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <AppShellProvider>
      <div className="flex h-screen gap-2 bg-background p-2 text-foreground">
        <Sidebar />
        <MobileSidebar />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <TopBar />
          <motion.main
            className="glass flex-1 overflow-y-auto rounded-2xl"
          >
            <div className="p-5 sm:p-7">
              <Outlet />
            </div>
          </motion.main>
        </div>
      </div>
    </AppShellProvider>
  );
}
