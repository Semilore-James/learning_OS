"use client";

import { useEffect } from "react";
import { initAnalytics } from "./posthog";

/** Mount once near the root. No-op without NEXT_PUBLIC_POSTHOG_KEY. */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initAnalytics();
  }, []);
  return <>{children}</>;
}
