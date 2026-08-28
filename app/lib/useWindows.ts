"use client";

/* ============================================================================
   Window manager. Open / close / focus / minimise / maximise, z-stack, and
   pointer drag by the title bar. Windows spawn centred on the viewport with a
   small deterministic stagger so a second window does not land exactly on the
   first. Ported in spirit from docs/support.js.
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from "react";

export interface WindowManager {
  open: string[];
  stack: string[];
  minimized: string[];
  isOpen: (id: string) => boolean;
  isMinimized: (id: string) => boolean;
  isMaximized: (id: string) => boolean;
  zOf: (id: string) => number;
  posOf: (id: string) => { x: number; y: number } | undefined;
  openWindow: (id: string, size?: { width: number; height: number }) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  toggleMinimize: (id: string) => void;
  toggleMaximize: (id: string) => void;
  startDrag: (id: string, e: React.PointerEvent) => void;
}

const Z_BASE = 10;
const TASKBAR = 44;

export function useWindows(): WindowManager {
  const [open, setOpen] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [minimized, setMinimized] = useState<string[]>([]);
  const [maximized, setMaximized] = useState<string[]>([]);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const openCount = useRef(0);

  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);

  const focusWindow = useCallback((id: string) => {
    setStack((s) => [...s.filter((w) => w !== id), id]);
  }, []);

  const openWindow = useCallback(
    (id: string, size?: { width: number; height: number }) => {
      setMinimized((m) => m.filter((w) => w !== id));
      setOpen((o) => (o.includes(id) ? o : [...o, id]));
      setStack((s) => [...s.filter((w) => w !== id), id]);
      setPos((p) => {
        if (p[id]) return p;
        const n = openCount.current++;
        const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
        const vh = typeof window !== "undefined" ? window.innerHeight : 900;
        const w = size?.width ?? 640;
        const h = size?.height ?? 520;
        const stagger = (n % 5) * 26;
        return {
          ...p,
          [id]: {
            x: Math.max(12, Math.round((vw - w) / 2) + stagger - 52),
            y: Math.max(12, Math.round((vh - TASKBAR - h) / 2) + stagger - 40),
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
      if (maximized.includes(id)) return; // no dragging a maximised window
      e.preventDefault();
      focusWindow(id);
      const cur = pos[id] ?? { x: 0, y: 0 };
      drag.current = { id, dx: e.clientX - cur.x, dy: e.clientY - cur.y };
      document.body.style.userSelect = "none";
    },
    [focusWindow, pos, maximized],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      setPos((p) => ({
        ...p,
        [d.id]: { x: Math.max(-240, e.clientX - d.dx), y: Math.max(0, e.clientY - d.dy) },
      }));
    };
    const up = () => {
      drag.current = null;
      document.body.style.userSelect = "";
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return {
    open,
    stack,
    minimized,
    isOpen: (id) => open.includes(id),
    isMinimized: (id) => minimized.includes(id),
    isMaximized: (id) => maximized.includes(id),
    zOf: (id) => Z_BASE + Math.max(0, stack.indexOf(id)),
    posOf: (id) => pos[id],
    openWindow,
    closeWindow,
    focusWindow,
    toggleMinimize,
    toggleMaximize,
    startDrag,
  };
}
