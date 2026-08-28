"use client";

/* ============================================================================
   Canvas (build step 19 / PRD 13). Freeform SVG board: pen, shapes, arrow,
   text, sticky notes, eraser, select (move + resize), pan, wheel-zoom.

   - the in-progress shape lives in draftRef; pointerup reads the ref, not state
   - the SVG captures the pointer so a drag that leaves it still finishes
   - text / sticky use an inline <textarea>, never window.prompt (a no-op in
     embedded browsers); editingRef makes the commit reliable
   - a selected shape gets 8 resize handles
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
import { ShapeEl, hitTest, bbox, resizeEl, type El, type Box } from "./shapes";

type Tool = "select" | "pan" | "pen" | "rect" | "ellipse" | "arrow" | "text" | "sticky" | "eraser";
type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const KEY = "da-os-canvas";
const COLORS = ["var(--primary)", "var(--accent-2)", "var(--accent-1)", "var(--accent-3)", "var(--text)"];
const TOOLS: { id: Tool; icon: typeof Pencil; label: string }[] = [
  { id: "select", icon: MousePointer2, label: "Select / move / resize" },
  { id: "pan", icon: Hand, label: "Pan" },
  { id: "pen", icon: Pencil, label: "Pen" },
  { id: "rect", icon: Square, label: "Rectangle" },
  { id: "ellipse", icon: CircleIcon, label: "Ellipse" },
  { id: "arrow", icon: ArrowUpRight, label: "Arrow" },
  { id: "text", icon: Type, label: "Text" },
  { id: "sticky", icon: StickyNote, label: "Sticky note" },
  { id: "eraser", icon: Eraser, label: "Eraser" },
];
const HANDLES: { id: Handle; fx: number; fy: number; cursor: string }[] = [
  { id: "nw", fx: 0, fy: 0, cursor: "nwse-resize" },
  { id: "n", fx: 0.5, fy: 0, cursor: "ns-resize" },
  { id: "ne", fx: 1, fy: 0, cursor: "nesw-resize" },
  { id: "e", fx: 1, fy: 0.5, cursor: "ew-resize" },
  { id: "se", fx: 1, fy: 1, cursor: "nwse-resize" },
  { id: "s", fx: 0.5, fy: 1, cursor: "ns-resize" },
  { id: "sw", fx: 0, fy: 1, cursor: "nesw-resize" },
  { id: "w", fx: 0, fy: 0.5, cursor: "ew-resize" },
];

function loadEls(): El[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? (JSON.parse(raw) as El[]) : [];
  } catch {
    return [];
  }
}

function nextBox(b0: Box, handle: Handle, dx: number, dy: number): Box {
  let { x, y, w, h } = b0;
  if (handle.includes("w")) {
    x = b0.x + dx;
    w = b0.w - dx;
  }
  if (handle.includes("e")) w = b0.w + dx;
  if (handle.includes("n")) {
    y = b0.y + dy;
    h = b0.h - dy;
  }
  if (handle.includes("s")) h = b0.h + dy;
  // keep a minimum size, flipping the anchor if needed
  if (w < 8) {
    x = handle.includes("w") ? b0.x + b0.w - 8 : x;
    w = 8;
  }
  if (h < 8) {
    y = handle.includes("n") ? b0.y + b0.h - 8 : y;
    h = 8;
  }
  return { x, y, w, h };
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
  const editingRef = useRef(editing);
  const dragRef = useRef<{ id: string; sx: number; sy: number } | null>(null);
  const resizeRef = useRef<{ id: string; handle: Handle; b0: Box; sx: number; sy: number } | null>(null);
  const panRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const usedMs = useRef(0);
  const loggedSession = useRef(false);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);
  useEffect(() => {
    editingRef.current = editing;
  }, [editing]);

  const putDraft = (next: El | null) => {
    draftRef.current = next;
    setDraft(next);
  };

  const capture = (id: number) => {
    try {
      svgRef.current?.setPointerCapture(id);
    } catch {
      /* pointer already released */
    }
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

  // Delete / Backspace removes the selected element (unless typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId || editingRef.current) return;
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
  }, [selectedId]);

  const toLocal = (clientX: number, clientY: number) => {
    const r = svgRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    return { x: (clientX - r.left - v.x) / v.k, y: (clientY - r.top - v.y) / v.k };
  };

  /** write the inline editor's text back onto its element (or drop it if blank) */
  const commitEditing = () => {
    const cur = editingRef.current;
    if (!cur) return;
    const text = cur.value.trim();
    setEls((prev) =>
      text ? prev.map((e) => (e.id === cur.id ? { ...e, text } : e)) : prev.filter((e) => e.id !== cur.id),
    );
    editingRef.current = null;
    setEditing(null);
  };

  const startResize = (e: React.PointerEvent, handle: Handle) => {
    if (!selectedId) return;
    e.stopPropagation();
    const el = els.find((x) => x.id === selectedId);
    if (!el) return;
    const p = toLocal(e.clientX, e.clientY);
    resizeRef.current = { id: selectedId, handle, b0: bbox(el), sx: p.x, sy: p.y };
    capture(e.pointerId);
  };

  const onDown = (e: React.PointerEvent) => {
    if (editingRef.current) {
      commitEditing();
      return;
    }
    const p = toLocal(e.clientX, e.clientY);

    if (tool === "pan") {
      panRef.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
      capture(e.pointerId);
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
        capture(e.pointerId);
      } else {
        setSelectedId(null);
      }
      return;
    }
    if (tool === "text" || tool === "sticky") {
      const id = crypto.randomUUID();
      const el: El =
        tool === "sticky"
          ? { id, type: "sticky", x: p.x, y: p.y, w: 180, h: 130, text: "", color }
          : { id, type: "text", x: p.x, y: p.y + 16, text: "", fontSize: 15, color };
      setEls((prev) => [...prev, el]);
      editingRef.current = { id, value: "" };
      setEditing({ id, value: "" });
      return;
    }
    // drag-drawing tools
    const base: El = { id: crypto.randomUUID(), type: tool, x: p.x, y: p.y, color };
    putDraft(tool === "pen" ? { ...base, points: [[p.x, p.y]] } : { ...base, w: 0, h: 0 });
    capture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (panRef.current) {
      const pr = panRef.current;
      setView((v) => ({ ...v, x: pr.vx + (e.clientX - pr.x), y: pr.vy + (e.clientY - pr.y) }));
      return;
    }
    const p = toLocal(e.clientX, e.clientY);

    if (resizeRef.current) {
      const rz = resizeRef.current;
      const b1 = nextBox(rz.b0, rz.handle, p.x - rz.sx, p.y - rz.sy);
      setEls((prev) => prev.map((el) => (el.id === rz.id ? resizeEl(el, rz.b0, b1) : el)));
      return;
    }
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
    resizeRef.current = null;
    const d = draftRef.current;
    if (d) {
      const empty =
        d.type === "pen"
          ? (d.points?.length ?? 0) < 2
          : Math.abs(d.w ?? 0) < 4 && Math.abs(d.h ?? 0) < 4;
      if (!empty) {
        setEls((prev) => [...prev, d]);
        if (tool !== "pen") {
          setSelectedId(d.id);
          setTool("select");
        }
      }
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
  const selEl = selectedId && tool === "select" ? els.find((e) => e.id === selectedId) : null;
  const selBox = selEl ? bbox(selEl) : null;
  const hs = 7 / view.k; // handle half-size in canvas units, constant on screen

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
            onClick={() => {
              setColor(c);
              if (selectedId) setEls((prev) => prev.map((el) => (el.id === selectedId ? { ...el, color: c } : el)));
            }}
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
                editingRef.current = null;
                setSelectedId(null);
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
              <>
                <rect
                  x={selBox.x - 3}
                  y={selBox.y - 3}
                  width={selBox.w + 6}
                  height={selBox.h + 6}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={1 / view.k}
                  strokeDasharray={`${4 / view.k} ${3 / view.k}`}
                  pointerEvents="none"
                />
                {HANDLES.map((hnd) => (
                  <rect
                    key={hnd.id}
                    x={selBox.x + selBox.w * hnd.fx - hs}
                    y={selBox.y + selBox.h * hnd.fy - hs}
                    width={hs * 2}
                    height={hs * 2}
                    fill="var(--primary)"
                    stroke="var(--bg)"
                    strokeWidth={1 / view.k}
                    style={{ cursor: hnd.cursor }}
                    onPointerDown={(e) => startResize(e, hnd.id)}
                  />
                ))}
              </>
            )}
          </g>
        </svg>

        {editing && editingEl && (
          <textarea
            autoFocus
            value={editing.value}
            onChange={(e) => {
              const v = { id: editing.id, value: e.target.value };
              editingRef.current = v;
              setEditing(v);
            }}
            onBlur={commitEditing}
            onKeyDown={(e) => {
              if (e.key === "Escape" || (e.key === "Enter" && !e.shiftKey)) {
                e.preventDefault();
                commitEditing();
              }
            }}
            placeholder={editingEl.type === "sticky" ? "Sticky note…" : "Text…"}
            className="absolute resize-none border border-primary bg-surface p-1 text-foreground shadow-lg outline-none"
            style={{
              left: view.x + editingEl.x * view.k,
              top: view.y + (editingEl.type === "text" ? editingEl.y - 16 : editingEl.y) * view.k,
              width: (editingEl.w ?? 200) * view.k,
              height: (editingEl.h ?? 44) * view.k,
              font: `${(editingEl.fontSize ?? 13) * view.k}px/1.35 var(--font-body)`,
            }}
          />
        )}
      </div>
    </div>
  );
}
