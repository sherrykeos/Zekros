import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ShellState = {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  toggleSidebar: () => void;
  rightOpen: boolean;
  setRightOpen: (v: boolean) => void;
  toggleRight: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (v: boolean) => void;
};

const Ctx = createContext<ShellState | null>(null);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (typeof window === "undefined") return;
      if (window.innerWidth < 1280) setRightOpen(false);
      if (window.innerWidth < 1024) setSidebarCollapsed(true);
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Ctx.Provider
      value={{
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebar: () => setSidebarCollapsed((v) => !v),
        rightOpen,
        setRightOpen,
        toggleRight: () => setRightOpen((v) => !v),
        mobileNavOpen,
        setMobileNavOpen,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAppShell() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppShell must be used within AppShellProvider");
  return ctx;
}
