/* ============================================================================
   localStorage adapter — the guest backing store. Dumps the whole state blob
   on every commit (small, and simplest). On sign-up, migrateGuest.ts reads
   this same blob and copies it into Supabase.
   ========================================================================== */
import type { AppState, StoreAdapter } from "../types";
import { TRANSIENT_KEYS } from "../types";

export const GUEST_KEY = "da-os-state";

function strip(state: AppState): Partial<AppState> {
  const out: Record<string, unknown> = { ...state };
  for (const k of TRANSIENT_KEYS) delete out[k];
  return out as Partial<AppState>;
}

export function localAdapter(): StoreAdapter {
  return {
    async loadState() {
      if (typeof window === "undefined") return {};
      try {
        const raw = window.localStorage.getItem(GUEST_KEY);
        return raw ? (JSON.parse(raw) as Partial<AppState>) : {};
      } catch {
        return {};
      }
    },
    async commit(_action, next) {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(GUEST_KEY, JSON.stringify(strip(next)));
      } catch {
        // quota / private mode — the in-memory state is still correct
      }
    },
  };
}

export function readGuestBlob(): Partial<AppState> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    return raw ? (JSON.parse(raw) as Partial<AppState>) : null;
  } catch {
    return null;
  }
}

export function clearGuestBlob() {
  try {
    window.localStorage.removeItem(GUEST_KEY);
  } catch {
    /* ignore */
  }
}
