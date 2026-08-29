/* ============================================================================
   The daily greeting. Once per local calendar day the PM picks a line from
   content/quotes.ts that this learner has not seen before, and it is shown as
   a small card and dropped into the notification bell. Never repeats until the
   pool is exhausted, then it starts reusing the oldest.
   ========================================================================== */
import { QUOTES } from "@/content/quotes";

const KEY = "da-os-greeting";

interface Stored {
  day: string; // YYYY-MM-DD of the last pick
  id: string; // the quote id shown that day
  used: string[]; // quote ids already shown (FIFO once the pool wraps)
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Stored) : null;
  } catch {
    return null;
  }
}

/** today's greeting, generating and persisting it on the first call of the day */
export function pickGreeting(): { id: string; text: string } | null {
  if (typeof window === "undefined") return null;
  const prev = read();
  if (prev && prev.day === today()) {
    const q = QUOTES.find((x) => x.id === prev.id);
    return q ? { id: q.id, text: q.text } : null;
  }

  const used = prev?.used ?? [];
  const unused = QUOTES.filter((q) => !used.includes(q.id));
  const pool = unused.length > 0 ? unused : QUOTES;
  // deterministic-ish pick so a double mount on the same day is stable
  const q = pool[Math.floor((Date.parse(today()) / 86_400_000) % pool.length)];

  const nextUsed = unused.length > 0 ? [...used, q.id] : [q.id];
  try {
    localStorage.setItem(KEY, JSON.stringify({ day: today(), id: q.id, used: nextUsed } as Stored));
  } catch {
    /* ignore */
  }
  return { id: q.id, text: q.text };
}

/** read-only: today's greeting if one has been generated (for the bell) */
export function todaysGreeting(): { id: string; text: string } | null {
  const prev = read();
  if (!prev || prev.day !== today()) return null;
  const q = QUOTES.find((x) => x.id === prev.id);
  return q ? { id: q.id, text: q.text } : null;
}
