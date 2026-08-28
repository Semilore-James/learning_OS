"use client";

/* ============================================================================
   Canvas (build step 19 / PRD 13). A freeform SVG thinking space: pen, shapes,
   arrow, text, sticky notes, eraser, select-move, pan, wheel-zoom.

   Interaction notes:
   - the in-progress shape lives in draftRef (authoritative) and mirrors into
     state only so it renders; pointerup reads the ref, never stale state
   - the SVG captures the pointer on down so a drag that leaves the element
     still finishes cleanly
   - text / sticky use an inline editor, never window.prompt (which is a no-op
     in embedded browsers)
   Autosaves to localStorage; 2 minutes of use -> logCanvasSession (+15 XP).
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
import { ShapeEl, hitTest, bbox, type El } from "./shapes";

type Tool = "select" | "pan" | "pen" | "rect" | "ellipse" | "arrow" | "text" | "sticky" | "eraser";

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
function loadEls(): El[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as El[]) : [];
  } catch {
    return [];
  }
}

export function CanvasWindow() {
  const { dispatch } = useStore();
  const svgRef = useRef<SVGSVGElement>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [els, setEls] = useState<El[]>(loadEls);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [draft, setDraft] = useState<El | null>(null);
  const [editing, setEditing] = useState<{ id: string; value: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const draftRef = useRef<El | null>(null);
  const viewRef = useRef(view);
  const dragRef = useRef<{ id: string; sx: number; sy: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const usedMs = useRef(0);
  const loggedSession = useRef(false);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const putDraft = (next: El | null) => {
    draftRef.current = next;
    setDraft(next);
  };

  // autosave
  useEffect(() => {
    const id = setInterval(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(els));
      } catch {
        /* quota / private mode */
      }
    }, 4000);
    return () => clearInterval(id);
  }, [els]);

  // 2 minutes of use -> XP (once per window open)
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

  // delete the selected element with Delete / Backspace (not while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId || editing) return;
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA") return;
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setEls((prev) => prev.filter((el) => el.id !== selectedId));
        setSelectedId(null);
      } else if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedId, editing]);

  const toLocal = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    return { x: (clientX - r.left - v.x) / v.k, y: (clientY - r.top - v.y) / v.k };
  };

  const commitEditing = () => {
    setEditing((cur) => {
      if (!cur) return null;
      setEls((prev) => {
        const text = cur.value.trim();
        if (!text) return prev.filter((e) => e.id !== cur.id);
        return prev.map((e) => (e.id === cur.id ? { ...e, text } : e));
      });
      return null;
    });
  };

  const onDown = (e: React.PointerEvent) => {
    if (editing) {
      commitEditing();
      return;
    }
    const p = toLocal(e.clientX, e.clientY);

    if (tool === "pan") {
      panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      svgRef.current?.setPointerCapture(e.pointerId);
      return;
    }
    if (tool === "eraser") {
      const hit = hitTest(els, p.x, p.y);
      if (hit) setEls((prev) => prev.filter((el) => el.id !== hit.id));
      return;
    }
    if (tool === "select") {
      const hit = hitTest(els, p.x, p.y);
      if (hit) {
        dragRef.current = { id: hit.id, sx: p.x, sy: p.y };
        setSelectedId(hit.id);
        svgRef.current?.setPointerCapture(e.pointerId);
      } else {
        setSelectedId(null);
      }
      return;
    }
    if (tool === "text" || tool === "sticky") {
      const id = crypto.randomUUID();
      const el: El =
        tool === "sticky"
          ? { id, type: "sticky", x: p.x, y: p.y, w: 170, h: 130, text: "", color }
          : { id, type: "text", x: p.x, y: p.y + 14, text: "", color };
      setEls((prev) => [...prev, el]);
      setEditing({ id, value: "" });
      return;
    }
    // drag-drawing tools
    const base: El = { id: crypto.randomUUID(), type: tool, x: p.x, y: p.y, color };
    putDraft(tool === "pen" ? { ...base, points: [[p.x, p.y]] } : { ...base, w: 0, h: 0 });
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (panRef.current) {
      const pr = panRef.current;
      setView((v) => ({ ...v, x: pr.vx + (e.clientX - pr.x), y: pr.vy + (e.clientY - pr.y) }));
      return;
    }
    const p = toLocal(e.clientX, e.clientY);
    if (dragRef.current) {
      const d = dragRef.current;
      const dx = p.x - d.sx;
      const dy = p.y - d.sy;
      d.sx = p.x;
      d.sy = p.y;
      setEls((prev) =>
        prev.map((el) => {
          if (el.id !== d.id) return el;
          if (el.type === "pen" && el.points) {
            return { ...el, points: el.points.map(([px, py]) => [px + dx, py + dy] as [number, number]) };
          }
          return { ...el, x: el.x + dx, y: el.y + dy };
        }),
      );
      return;
    }
    const cur = draftRef.current;
    if (!cur) return;
    const next: El =
      cur.type === "pen"
        ? { ...cur, points: [...(cur.points ?? []), [p.x, p.y]] }
        : { ...cur, w: p.x - cur.x, h: p.y - cur.y };
    putDraft(next);
  };

  const onUp = (e: React.PointerEvent) => {
    try {
      svgRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* not captured */
    }
    panRef.current = null;
    dragRef.current = null;
    const d = draftRef.current;
    if (d) {
      const empty =
        d.type === "pen"
          ? (d.points?.length ?? 0) < 2
          : Math.abs(d.w ?? 0) < 4 && Math.abs(d.h ?? 0) < 4;
      if (!empty) setEls((prev) => [...prev, d]);
      putDraft(null);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    setView((v) => {
      const k = Math.min(4, Math.max(0.3, v.k * (e.deltaY < 0 ? 1.1 : 1 / 1.1)));
      const ratio = k / v.k;
      return { k, x: mx - (mx - v.x) * ratio, y: my - (my - v.y) * ratio };
    });
  };

  const exportPng = () => {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = svg.clientWidth * 2;
      c.height = svg.clientHeight * 2;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue("--bg").trim() || "#080b14";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => {
        if (!b) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = "canvas.png";
        a.click();
        URL.revokeObjectURL(a.href);
      });
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(xml)));
  };

  const editingEl = editing ? els.find((e) => e.id === editing.id) : null;
  const selBox = selectedId && tool === "select" ? bbox(els.find((e) => e.id === selectedId) ?? ({} as El)) : null;

  return (
    <div className="flex h-full">
      <div className="flex w-12 flex-col items-center gap-1 border-r border-border bg-surface py-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-pressed={tool === t.id}
            onClick={() => {
              commitEditing();
              setTool(t.id);
              if (t.id !== "select") setSelectedId(null);
            }}
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
            aria-label={`colour ${c}`}
            onClick={() => setColor(c)}
            className={cn("size-5 rounded-full border-2", color === c ? "border-foreground" : "border-transparent")}
            style={{ background: c }}
          />
        ))}
        <div className="mt-auto flex flex-col gap-1">
          <button
            type="button"
            title="Export PNG"
            onClick={exportPng}
            className="chrome-flat grid size-8 place-items-center bg-surface-raised text-muted-foreground hover:text-foreground"
          >
            <Download className="size-3.5" />
          </button>
          <button
            type="button"
            title={confirmClear ? "Tap again to clear" : "Clear canvas"}
            onClick={() => {
              if (confirmClear) {
                setEls([]);
                putDraft(null);
                setEditing(null);
              }
              setConfirmClear((v) => !v);
            }}
            onBlur={() => setConfirmClear(false)}
            className={cn(
              "chrome-flat grid size-8 place-items-center bg-surface-raised hover:text-[#e5484d]",
              confirmClear ? "text-[#e5484d]" : "text-muted-foreground",
            )}
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="relative flex-1">
        <svg
          ref={svgRef}
          className="h-full w-full touch-none select-none"
          style={{
            background: "var(--bg)",
            cursor: tool === "pan" ? "grab" : tool === "select" ? "default" : tool === "eraser" ? "cell" : "crosshair",
          }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onWheel={onWheel}
        >
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {els.map((el) => (el.id === editing?.id ? null : <ShapeEl key={el.id} el={el} />))}
            {draft && <ShapeEl el={draft} ghost />}
            {selBox && (
              <rect
                x={selBox.x - 4}
                y={selBox.y - 4}
                width={selBox.w + 8}
                height={selBox.h + 8}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1}
                strokeDasharray="4 3"
                pointerEvents="none"
              />
            )}
          </g>
        </svg>

        {editing && editingEl && (
          <textarea
            autoFocus
            value={editing.value}
            onChange={(e) => setEditing({ id: editing.id, value: e.target.value })}
            onBlur={commitEditing}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                commitEditing();
              }
            }}
            placeholder={editingEl.type === "sticky" ? "Sticky note…" : "Text…"}
            className="absolute resize-none border border-primary bg-surface p-1 text-[13px] text-foreground outline-none"
            style={{
              left: view.x + editingEl.x * view.k,
              top: view.y + (editingEl.type === "text" ? editingEl.y - 14 : editingEl.y) * view.k,
              width: (editingEl.w ?? 180) * view.k,
              height: (editingEl.h ?? 40) * view.k,
              font: "13px/1.4 var(--font-body)",
            }}
          />
        )}
      </div>
    </div>
  );
}
