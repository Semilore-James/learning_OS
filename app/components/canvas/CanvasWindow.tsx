"use client";

/* ============================================================================
   Canvas (build step 19 / PRD 13). A freeform SVG thinking space: pen, shapes,
   arrow, text, sticky notes, eraser, select-move, pan, zoom. One board per
   browser for now (named multi-board + Supabase sync is a follow-up).
   Autosaves to localStorage; 2 minutes of use -> logCanvasSession (+15 XP).
   PNG export.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Circle as CircleIcon,
  Download,
  Eraser,
  Hand,
  MousePointer2,
  Pencil,
  Square,
  StickyNote,
  Trash2,
  Type,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Tool = "select" | "pan" | "pen" | "rect" | "ellipse" | "arrow" | "text" | "sticky" | "eraser";

interface El {
  id: string;
  type: Exclude<Tool, "select" | "pan" | "eraser">;
  x: number;
  y: number;
  w?: number;
  h?: number;
  points?: [number, number][];
  text?: string;
  color: string;
}

const KEY = "da-os-canvas";
const COLORS = ["var(--primary)", "var(--accent-2)", "var(--accent-1)", "var(--accent-3)", "var(--text)"];
const TOOLS: { id: Tool; icon: typeof Pencil; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select / move" },
  { id: "pan", icon: Hand, label: "Pan" },
  { id: "pen", icon: Pencil, label: "Pen" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "ellipse", icon: CircleIcon, label: "Ellipse" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow" },
  { id: "text", icon: Type, label: "Text" },
  { id: "sticky", icon: StickyNote, label: "Sticky note" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];

export function CanvasWindow() {
  const { dispatch } = useStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [els, setEls] = useState<El[]>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      return raw ? (JSON.parse(raw) as El[]) : [];
    } catch {
      return [];
    }
  });
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [draft, setDraft] = useState<El | null>(null);
  const dragRef = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const usedMs = useRef(0);
  const loggedSession = useRef(false);

  // autosave
  useEffect(() => {
    const id = setInterval(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(els));
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(id);
  }, [els]);

  // 2-minute usage -> XP
  useEffect(() => {
    const id = setInterval(() => {
      usedMs.current += 1000;
      if (usedMs.current >= 120_000 && !loggedSession.current) {
        loggedSession.current = true;
        dispatch({ type: "logCanvasSession", minutes: 2 });
      }
    }, 1000);
    return () => clearInterval(id);
  }, [dispatch]);

  const toLocal = (e: React.PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return {
      x: (e.clientX - r.left - view.x) / view.k,
      y: (e.clientY - r.top - view.y) / view.k,
    };
  };

  const onDown = (e: React.PointerEvent) => {
    const p = toLocal(e);
    const target = (e.target as Element).closest("[data-el]");
    const targetId = target?.getAttribute("data-el") ?? null;

    if (tool === "pan") {
      panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      return;
    }
    if (tool === "eraser" && targetId) {
      setEls((prev) => prev.filter((el) => el.id !== targetId));
      return;
    }
    if (tool === "select") {
      if (targetId) {
        const el = els.find((x) => x.id === targetId)!;
        dragRef.current = { id: targetId, ox: p.x - el.x, oy: p.y - el.y };
      }
      return;
    }
    if (tool === "text" || tool === "sticky") {
      const text = prompt(tool === "sticky" ? "Sticky note:" : "Text:");
      if (text) {
        setEls((prev) => [
          ...prev,
          { id: crypto.randomUUID(), type: tool, x: p.x, y: p.y, w: 160, h: tool === "sticky" ? 120 : undefined, text, color },
        ]);
      }
      return;
    }
    // drawing tools
    const base: El = { id: crypto.randomUUID(), type: tool as El["type"], x: p.x, y: p.y, color };
    setDraft(tool === "pen" ? { ...base, points: [[p.x, p.y]] } : { ...base, w: 0, h: 0 });
  };

  const onMove = (e: React.PointerEvent) => {
    if (panRef.current) {
      setView((v) => ({ ...v, x: panRef.current!.vx + (e.clientX - panRef.current!.x), y: panRef.current!.vy + (e.clientY - panRef.current!.y) }));
      return;
    }
    const p = toLocal(e);
    if (dragRef.current) {
      const d = dragRef.current;
      setEls((prev) => prev.map((el) => (el.id === d.id ? { ...el, x: p.x - d.ox, y: p.y - d.oy } : el)));
      return;
    }
    setDraft((d) => {
      if (!d) return d;
      if (d.type === "pen") return { ...d, points: [...d.points!, [p.x, p.y]] };
      return { ...d, w: p.x - d.x, h: p.y - d.y };
    });
  };

  const onWheel = (e: React.WheelEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    setView((v) => {
      const k = Math.min(4, Math.max(0.25, v.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
      const ratio = k / v.k;
      return { k, x: mx - (mx - v.x) * ratio, y: my - (my - v.y) * ratio };
    });
  };

  const onUp = () => {
    panRef.current = null;
    dragRef.current = null;
    if (draft) {
      const empty =
        draft.type === "pen"
          ? draft.points!.length < 2
          : Math.abs(draft.w ?? 0) < 3 && Math.abs(draft.h ?? 0) < 3;
      if (!empty) setEls((prev) => [...prev, draft]);
      setDraft(null);
    }
  };

  const exportPng = () => {
    const svg = svgRef.current!;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = svg.clientWidth * 2;
      c.height = svg.clientHeight * 2;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--bg") || "#080b14";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = "canvas.png";
        a.click();
      });
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
  };

  const render = (el: El, ghost = false) => {
    const common = {
      "data-el": el.id,
      opacity: ghost ? 0.6 : 1,
      style: { cursor: tool === "select" ? "move" : tool === "eraser" ? "not-allowed" : "crosshair" },
    } as const;
    switch (el.type) {
      case "pen":
        return <path key={el.id} {...common} d={"M" + el.points!.map((p) => p.join(",")).join(" L ")} fill="none" stroke={el.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />;
      case "rect":
        return <rect key={el.id} {...common} x={Math.min(el.x, el.x + el.w!)} y={Math.min(el.y, el.y + el.h!)} width={Math.abs(el.w!)} height={Math.abs(el.h!)} fill="none" stroke={el.color} strokeWidth={2} />;
      case "ellipse":
        return <ellipse key={el.id} {...common} cx={el.x + el.w! / 2} cy={el.y + el.h! / 2} rx={Math.abs(el.w! / 2)} ry={Math.abs(el.h! / 2)} fill="none" stroke={el.color} strokeWidth={2} />;
      case "arrow":
        return (
          <g key={el.id} {...common}>
            <line x1={el.x} y1={el.y} x2={el.x + el.w!} y2={el.y + el.h!} stroke={el.color} strokeWidth={2} />
            <circle cx={el.x + el.w!} cy={el.y + el.h!} r={4} fill={el.color} />
          </g>
        );
      case "text":
        return <text key={el.id} {...common} x={el.x} y={el.y} fill={el.color} fontFamily="var(--font-body)" fontSize={15}>{el.text}</text>;
      case "sticky":
        return (
          <g key={el.id} {...common}>
            <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={el.color} opacity={0.16} stroke={el.color} strokeWidth={1} />
            <foreignObject x={el.x + 6} y={el.y + 6} width={el.w! - 12} height={el.h! - 12}>
              <div style={{ font: "13px/1.4 var(--font-body)", color: "var(--text)", whiteSpace: "pre-wrap" }}>{el.text}</div>
            </foreignObject>
          </g>
        );
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex w-12 flex-col items-center gap-1 border-r border-border bg-surface py-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            onClick={() => setTool(t.id)}
            className={cn(
              "chrome-flat grid size-8 place-items-center",
              tool === t.id ? "bg-primary text-primary-foreground" : "bg-surface-raised text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-3.5" />
          </button>
        ))}
        <div className="my-1 h-px w-6 bg-border" />
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setColor(c)}
            className={cn("size-5 rounded-full border", color === c ? "border-foreground" : "border-transparent")}
            style={{ background: c }}
          />
        ))}
        <div className="mt-auto flex flex-col gap-1">
          <button type="button" title="Export PNG" onClick={exportPng} className="chrome-flat grid size-8 place-items-center bg-surface-raised text-muted-foreground hover:text-foreground">
            <Download className="size-3.5" />
          </button>
          <button
            type="button"
            title="Clear canvas"
            onClick={() => {
              if (confirm("Clear the whole canvas?")) setEls([]);
            }}
            className="chrome-flat grid size-8 place-items-center bg-surface-raised text-muted-foreground hover:text-[#e5484d]"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="flex-1 touch-none"
        style={{ background: "var(--bg)", cursor: tool === "pan" ? "grab" : "crosshair" }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        onWheel={onWheel}
      >
        <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
          {els.map((el) => render(el))}
          {draft && render(draft, true)}
        </g>
      </svg>
    </div>
  );
}
