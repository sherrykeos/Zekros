import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getApiBaseUrl } from "@/services/client";

export type BackendWarmupStatus = "idle" | "warming" | "ready" | "error";

export type BackendWarmupState = {
  status: BackendWarmupStatus;
  isReady: boolean;
  isWarming: boolean;
  responseTimeMs: number | null;
  retryCount: number;
  bannerVisible: boolean;
  checkBackend: () => Promise<boolean>;
  dismissBanner: () => void;
};

export type BackendWarmupProviderProps = {
  children: ReactNode;
  /** Optional custom health check endpoint URL. Defaults to `${getApiBaseUrl()}/health`. */
  healthEndpoint?: string;
  /** Timeout in milliseconds (default: 65000ms for Render free-tier cold boot). */
  timeoutMs?: number;
  /** Auto-hide success badge delay in ms (default: 4000ms). Set 0 to keep open. */
  autoHideMs?: number;
  /** Show banner only if cold start response takes longer than this delay in ms (default: 1500ms). */
  showBannerDelayMs?: number;
};

const WarmupContext = createContext<BackendWarmupState | null>(null);

/**
 * Smart Warmup Provider for handling Render/Railway/Fly.io free tier cold-starts.
 * Sends a non-blocking health check ping on mount.
 * If server is ALREADY warm (<1.5s), stays 100% silent!
 * If server is sleeping (>1.5s), displays friendly wake-up banner!
 */
export function BackendWarmupProvider({
  children,
  healthEndpoint,
  timeoutMs = 65000,
  autoHideMs = 4000,
  showBannerDelayMs = 1500,
}: BackendWarmupProviderProps) {
  const [status, setStatus] = useState<BackendWarmupStatus>("idle");
  const [responseTimeMs, setResponseTimeMs] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [bannerVisible, setBannerVisible] = useState(false);

  const activeCheckRef = useRef<boolean>(false);

  const runCheck = useCallback(async (): Promise<boolean> => {
    if (activeCheckRef.current) return false;
    activeCheckRef.current = true;

    setStatus("warming");

    // Only show banner if request takes longer than showBannerDelayMs (1.5s)
    const showBannerTimer = setTimeout(() => {
      setBannerVisible(true);
    }, showBannerDelayMs);

    const startTime = performance.now();
    const baseUrl = getApiBaseUrl().replace(/\/$/, "");
    const targetUrl = healthEndpoint || `${baseUrl}/health`;

    console.log("⚡ [Backend Warmup Tool] Initiating health check ping to:", targetUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      clearTimeout(showBannerTimer); // Cancel banner popup if server answered quickly!

      if (response.ok) {
        const elapsed = Math.round(performance.now() - startTime);
        console.log(`🟢 [Backend Warmup Tool] Server ready! Response time: ${elapsed}ms`);
        setResponseTimeMs(elapsed);
        setStatus("ready");
        activeCheckRef.current = false;

        // If banner was triggered (due to slow response / cold start), keep it visible briefly to show success
        if (elapsed > showBannerDelayMs) {
          setBannerVisible(true);
          if (autoHideMs > 0) {
            setTimeout(() => setBannerVisible(false), autoHideMs);
          }
        } else {
          // Fast response (<1.5s): keep completely silent!
          setBannerVisible(false);
        }
        return true;
      } else {
        throw new Error(`HTTP status ${response.status}`);
      }
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      clearTimeout(showBannerTimer);
      console.warn("⚠️ [Backend Warmup Tool] Health check ping failed:", err);
      activeCheckRef.current = false;
      setStatus("error");
      setBannerVisible(true);
      setRetryCount((prev) => prev + 1);
      return false;
    }
  }, [healthEndpoint, timeoutMs, autoHideMs, showBannerDelayMs]);

  useEffect(() => {
    runCheck();
  }, []);

  const dismissBanner = useCallback(() => {
    setBannerVisible(false);
  }, []);

  return (
    <WarmupContext.Provider
      value={{
        status,
        isReady: status === "ready",
        isWarming: status === "warming",
        responseTimeMs,
        retryCount,
        bannerVisible,
        checkBackend: runCheck,
        dismissBanner,
      }}
    >
      {children}
    </WarmupContext.Provider>
  );
}

export function useBackendWarmup() {
  const context = useContext(WarmupContext);
  if (!context) {
    throw new Error(
      "useBackendWarmup must be used within a BackendWarmupProvider",
    );
  }
  return context;
}
