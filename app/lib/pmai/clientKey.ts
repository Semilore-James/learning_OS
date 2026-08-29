/* ============================================================================
   A stable per-browser id sent with PM-AI requests so the guest rate limiter
   can key on a real identity instead of lumping every guest into one "anon"
   bucket. Accounts are keyed server-side by user id and ignore this.
   ========================================================================== */
const KEY = "da-os-pmai-key";

export function pmClientKey(): string {
  if (typeof window === "undefined") return "anon";
  try {
    let k = window.localStorage.getItem(KEY);
    if (!k) {
      k = crypto.randomUUID();
      window.localStorage.setItem(KEY, k);
    }
    return k;
  } catch {
    return "anon";
  }
}
