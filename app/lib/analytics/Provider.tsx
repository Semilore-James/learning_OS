"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { publicEnv } from "@/lib/env";
import { initAnalytics } from "./posthog";

/** Mount once near the root. No-op without NEXT_PUBLIC_POSTHOG_KEY. The
 *  PostHogProvider is what makes the useFeatureFlagEnabled / experiment hooks
 *  work; it is harmless when posthog was never initialised. */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);

  if (!publicEnv.posthogKey) return <>{children}</>;
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>;
}
