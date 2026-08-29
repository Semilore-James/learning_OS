/* ============================================================================
   PM-AI memory (migration 0007, table pm_ai_memory).

   Two layers, different owners:
   - facts   : structured jsonb. Written ONLY by the functions here, which are
               called by route code that already knows the fact for certain
               (it just gave this pointer / named this gap / used this quote).
               No model ever writes facts. Every array is capped.
   - notesMd : freeform hyperdense markdown. Rewritten by a cheap fast model
               (llama-3.1-8b-instant) after an exchange, char-capped,
               last-write-wins. Shown to the learner read-only.

   Only `openQuestion`, `unresolved`, and `notesMd` are injected into the main
   prompt. `pointersGiven` / `greetingsUsed` are server-side dedup plumbing.
   ========================================================================== */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { serverEnv } from "@/lib/env.server";
import { EMPTY_FACTS, type PmFacts, type PmMemory } from "./types";

type DB = SupabaseClient<Database>;

const NOTES_MAX_CHARS = 5000; // ~1200 tokens
const UNRESOLVED_MAX = 6;
const POINTERS_MAX = 12;
const GREETINGS_MAX = 30;

const BASE_URL = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
const NOTES_MODEL = process.env.GROQ_NOTES_MODEL ?? "llama-3.1-8b-instant";

/* ------------------------------------------------------------------ read --- */

export async function readMemory(sb: DB, userId: string): Promise<PmMemory> {
  const { data } = await sb
    .from("pm_ai_memory")
    .select("facts, notes_md")
    .eq("user_id", userId)
    .maybeSingle();
  return {
    facts: mergeFacts(data?.facts as Partial<PmFacts> | null),
    notesMd: (data?.notes_md as string | null) ?? "",
  };
}

function mergeFacts(raw: Partial<PmFacts> | null): PmFacts {
  return {
    openQuestion: raw?.openQuestion ?? null,
    unresolved: Array.isArray(raw?.unresolved) ? raw!.unresolved.slice(0, UNRESOLVED_MAX) : [],
    pointersGiven: Array.isArray(raw?.pointersGiven)
      ? raw!.pointersGiven.slice(-POINTERS_MAX)
      : [],
    greetingsUsed: Array.isArray(raw?.greetingsUsed)
      ? raw!.greetingsUsed.slice(-GREETINGS_MAX)
      : [],
  };
}

/* --------------------------------------------------------------- inject --- */

/** the MEMORY block text for the main prompt. Deliberately omits pointers /
 *  greetings — those are plumbing, not something the PM should read aloud. */
export function injectMemory(mem: PmMemory): string {
  const lines: string[] = [];
  if (mem.facts.openQuestion) lines.push(`Open thread: ${mem.facts.openQuestion}`);
  if (mem.facts.unresolved.length) {
    lines.push("Unresolved gaps you have named (do not re-explain, hold them to it):");
    for (const u of mem.facts.unresolved) {
      lines.push(
        `  - ${u.gap}${u.caseId ? ` (${u.caseId})` : ""}${u.timesRaised > 1 ? ` [raised ${u.timesRaised}x]` : ""}`,
      );
    }
  }
  if (mem.notesMd.trim()) {
    lines.push("Your notes on this learner:");
    lines.push(mem.notesMd.trim());
  }
  return lines.join("\n");
}

/* ---------------------------------------------------------------- facts --- */

async function writeFacts(sb: DB, userId: string, facts: PmFacts): Promise<void> {
  await sb
    .from("pm_ai_memory")
    .upsert(
      { user_id: userId, facts: facts as unknown as Database["public"]["Tables"]["pm_ai_memory"]["Row"]["facts"], updated_at: new Date().toISOString() },
      { onConflict: "user_id" },
    );
}

/** the PM just recommended an in-app resource; remember it so it does not
 *  repeat the same pointer next time. */
