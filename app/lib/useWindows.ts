"use client";

/* ============================================================================
   Window manager. Open / close / focus / minimise / maximise / resize, z-stack,
   and pointer drag by the title bar. Windows spawn centred with a small
   deterministic stagger, are clamped so the title bar can never leave the
   screen, and can be resized from any edge or corner.
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from "react";

export type ResizeEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

export interface Size {
  width: number;
  height: number;
}

export interface WindowManager {
  open: string[];
  stack: string[];
  minimized: string[];
  isOpen: (id: string) => boolean;
  isMinimized: (id: string) => boolean;
  isMaximized: (id: string) => boolean;
  zOf: (id: string) => number;
  posOf: (id: string) => { x: number; y: number } | undefined;
  sizeOf: (id: string) => Size | undefined;
  reportNatural: (id: string, size: Size) => void;
  openWindow: (id: string, size?: Size) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  startDrag: (id: string, e: React.PointerEvent) => void;
  startResize: (id: string, edge: ResizeEdge, e: React.PointerEvent) => void;
}

const Z_BASE = 10;
const TASKBAR = 44;
const MIN_W = 320;
const MIN_H = 220;
const KEEP_VISIBLE = 140; // px of the window that must stay on screen horizontally
// cap simultaneously-open windows: each mounts a heavy body, and a dozen at
// once melts the page. Opening past the cap evicts the least-recently-focused.
const MAX_OPEN = 6;

function vw() {
  return typeof window !== "undefined" ? window.innerWidth : 1440;
}
function vh() {
  return typeof window !== "undefined" ? window.innerHeight : 900;
}

export function useWindows(): WindowManager {
  const [open, setOpen] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [minimized, setMinimized] = useState<string[]>([]);
  const [maximized, setMaximized] = useState<string[]>([]);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const [size, setSize] = useState<Record<string, Size>>({});
  const [natural, setNatural] = useState<Record<string, Size>>({});
  const openCount = useRef(0);

  // latest open/stack for openWindow's eviction check without re-creating the cb
  const openRef = useRef<string[]>([]);
  const stackRef = useRef<string[]>([]);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    stackRef.current = stack;
  }, [stack]);

  const fitViewport = useCallback(
    (s: Size): Size => ({
      width: Math.min(s.width, vw() - 24),
      height: Math.min(s.height, vh() - TASKBAR - 24),
    }),
    [],
  );

  const reportNatural = useCallback((id: string, s: Size) => {
    setNatural((n) => {
      const prev = n[id];
      if (prev && Math.abs(prev.width - s.width) < 6 && Math.abs(prev.height - s.height) < 6) return n;
      return { ...n, [id]: s };
    });
  }, []);

  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const resize = useRef<{
    id: string;
    edge: ResizeEdge;
    x0: number;
    y0: number;
    w0: number;
    h0: number;
    px: number;
    py: number;
  } | null>(null);

  const clampPos = useCallback((x: number, y: number, w: number) => {
    return {
      x: Math.min(vw() - KEEP_VISIBLE, Math.max(KEEP_VISIBLE - w, x)),
      y: Math.min(vh() - TASKBAR - 20, Math.max(0, y)),
    };
  }, []);

  const focusWindow = useCallback((id: string) => {
    setStack((s) => [...s.filter((w) => w !== id), id]);
  }, []);

  const openWindow = useCallback(
    (id: string, s?: Size) => {
      // at the cap, evict the least-recently-focused other window
      let evict: string | null = null;
      if (!openRef.current.includes(id) && openRef.current.length >= MAX_OPEN) {
        evict =
          stackRef.current.find((w) => w !== id && openRef.current.includes(w)) ??
          openRef.current.find((w) => w !== id) ??
          null;
      }
      setMinimized((m) => m.filter((w) => w !== id && w !== evict));
      setMaximized((m) => m.filter((w) => w !== evict));
      setOpen((o) => {
        const base = evict ? o.filter((w) => w !== evict) : o;
        return base.includes(id) ? base : [...base, id];
      });
      setStack((st) => {
        const base = evict ? st.filter((w) => w !== evict) : st;
        return [...base.filter((w) => w !== id), id];
      });
      setSize((sz) => (sz[id] || !s ? sz : { ...sz, [id]: s }));
      setPos((p) => {
        if (p[id]) return p;
        const n = openCount.current++;
        const w = s?.width ?? 640;
        const h = s?.height ?? 520;
        const stagger = (n % 5) * 26;
        return {
          ...p,
          [id]: {
            x: Math.max(12, Math.round((vw() - w) / 2) + stagger - 52),
            y: Math.max(12, Math.round((vh() - TASKBAR - h) / 2) + stagger - 40),
          },
        };
      });
    },
    [],
  );

  const closeWindow = useCallback((id: string) => {
    setOpen((o) => o.filter((w) => w !== id));
    setStack((s) => s.filter((w) => w !== id));
    setMinimized((m) => m.filter((w) => w !== id));
    setMaximized((m) => m.filter((w) => w !== id));
  }, []);

  const toggleMinimize = useCallback((id: string) => {
    setMinimized((m) => (m.includes(id) ? m.filter((w) => w !== id) : [...m, id]));
  }, []);

  const toggleMaximize = useCallback(
    (id: string) => {
      setMaximized((m) => (m.includes(id) ? m.filter((w) => w !== id) : [...m, id]));
      focusWindow(id);
    },
    [focusWindow],
  );

  const startDrag = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (maximized.includes(id)) return;
      e.preventDefault();
      focusWindow(id);
      const cur = pos[id] ?? { x: 0, y: 0 };
      drag.current = { id, dx: e.clientX - cur.x, dy: e.clientY - cur.y };
      document.body.style.userSelect = "none";
    },
    [focusWindow, pos, maximized],
  );

  const startResize = useCallback(
    (id: string, edge: ResizeEdge, e: React.PointerEvent) => {
      if (maximized.includes(id)) return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(id);
      const p = pos[id] ?? { x: 0, y: 0 };
      const s = size[id] ?? { width: 640, height: 520 };
      resize.current = {
        id,
        edge,
        x0: p.x,
        y0: p.y,
        w0: s.width,
        h0: s.height,
        px: e.clientX,
        py: e.clientY,
      };
      document.body.style.userSelect = "none";
    },
    [focusWindow, pos, size, maximized],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (d) {
        const w = size[d.id]?.width ?? 640;
        setPos((p) => ({ ...p, [d.id]: clampPos(e.clientX - d.dx, e.clientY - d.dy, w) }));
        return;
      }
      const r = resize.current;
      if (r) {
        const ddx = e.clientX - r.px;
        const ddy = e.clientY - r.py;
        // can't shrink below what the content needs (capped at viewport)
        const nat = natural[r.id];
        const minW = Math.max(MIN_W, Math.min(nat?.width ?? 0, vw() - 40));
        const minH = Math.max(MIN_H, Math.min(nat?.height ?? 0, vh() - TASKBAR - 40));
        let { x0: x, y0: y, w0: w, h0: h } = r;
        if (r.edge.includes("e")) w = Math.max(minW, r.w0 + ddx);
        if (r.edge.includes("s")) h = Math.max(minH, r.h0 + ddy);
        if (r.edge.includes("w")) {
          w = Math.max(minW, r.w0 - ddx);
          x = r.x0 + (r.w0 - w);
        }
        if (r.edge.includes("n")) {
          h = Math.max(minH, r.h0 - ddy);
          y = Math.max(0, r.y0 + (r.h0 - h));
        }
        setSize((sz) => ({ ...sz, [r.id]: { width: w, height: h } }));
        setPos((p) => ({ ...p, [r.id]: { x, y } }));
      }
    };
    const up = () => {
      drag.current = null;
      resize.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [size, natural, clampPos]);

  return {
    open,
    stack,
    minimized,
    isOpen: (id) => open.includes(id),
    isMinimized: (id) => minimized.includes(id),
    isMaximized: (id) => maximized.includes(id),
    zOf: (id) => Z_BASE + Math.max(0, stack.indexOf(id)),
    posOf: (id) => pos[id],
    // user-set size wins; otherwise fit the measured content to the viewport
    sizeOf: (id) => size[id] ?? (natural[id] ? fitViewport(natural[id]) : undefined),
    reportNatural,
    openWindow,
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    startDrag,
    startResize,
  };
}
