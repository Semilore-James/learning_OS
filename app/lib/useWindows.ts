"use client";

/* ============================================================================
   Window manager. Open / close / focus / z-stack, plus pointer drag of a
   window by its title bar. Drag logic ported from docs/support.js (_startDrag /
   _onMM / _onMU) and adapted to React + pointer events.
   ========================================================================== */
import { useCallback, useEffect, useRef, useState } from "react";

export interface WinState {
  id: string;
  x: number;
  y: number;
}

export interface WindowManager {
  open: string[];
  stack: string[]; // back -> front
  isOpen: (id: string) => boolean;
  zOf: (id: string) => number;
  posOf: (id: string) => { x: number; y: number } | undefined;
  openWindow: (id: string, spawn?: { x: number; y: number }) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  startDrag: (id: string, e: React.PointerEvent) => void;
}

const Z_BASE = 10;
const SPAWN_STEP = 28;

export function useWindows(): WindowManager {
  const [open, setOpen] = useState<string[]>([]);
  const [stack, setStack] = useState<string[]>([]);
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({});
  const spawnCount = useRef(0);

  const drag = useRef<{
    id: string;
    dx: number;
    dy: number;
  } | null>(null);

  const focusWindow = useCallback((id: string) => {
    setStack((s) => [...s.filter((w) => w !== id), id]);
  }, []);

  const openWindow = useCallback(
    (id: string, spawn?: { x: number; y: number }) => {
      setOpen((o) => (o.includes(id) ? o : [...o, id]));
      setStack((s) => [...s.filter((w) => w !== id), id]);
      setPos((p) => {
        if (p[id]) return p;
        const n = spawnCount.current++;
        const base = spawn ?? {
          x: 180 + (n % 6) * SPAWN_STEP,
          y: 70 + (n % 6) * SPAWN_STEP,
        };
        return { ...p, [id]: base };
      });
    },
    [],
  );

  const closeWindow = useCallback((id: string) => {
    setOpen((o) => o.filter((w) => w !== id));
    setStack((s) => s.filter((w) => w !== id));
  }, []);

  const startDrag = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.preventDefault();
      focusWindow(id);
      const cur = pos[id] ?? { x: 0, y: 0 };
      drag.current = { id, dx: e.clientX - cur.x, dy: e.clientY - cur.y };
      document.body.style.userSelect = "none";
    },
    [focusWindow, pos],
  );

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      setPos((p) => ({
        ...p,
        [d.id]: {
          x: Math.max(-200, e.clientX - d.dx),
          y: Math.max(0, e.clientY - d.dy),
        },
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
    isOpen: (id) => open.includes(id),
    zOf: (id) => Z_BASE + Math.max(0, stack.indexOf(id)),
    posOf: (id) => pos[id],
    openWindow,
    closeWindow,
    focusWindow,
    startDrag,
  };
}
