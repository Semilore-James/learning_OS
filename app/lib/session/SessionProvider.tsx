"use client";

/* ============================================================================
   Session — tracks the Supabase auth state, exposes the current user, and
   decides which store adapter is live: localStorage for guests, Supabase for
   accounts. On sign-up it migrates the guest's localStorage progress into the
   new account (Userflow Flow 1).
   ========================================================================== */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { publicEnv } from "@/lib/env";
import { identify, resetIdentity } from "@/lib/analytics";
import { supabaseAdapter, migrateGuestToAccount, type StoreAdapter } from "@/lib/store";

const GUEST_KEY = "da-os-guest";

type Phase = "loading" | "signed-out" | "guest" | "account";

interface SessionValue {
  phase: Phase;
  user: User | null;
  /** the store adapter to hand StoreProvider (undefined = guest / localStorage) */
  adapter: StoreAdapter | undefined;
  continueAsGuest: () => void;
  /** leave guest mode to reach the auth screen (progress stays in localStorage) */
  exitGuest: () => void;
  signOut: () => Promise<void>;
  /** call after a successful sign-up so guest progress isn't lost */
  onSignedUp: () => Promise<void>;
  configured: boolean;
}

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const configured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);
  const supabase = useMemo(() => (configured ? createClient() : null), [configured]);

  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!configured);
  const [guest, setGuest] = useState<boolean>(() => {
    try {
      return typeof window !== "undefined" && sessionStorage.getItem(GUEST_KEY) === "1";
    } catch {
      return false;
    }
  });

  // false on the server AND the first client render, true after mount — gates
  // `phase` to "loading" so SSR and first hydration always agree
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
      if (data.session?.user) void identify(data.session.user.id);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) void identify(s.user.id);
      else resetIdentity();
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const continueAsGuest = useCallback(() => {
    try {
      sessionStorage.setItem(GUEST_KEY, "1");
    } catch {
      /* ignore */
    }
    setGuest(true);
  }, []);

  const exitGuest = useCallback(() => {
    try {
      sessionStorage.removeItem(GUEST_KEY);
    } catch {
      /* ignore */
    }
    setGuest(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    try {
      sessionStorage.removeItem(GUEST_KEY);
    } catch {
      /* ignore */
    }
    setGuest(false);
    setSession(null);
  }, [supabase]);

  const onSignedUp = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await migrateGuestToAccount(supabase, data.user.id).catch(() => {});
      try {
        sessionStorage.removeItem(GUEST_KEY);
      } catch {
        /* ignore */
      }
      setGuest(false);
    }
  }, [supabase]);

  const phase: Phase =
    !hydrated || !ready
      ? "loading"
      : session?.user
        ? "account"
        : guest
          ? "guest"
          : "signed-out";

  const userId = session?.user?.id ?? null;
  const adapter = useMemo<StoreAdapter | undefined>(
    () => (phase === "account" && supabase && userId ? supabaseAdapter(supabase, userId) : undefined),
    [phase, supabase, userId],
  );

  const value: SessionValue = {
    phase,
    user: session?.user ?? null,
    adapter,
    continueAsGuest,
    exitGuest,
    signOut,
    onSignedUp,
    configured,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSession must be used inside <SessionProvider>");
  return v;
}