export async function recordPointer(sb: DB, userId: string, resource: string): Promise<void> {
  const mem = await readMemory(sb, userId);
  const f = mem.facts;
  if (f.pointersGiven.some((p) => p.resource === resource)) return;
  f.pointersGiven = [...f.pointersGiven, { resource, at: new Date().toISOString() }].slice(
    -POINTERS_MAX,
  );
  await writeFacts(sb, userId, f);
}

/** the PM just named a gap on a review; track it until it is resolved. */
export async function noteUnresolved(
  sb: DB,
  userId: string,
  gap: string,
  caseId: string | null,
): Promise<void> {
  const mem = await readMemory(sb, userId);
  const f = mem.facts;
  const existing = f.unresolved.find((u) => u.caseId === caseId);
  if (existing) {
    existing.gap = gap;
    existing.timesRaised += 1;
  } else {
    f.unresolved = [
      { gap, caseId, firstSeen: new Date().toISOString(), timesRaised: 1 },
      ...f.unresolved,
    ].slice(0, UNRESOLVED_MAX);
  }
  f.openQuestion = gap;
  await writeFacts(sb, userId, f);
}

/** a case came back accepted (or its gap changed materially); clear it. */
export async function resolveForCase(sb: DB, userId: string, caseId: string): Promise<void> {
  const mem = await readMemory(sb, userId);
  const f = mem.facts;
  const before = f.unresolved.length;
  f.unresolved = f.unresolved.filter((u) => u.caseId !== caseId);
  if (f.unresolved.length === before) return;
  await writeFacts(sb, userId, f);
}

/** returns a quote id not yet shown to this learner, and records it. null when
 *  the pool is exhausted (caller loops the oldest). */
export async function nextGreeting(
  sb: DB,
  userId: string,
  poolIds: string[],
): Promise<string | null> {
  const mem = await readMemory(sb, userId);
  const f = mem.facts;
  const fresh = poolIds.find((id) => !f.greetingsUsed.includes(id));
  if (!fresh) return null;
  f.greetingsUsed = [...f.greetingsUsed, fresh].slice(-GREETINGS_MAX);
  await writeFacts(sb, userId, f);
  return fresh;
}

/* --------------------------------------------------------------- notes --- */

const NOTES_SYSTEM = `You maintain a data analyst mentor's private notes on one learner. Rewrite the notes given the latest exchange.

Rules:
- Keep it under ${NOTES_MAX_CHARS} characters. Hyperdense. Fragments, not sentences.
- Preserve anything still true. Drop anything the exchange contradicts or makes stale.
- Track: how they think, how they communicate findings, recurring strengths, recurring mistakes, what motivates or frustrates them.
- Do NOT track: transcript, greetings, which chapter you pointed at (that is handled elsewhere).
- No preamble. Output only the notes markdown.`;

/**
 * Fire-and-forget: rewrite notesMd from the latest exchange. Never throws
 * (a failed refresh just leaves the old notes). Call without awaiting.
 */
export async function refreshNotes(
  sb: DB,
  userId: string,
  exchange: { learner: string; pm: string },
  currentNotes: string,
): Promise<void> {
  if (!serverEnv.groqApiKey) return;
  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serverEnv.groqApiKey}`,
      },
      body: JSON.stringify({
        model: NOTES_MODEL,
        temperature: 0.2,
        max_tokens: 700,
        messages: [
          { role: "system", content: NOTES_SYSTEM },
          {
            role: "user",
            content: `CURRENT NOTES:\n${currentNotes || "(none yet)"}\n\nLATEST EXCHANGE:\nLearner: ${exchange.learner}\nPM: ${exchange.pm}`,
          },
        ],
      }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const next = data.choices?.[0]?.message?.content?.trim();
    if (!next) return;
    await sb.from("pm_ai_memory").upsert(
      {
        user_id: userId,
        notes_md: next.slice(0, NOTES_MAX_CHARS),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  } catch {
    // notes refresh is best-effort
  }
}

export { EMPTY_FACTS };
