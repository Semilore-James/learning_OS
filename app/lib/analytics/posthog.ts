"use client";

/* ============================================================================
   PostHog wrapper. Lazy-inits on first use, and is a complete no-op when
   NEXT_PUBLIC_POSTHOG_KEY is unset (local dev, or before analytics is turned
   on) so call sites never need to guard.

   Requests go to /ingest, which next.config.ts reverse-proxies to PostHog so
   adblockers don't drop them. User identity is the hashed Supabase id, never
   the raw id or email (PRD 18.4).
   ========================================================================== */
import posthog from "posthog-js";
import { publicEnv } from "@/lib/env";
import type { EventMap, EventName } from "./events";

let started = false;

export function initAnalytics() {
  if (started || typeof window === "undefined") return;
  if (!publicEnv.posthogKey) return;
  posthog.init(publicEnv.posthogKey, {
    api_host: publicEnv.posthogHost, // "/ingest"
    capture_pageview: false, // this is an app, not a site
    autocapture: true, // capture clicks/inputs we didn't hand-instrument
    capture_exceptions: true, // unhandled errors -> PostHog error tracking
    persistence: "localStorage",
    session_recording: {
      maskAllInputs: true, // never record what people type
      maskTextSelector: "[data-ph-mask]",
    },
    // record guests too — they are the ones hitting onboarding and the
    // blank-screen reports. Free tier is 5k recordings/month; add sampling
    // via session_recording.sampleRate if that ever bites.
    disable_session_recording: false,
  });
  started = true;
}

/** stable non-reversible id from the Supabase user id */
async function hashId(userId: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(userId));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function identify(userId: string, props?: Record<string, unknown>) {
  if (!started) return;
  posthog.identify(await hashId(userId), props);
}

export function resetIdentity() {
  if (started) posthog.reset();
}

export function track<K extends EventName>(name: K, props: EventMap[K]) {
  if (!started) return;
  posthog.capture(name, props as Record<string, unknown>);
}
