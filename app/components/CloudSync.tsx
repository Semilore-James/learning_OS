"use client";

/* ============================================================================
   Keeps the localStorage-backed window stores (canvas boards, video progress)
   in sync with Supabase while signed in. Pull on sign-in, push every 30s and
   when the tab loses focus. No-op for guests.
   ========================================================================== */
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { publicEnv } from "@/lib/env";
import { useSession } from "@/lib/session/SessionProvider";
import { pullBoards, pushBoards, pullVideoProgress, pushVideoProgress } from "@/lib/sync/cloud";

export function CloudSync() {
  const { phase, user } = useSession();
  const userId = user?.id ?? null;
  const configured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

  useEffect(() => {
    if (phase !== "account" || !userId || !configured) return;
    const sb = createClient();
    let alive = true;

    const push = () => {
      if (!alive) return;
      void pushBoards(sb, userId).catch(() => {});
      void pushVideoProgress(sb, userId).catch(() => {});
    };

    // pull first, then push whatever local has that's newer
    (async () => {
      await pullBoards(sb, userId).catch(() => {});
      await pullVideoProgress(sb, userId).catch(() => {});
      push();
    })();

    const timer = setInterval(push, 30_000);
    const onHide = () => {
      if (document.visibilityState === "hidden") push();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", push);

    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", push);
      push();
    };
  }, [phase, userId, configured]);

  return null;
}
