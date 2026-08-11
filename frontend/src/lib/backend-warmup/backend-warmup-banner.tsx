import { useBackendWarmup } from "./backend-warmup-context";
import { Loader2, Zap, CheckCircle2, AlertCircle, RefreshCw, X } from "lucide-react";

export function BackendWarmupBanner() {
  const {
    status,
    responseTimeMs,
    bannerVisible,
    checkBackend,
    dismissBanner,
  } = useBackendWarmup();

  if (!bannerVisible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[99999] w-full max-w-xs sm:max-w-sm rounded-xl border border-zinc-800 bg-zinc-950/95 p-3.5 shadow-2xl backdrop-blur-md text-xs font-medium text-zinc-100 transition-all duration-300">
      <div className="flex items-center gap-3">
        {status === "warming" && (
          <>
            <div className="relative flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-amber-400 animate-pulse" />
              <Loader2 className="absolute -inset-1 h-6 w-6 animate-spin text-amber-400/40" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-300">Waking up server...</p>
              <p className="text-[11px] text-zinc-400 leading-tight">
                Render cold-start in progress (~30-50s). UI is ready!
              </p>
            </div>
          </>
        )}

        {status === "ready" && (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-emerald-300">Server Warm & Ready!</p>
              {responseTimeMs !== null && (
                <p className="text-[11px] text-zinc-400">
                  Response time: {responseTimeMs}ms
                </p>
              )}
            </div>
            <button
              onClick={dismissBanner}
              className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-rose-300">Server connection delayed</p>
              <p className="text-[11px] text-zinc-400">
                Click retry to ping backend.
              </p>
            </div>
            <button
              onClick={() => checkBackend()}
              className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
            <button
              onClick={dismissBanner}
              className="text-zinc-400 hover:text-zinc-100 transition-colors p-1"
              title="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
