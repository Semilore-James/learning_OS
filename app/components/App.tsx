"use client";

/* Root client shell. SessionProvider decides: auth screen, or the desktop with
   the right store adapter (localStorage for guests, Supabase for accounts). */
import { StoreProvider } from "@/lib/store";
import { AnalyticsProvider } from "@/lib/analytics";
import { SessionProvider, useSession } from "@/lib/session/SessionProvider";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Desktop } from "@/components/desktop/Desktop";
import { CloudSync } from "@/components/CloudSync";

function Shell() {
  const { phase, adapter } = useSession();

  if (phase === "loading") {
    return <div className="fixed inset-0 bg-background" />;
  }
  if (phase === "signed-out") {
    return <AuthScreen />;
  }
  return (
    <StoreProvider adapter={adapter}>
      <CloudSync />
      <Desktop />
    </StoreProvider>
  );
}

export function App() {
  return (
    <AnalyticsProvider>
      <SessionProvider>
        <Shell />
      </SessionProvider>
    </AnalyticsProvider>
  );
}
