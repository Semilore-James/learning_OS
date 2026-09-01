"use client";

/* ============================================================================
   Window manager. Open / close / focus / minimise / maximise / resize, z-stack,
   and pointer drag by the title bar.

   Fit-to-screen: a window can never open larger than the viewport, all open
   windows re-clamp when the viewport changes (rotate / resize / mobile
   keyboard), and below MOBILE_BP every window renders maximised (a phone-app
   stack) so there are no unreachable off-screen windows on a small device.
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
  /** true on small screens: every window renders maximised, no drag/resize */
  compact: boolean;
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
const MARGIN = 24; // gap kept between a fitted window and the viewport edge
const KEEP_VISIBLE = 140; // px of a window that must stay on screen horizontally
const MOBILE_BP = 900; // at or below this width, windows are a maximised stack
                       // (phones + tablets in portrait); laptops/desktops float
// cap simultaneously-open windows: each mounts a heavy body, and a dozen at
// once melts the page. Opening past the cap evicts the least-recently-focused.
const MAX_OPEN = 6;

function initialViewport() {
  if (typeof window === "undefined") return { w: 1440, h: 900 };
  return { w: window.innerWidth, h: window.innerHeight };
}

export function useWindows(): WindowManager {
  const [open, setOpen] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [minimized, setMinimized] = useState<string[]>([]);
  const [maximized, setMaximized] = useState<string[]>([]);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const [size, setSize] = useState<Record<string, Size>>({});
  const [natural, setNatural] = useState<Record<string, Size>>({});
  const [vp, setVp] = useState(initialViewport);
  const openCount = useRef(0);

  const compact = vp.w <= MOBILE_BP;

  // the largest a window may be right now, and how to squeeze one into that
  const maxW = Math.max(MIN_W, vp.w - MARGIN);
  const maxH = Math.max(MIN_H, vp.h - TASKBAR - MARGIN);
  const fit = useCallback(
    (s: Size): Size => ({
      width: Math.min(s.width, Math.max(MIN_W, vp.w - MARGIN)),
      height: Math.min(s.height, Math.max(MIN_H, vp.h - TASKBAR - MARGIN)),
    }),
    [vp.w, vp.h],
  );

  const clampPos = useCallback(
    (x: number, y: number, w: number) => ({
      x: Math.min(vp.w - KEEP_VISIBLE, Math.max(KEEP_VISIBLE - w, x)),
      y: Math.min(vp.h - TASKBAR - 20, Math.max(0, y)),
    }),
    [vp.w, vp.h],
  );

  // latest open/stack/size for callbacks that must not be recreated on change
  const openRef = useRef<string[]>([]);
  const stackRef = useRef<string[]>([]);
  const sizeRef = useRef<Record<string, Size>>({});
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  useEffect(() => {
    stackRef.current = stack;
  }, [stack]);
  useEffect(() => {
    sizeRef.current = size;
  }, [size]);

  // track the viewport and re-fit every window when it changes
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setVp({ w, h });
      const capW = Math.max(MIN_W, w - MARGIN);
      const capH = Math.max(MIN_H, h - TASKBAR - MARGIN);
      setSize((sz) => {
        let changed = false;
        const next: Record<string, Size> = {};
        for (const [id, s] of Object.entries(sz)) {
          const nw = Math.min(s.width, capW);
          const nh = Math.min(s.height, capH);
          if (nw !== s.width || nh !== s.height) changed = true;
          next[id] = { width: nw, height: nh };
        }
        return changed ? next : sz;
      });
      setPos((p) => {
        let changed = false;
        const next: Record<string, { x: number; y: number }> = {};
        for (const [id, pt] of Object.entries(p)) {
          const wd = Math.min(sizeRef.current[id]?.width ?? 640, capW);
          const nx = Math.min(w - KEEP_VISIBLE, Math.max(KEEP_VISIBLE - wd, pt.x));
          const ny = Math.min(h - TASKBAR - 20, Math.max(0, pt.y));
          if (nx !== pt.x || ny !== pt.y) changed = true;
          next[id] = { x: nx, y: ny };
        }
        return changed ? next : p;
      });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const focusWindow = useCallback((id: string) => {
    setStack((s) => [...s.filter((w) => w !== id), id]);
  }, []);

  const openWindow = useCallback(
    (id: string, s?: Size) => {
      // never spawn bigger than the screen
      const req = s ?? { width: 640, height: 520 };
      const fitted: Size = {
        width: Math.min(req.width, maxW),
        height: Math.min(req.height, maxH),
      };

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
      setStack((st) => [...st.filter((w) => w !== id && w !== evict), id]);
      setSize((sz) => (sz[id] ? sz : { ...sz, [id]: fitted }));
      setPos((p) => {
        if (p[id]) return p;
        const n = openCount.current++;
        const stagger = (n % 5) * 22;
        return {
          ...p,
          [id]: {
            x: Math.max(12, Math.round((vp.w - fitted.width) / 2) + stagger - 40),
            y: Math.max(12, Math.round((vp.h - TASKBAR - fitted.height) / 2) + stagger - 30),
          },
        };
      });
    },
    [maxW, maxH, vp.w, vp.h],
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
      if (compact || maximized.includes(id)) return;
      e.preventDefault();
      focusWindow(id);
      const cur = pos[id] ?? { x: 0, y: 0 };
      drag.current = { id, dx: e.clientX - cur.x, dy: e.clientY - cur.y };
      document.body.style.userSelect = "none";
    },
    [focusWindow, pos, maximized, compact],
  );

  const startResize = useCallback(
    (id: string, edge: ResizeEdge, e: React.PointerEvent) => {
      if (compact || maximized.includes(id)) return;
      e.preventDefault();
      e.stopPropagation();
      focusWindow(id);
      const p = pos[id] ?? { x: 0, y: 0 };
      const s = size[id] ?? { width: 640, height: 520 };
      resize.current = { id, edge, x0: p.x, y0: p.y, w0: s.width, h0: s.height, px: e.clientX, py: e.clientY };
      document.body.style.userSelect = "none";
    },
    [focusWindow, pos, size, maximized, compact],
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
        const nat = natural[r.id];
        const minW = Math.max(MIN_W, Math.min(nat?.width ?? 0, maxW));
        const minH = Math.max(MIN_H, Math.min(nat?.height ?? 0, maxH));
        let { x0: x, y0: y, w0: w, h0: h } = r;
        if (r.edge.includes("e")) w = Math.min(maxW, Math.max(minW, r.w0 + ddx));
        if (r.edge.includes("s")) h = Math.min(maxH, Math.max(minH, r.h0 + ddy));
        if (r.edge.includes("w")) {
          w = Math.min(maxW, Math.max(minW, r.w0 - ddx));
          x = r.x0 + (r.w0 - w);
        }
        if (r.edge.includes("n")) {
          h = Math.min(maxH, Math.max(minH, r.h0 - ddy));
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
  }, [size, natural, clampPos, maxW, maxH]);

  return {
    open,
    stack,
    minimized,
    compact,
    isOpen: (id) => open.includes(id),
    isMinimized: (id) => minimized.includes(id),
    isMaximized: (id) => maximized.includes(id),
    zOf: (id) => Z_BASE + Math.max(0, stack.indexOf(id)),
    posOf: (id) => pos[id],
    // user-set size wins; either way, never report bigger than the viewport
    sizeOf: (id) => {
      const s = size[id] ?? natural[id];
      return s ? fit(s) : undefined;
    },
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
