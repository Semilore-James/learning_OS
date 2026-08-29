/* ============================================================================
   Canvas boards — localStorage-backed. Each board is a named sheet of SVG
   elements. The Canvas window opens on a gallery of these; account-side sync to
   the Supabase `canvases` table is still a follow-up.

   Storage:  da-os-canvas-boards  ->  { boards: Record<id, Board> }
   Legacy single-sheet blob (da-os-canvas) is folded into a board on first read.
   ========================================================================== */
import type { El } from "@/components/canvas/shapes";

export interface Board {
  id: string;
  name: string;
  updatedAt: string;
  els: El[];
}

const KEY = "da-os-canvas-boards";
const LEGACY_KEY = "da-os-canvas";

type Store = { boards: Record<string, Board> };

function read(): Store {
  if (typeof window === "undefined") return { boards: {} };
  let store: Store = { boards: {} };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) store = JSON.parse(raw) as Store;
  } catch {
    /* ignore */
  }
  // one-time migration of the old single sheet
  if (Object.keys(store.boards).length === 0) {
    try {
      const legacy = localStorage.getItem(LEGACY_KEY);
      const els = legacy ? (JSON.parse(legacy) as El[]) : [];
      if (els.length) {
        const id = crypto.randomUUID();
        store.boards[id] = { id, name: "Canvas 1", updatedAt: new Date().toISOString(), els };
        write(store);
        localStorage.removeItem(LEGACY_KEY);
      }
    } catch {
      /* ignore */
    }
  }
  return store;
}

function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* quota / private mode */
  }
}

/** boards, newest-touched first */
export function listBoards(): Board[] {
  return Object.values(read().boards).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getBoard(id: string): Board | null {
  return read().boards[id] ?? null;
}

export function createBoard(name?: string): Board {
  const store = read();
  const n = Object.keys(store.boards).length + 1;
  const board: Board = {
    id: crypto.randomUUID(),
    name: name?.trim() || `Canvas ${n}`,
    updatedAt: new Date().toISOString(),
    els: [],
  };
  store.boards[board.id] = board;
  write(store);
  return board;
}

export function saveBoard(id: string, els: El[]) {
  const store = read();
  const b = store.boards[id];
  if (!b) return;
  b.els = els;
  b.updatedAt = new Date().toISOString();
  write(store);
}

export function renameBoard(id: string, name: string) {
  const store = read();
  const b = store.boards[id];
  if (!b) return;
  b.name = name.trim() || b.name;
  b.updatedAt = new Date().toISOString();
  write(store);
}

export function deleteBoard(id: string) {
  const store = read();
  delete store.boards[id];
  write(store);
}
