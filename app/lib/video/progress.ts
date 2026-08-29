/* Per-video playback position, in localStorage. Account sync is a follow-up —
   for now "continue where you left off" works within this browser. */

const KEY = "da-os-video-progress";

type Store = Record<string, number>; // videoId -> seconds

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

export function getProgress(videoId: string): number {
  return read()[videoId] ?? 0;
}

export function setProgress(videoId: string, seconds: number): void {
  if (!Number.isFinite(seconds) || seconds < 5) return;
  try {
    const s = read();
    s[videoId] = Math.floor(seconds);
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearProgress(videoId: string): void {
  try {
    const s = read();
    delete s[videoId];
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ---- cloud sync helpers ------------------------------------------------- */

export function allProgress(): Store {
  return read();
}

/** take a server value only if it's further along than what we have locally */
export function mergeProgress(videoId: string, seconds: number): void {
  const cur = getProgress(videoId);
  if (seconds > cur) setProgress(videoId, seconds);
}
