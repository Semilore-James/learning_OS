"use client";

/* ============================================================================
   Last-resort error boundary. Only fires when the root layout itself throws
   (rare) — it has to render its own <html>/<body>. Everything else is caught
   by app/error.tsx.
   ========================================================================== */
import { useEffect } from "react";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    import("posthog-js")
      .then((m) => m.default?.captureException?.(error))
      .catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#080b14",
          color: "#e6e9ef",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ maxWidth: 360, textAlign: "center", padding: 24 }}>
          <div style={{ fontFamily: "monospace", fontWeight: 700, color: "#5b8cff" }}>
            DA // LEARNING OS
          </div>
          <p style={{ marginTop: 12, fontSize: 14, opacity: 0.7 }}>
            Something broke while loading. A reload usually clears it.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              marginTop: 20,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 6,
              border: "none",
              background: "#5b8cff",
              color: "#0b1020",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
