/* ============================================================================
   Per-user rate limit for the PM-AI routes, backed by the pm_ai_usage table
   (migration 0007). One row per call; enforcement counts rows in a rolling
   window; the same count feeds the "PM's attention" bar in the composer.

   Fails CLOSED: if the count query errors, deny. Better to make the learner
   wait a minute than to let a bug drain the Groq quota for everyone.

   Guests (no account) are handled by the route, not here: they never reach a
   Supabase-authenticated path, so they get the chat-only guest caps enforced
   in-route against a localStorage id. This module is the account path.
   ========================================================================== */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

type DB = SupabaseClient<Database>;

export type UsageKind = "chat" | "review" | "chat_image";

/** Caps are deliberately tight pre-revenue. Loosen the hour caps 2-3x once
 *  there are paying customers. One edit, here. */
const CAPS = {
  chat: { hour: 10, day: 40 },
  review: { hour: 5, day: 15 },
} as const;

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

export interface UsageResult {
  ok: boolean;
  /** calls left in the hour window for this kind's cap group */
  remainingHour: number;
  /** seconds until the hour window frees up (0 when ok) */
  resetInSec: number;
}

/** which cap group a kind counts against */
function group(kind: UsageKind): "chat" | "review" {
  return kind === "review" ? "review" : "chat";
}

/**
 * Check the caps and, if under, record the call. Returns what the composer
 * needs to draw the bar. `weight` lets an image message cost more than 1.
 */
export async function checkAndRecord(
  sb: DB,
  userId: string,
  kind: UsageKind,
  weight = 1,
): Promise<UsageResult> {
  const g = group(kind);
  const cap = CAPS[g];
  const now = Date.now();
  const dayAgo = new Date(now - DAY_MS).toISOString();

  // one query for the whole day window, bucket the hour slice in JS
  const { data, error } = await sb
    .from("pm_ai_usage")
    .select("weight, created_at, kind")
    .eq("user_id", userId)
    .gte("created_at", dayAgo)
    .order("created_at", { ascending: false });

  if (error) {
    return { ok: false, remainingHour: 0, resetInSec: 60 };
  }

  const rows = (data ?? []).filter((r) =>
    g === "review" ? r.kind === "review" : r.kind !== "review",
  );
  const hourCutoff = now - HOUR_MS;
  let usedHour = 0;
  let usedDay = 0;
  let oldestInHour = now;
  for (const r of rows) {
    const t = Date.parse(r.created_at);
    usedDay += r.weight;
    if (t >= hourCutoff) {
      usedHour += r.weight;
      if (t < oldestInHour) oldestInHour = t;
    }
  }

  const overHour = usedHour + weight > cap.hour;
  const overDay = usedDay + weight > cap.day;
  if (overHour || overDay) {
    const resetInSec = overHour
      ? Math.max(1, Math.ceil((oldestInHour + HOUR_MS - now) / 1000))
      : Math.max(1, Math.ceil((now + DAY_MS - now) / 1000)); // day cap: just say "come back tomorrow"-ish
    return { ok: false, remainingHour: Math.max(0, cap.hour - usedHour), resetInSec };
  }

  const { error: insErr } = await sb
    .from("pm_ai_usage")
    .insert({ user_id: userId, kind, weight });
  if (insErr) {
    // recorded nothing; treat as a soft allow (the check already passed) but
    // do not crash the request
    return { ok: true, remainingHour: Math.max(0, cap.hour - usedHour - weight), resetInSec: 0 };
  }

  return {
    ok: true,
    remainingHour: Math.max(0, cap.hour - usedHour - weight),
    resetInSec: 0,
  };
}

/** Read-only: how many calls the learner has left this hour, for painting the
 *  bar on window open without making a call. */
export async function usageSnapshot(
  sb: DB,
  userId: string,
): Promise<{ chatLeft: number; reviewLeft: number }> {
  const hourAgo = new Date(Date.now() - HOUR_MS).toISOString();
  const { data, error } = await sb
    .from("pm_ai_usage")
    .select("weight, kind")
    .eq("user_id", userId)
    .gte("created_at", hourAgo);
  if (error) return { chatLeft: 0, reviewLeft: 0 };
  let chat = 0;
  let review = 0;
  for (const r of data ?? []) {
    if (r.kind === "review") review += r.weight;
    else chat += r.weight;
  }
  return {
    chatLeft: Math.max(0, CAPS.chat.hour - chat),
    reviewLeft: Math.max(0, CAPS.review.hour - review),
  };
}
