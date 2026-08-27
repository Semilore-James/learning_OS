"use client";

/* ============================================================================
   The store. React context + reducer, with an adapter behind it.

   - Guests get the localStorage adapter.
   - Logged-in users get the Supabase adapter (wired in at the auth step).

   dispatch() is optimistic: the reducer runs immediately and the UI updates,
   then an effect flushes the applied action(s) to the adapter. If a commit
   fails the whole store rolls back to the last committed state and reports via
   onError.
   ========================================================================== */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { reducer } from "./reducer";
import { localAdapter } from "./adapters/local";
import { EMPTY_STATE, type Action, type AppState, type StoreAdapter } from "./types";

interface StoreValue {
  state: AppState;
  dispatch: (action: Action) => void;
  /** true while an optimistic commit is in flight */
  syncing: boolean;
  lastError: string | null;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({
  children,
  adapter,
  onError,
}: {
  children: React.ReactNode;
  /** omit for guest mode (localStorage). Pass the Supabase adapter once logged in. */
  adapter?: StoreAdapter;
  onError?: (message: string) => void;
}) {
  const active = useMemo<StoreAdapter>(() => adapter ?? localAdapter(), [adapter]);
  const mode = adapter ? "account" : "guest";
  const [state, rawDispatch] = useReducer(reducer, EMPTY_STATE);
  const [syncing, setSyncing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  /** last state the adapter has successfully persisted (rollback target) */
  const committedRef = useRef<AppState>(EMPTY_STATE);
  /** actions applied to the reducer but not yet flushed to the adapter */
  const pendingRef = useRef<Action[]>([]);

  // hydrate on adapter change (guest -> account swap)
  useEffect(() => {
    let cancelled = false;
    pendingRef.current = [];
    active
      .loadState()
      .then((loaded) => {
        if (!cancelled) rawDispatch({ type: "hydrate", state: loaded, mode });
      })
      .catch((e) => {
        if (cancelled) return;
        rawDispatch({ type: "hydrate", state: {}, mode });
        setLastError(String(e));
        onError?.(`Could not load your progress: ${e}`);
      });
    return () => {
      cancelled = true;
    };
  }, [active, mode, onError]);

  // flush pending actions to the adapter whenever state settles
  useEffect(() => {
    if (pendingRef.current.length === 0) {
      committedRef.current = state;
      return;
    }
    const actions = pendingRef.current;
    pendingRef.current = [];
    const prev = committedRef.current;
    let cancelled = false;

    setSyncing(true);
    (async () => {
      try {
        for (const a of actions) await active.commit(a, state, prev);
        if (cancelled) return;
        committedRef.current = state;
        setLastError(null);
      } catch (e) {
        if (cancelled) return;
        rawDispatch({ type: "hydrate", state: prev, mode: prev.mode });
        committedRef.current = prev;
        setLastError(String(e));
        onError?.(`That change did not save: ${e}`);
      } finally {
        if (!cancelled) setSyncing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state, active, onError]);

  const dispatch = useCallback((action: Action) => {
    rawDispatch(action);
    if (action.type !== "hydrate") pendingRef.current.push(action);
  }, []);

  const value = useMemo<StoreValue>(
    () => ({ state, dispatch, syncing, lastError }),
    [state, dispatch, syncing, lastError],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

/** convenience: just the dispatch fn */
export function useDispatch() {
  return useStore().dispatch;
}
