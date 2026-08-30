"use client";

/* ============================================================================
   Route-level error boundary. Catches render errors anywhere in the page tree
   (the whole app) and shows a recoverable screen instead of a blank page.

   The common case in production is a stale deploy: someone's tab is running
   an old bundle, a lazy-loaded chunk that no longer exists on the CDN 404s,
   and React throws a ChunkLoadError. We reload once to pull fresh HTML +
   chunks; if it happens again we stop and show the manual retry so we never
   loop.
   ========================================================================== */
import { useEffect } from "react";

const RELOAD_KEY = "da-os-chunk-reloaded";

function isStaleChunkError(error: Error): boolean {
  const s = `${error.name} ${error.message}`;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|Importing a module script failed|error loading dynamically imported module/i.test(
    s,
  );
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (isStaleChunkError(error)) {
      let already = false;
      try {
        already = sessionStorage.getItem(RELOAD_KEY) === "1";
        sessionStorage.setItem(RELOAD_KEY, "1");
      } catch {
        /* ignore */
      }
      if (!already) {
        window.location.reload();
        return;
      }
    } else {
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        /* ignore */
      }
    }

    // report if analytics is live (no-op otherwise)
    import("posthog-js")
      .then((m) => m.default?.captureException?.(error))
      .catch(() => {});
  }, [error]);

  return (
    <div className="fixed inset-0 z-[999] grid place-items-center bg-background p-6 text-foreground">
      <div className="max-w-sm text-center">
        <div className="font-mono text-sm font-bold tracking-tight text-primary">DA // LEARNING OS</div>
        <p className="mt-3 text-sm text-muted-foreground">
          Something broke while loading. A reload usually clears it.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => reset()}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-muted-foreground"
          >
            Try again
          </button>
        </div>
        {error.digest && (
          <p className="mt-4 font-mono text-[10px] text-muted-foreground/60">ref {error.digest}</p>
        )}
      </div>
    </div>
  );
}
