"use client";

/* ============================================================================
   Canvas (build step 19 / PRD 13). Freeform SVG board: pen, shapes, arrow,
   text, sticky notes, eraser, select (move + resize), pan, wheel-zoom.

   - the in-progress shape lives in draftRef; pointerup reads the ref, not state
   - the SVG captures the pointer so a drag that leaves it still finishes
   - move / resize only engage after the pointer travels a few px, so a plain
     click never nudges a shape
   - text / sticky are typed into a docked bar at the bottom of the canvas, not
     an in-place overlay (window.prompt is a no-op in embedded browsers, and a
     tiny floating box is easy to lose)
   The window opens on a gallery of saved boards (CanvasGallery); each board
   autosaves to localStorage. 2 minutes of use -> logCanvasSession (+15 XP).
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
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
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { saveBoard, type Board } from "@/lib/canvas/boards";
import { ShapeEl, hitTest, bbox, resizeEl, type El, type Box } from "./shapes";
import { CanvasGallery } from "./CanvasGallery";

type Tool = "select" | "pan" | "pen" | "rect" | "ellipse" | "arrow" | "text" | "sticky" | "eraser";
type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const DRAG_START_PX = 4; // pointer travel before a move/resize engages
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
  if (w < 10) {
    if (handle.includes("w")) x = b0.x + b0.w - 10;
    w = 10;
  }
  if (h < 10) {
    if (handle.includes("n")) y = b0.y + b0.h - 10;
    h = 10;
  }
  return { x, y, w, h };
}

interface Drag {
  kind: "move" | "resize";
  id: string;
  handle: Handle;
  b0: Box;
  startX: number;
  startY: number;
  engaged: boolean;
}

function CanvasBoard({ board, onBack }: { board: Board; onBack: () => void }) {
  const { dispatch } = useStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [els, setEls] = useState<El[]>(board.els);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const [draft, setDraft] = useState<El | null>(null);
  const [editing, setEditing] = useState<{ id: string; value: string; kind: "text" | "sticky" } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const draftRef = useRef<El | null>(null);
  const viewRef = useRef(view);
  const dragRef = useRef<Drag | null>(null);
  const panRef = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const usedMs = useRef(0);
  const loggedSession = useRef(false);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // focus the docked editor whenever it opens
  useEffect(() => {
    if (editing) editRef.current?.focus();
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

  // autosave this board
  useEffect(() => {
    const id = setInterval(() => saveBoard(board.id, els), 3000);
    return () => {
      clearInterval(id);
      saveBoard(board.id, els);
    };
  }, [els, board.id]);

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

  // Delete / Backspace removes the selected element (unless the editor is open)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedId) return;
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

  const commitText = () => {
    setEditing((cur) => {
      if (!cur) return null;
      const text = cur.value.trim();
      setEls((prev) =>
        text ? prev.map((e) => (e.id === cur.id ? { ...e, text } : e)) : prev.filter((e) => e.id !== cur.id),
      );
      return null;
    });
  };
  const cancelText = () => {
    setEditing((cur) => {
      if (cur) setEls((prev) => prev.filter((e) => e.id !== cur.id));
      return null;
    });
  };

  const startResize = (e: React.PointerEvent, handle: Handle) => {
    if (!selectedId) return;
    e.stopPropagation();
    const el = els.find((x) => x.id === selectedId);
    if (!el) return;
    dragRef.current = {
      kind: "resize",
      id: selectedId,
      handle,
      b0: bbox(el),
      startX: e.clientX,
      startY: e.clientY,
      engaged: false,
    };
    capture(e.pointerId);
  };

  const onDown = (e: React.PointerEvent) => {
    if (editing) return; // the docked editor owns input
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
        dragRef.current = {
          kind: "move",
          id: hit.id,
          handle: "se",
          b0: bbox(hit),
          startX: e.clientX,
          startY: e.clientY,
          engaged: false,
        };
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
          ? { id, type: "sticky", x: p.x, y: p.y, w: 190, h: 140, text: "", color }
          : { id, type: "text", x: p.x, y: p.y + 16, text: "", fontSize: 16, color };
      setEls((prev) => [...prev, el]);
      setEditing({ id, value: "", kind: tool });
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

    const d = dragRef.current;
    if (d) {
      if (!d.engaged) {
        if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) < DRAG_START_PX) return;
        d.engaged = true;
      }
      const p0 = toLocal(d.startX, d.startY);
      const p1 = toLocal(e.clientX, e.clientY);
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      if (d.kind === "resize") {
        const b1 = nextBox(d.b0, d.handle, dx, dy);
        setEls((prev) => prev.map((el) => (el.id === d.id ? resizeEl(el, d.b0, b1) : el)));
      } else {
        // translate so the element's box origin sits at (b0 origin + total delta)
        setEls((prev) =>
          prev.map((el) => {
            if (el.id !== d.id) return el;
            const b = bbox(el);
            const tx = d.b0.x + dx - b.x;
            const ty = d.b0.y + dy - b.y;
            if (el.type === "pen" && el.points) {
              return { ...el, points: el.points.map(([px, py]) => [px + tx, py + ty] as [number, number]) };
            }
            return { ...el, x: el.x + tx, y: el.y + ty };
          }),
        );
      }
      return;
    }

    const cur = draftRef.current;
    if (!cur) return;
    const p = toLocal(e.clientX, e.clientY);
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
      if (!empty) {
        setEls((prev) => [...prev, d]);
        if (d.type !== "pen") {
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
      const k = Math.min(4, Math.max(0.3, v.k * (e.deltaY < 0 ? 1.12 : 1 / 1.12)));
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

  const selEl = selectedId && tool === "select" && !editing ? els.find((e) => e.id === selectedId) : null;
  const selBox = selEl ? bbox(selEl) : null;
  const hs = 9 / view.k; // handle half-size in canvas units, ~18px on screen

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-1.5">
        <button
          type="button"
          onClick={() => {
            commitText();
            saveBoard(board.id, els);
            onBack();
          }}
          className="chrome-flat flex items-center gap-1 bg-surface-raised px-2 py-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> Boards
        </button>
        <span className="truncate text-[12px] font-semibold text-foreground">{board.name}</span>
      </div>
      <div className="flex min-h-0 flex-1">
      <div className="flex w-12 flex-col items-center gap-1 border-r border-border bg-surface py-2">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-pressed={tool === t.id}
            onClick={() => {
              commitText();
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
            {els.map((el) => <ShapeEl key={el.id} el={el} />)}
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
                    rx={2 / view.k}
                    fill="var(--primary)"
                    stroke="var(--bg)"
                    strokeWidth={1.5 / view.k}
                    style={{ cursor: hnd.cursor }}
                    onPointerDown={(e) => startResize(e, hnd.id)}
                  />
                ))}
              </>
            )}
          </g>
        </svg>

        {editing && (
          <div className="absolute inset-x-0 bottom-0 flex items-end gap-2 border-t border-primary bg-surface p-2.5 shadow-lg">
            <div className="flex-1">
              <span className="mb-1 block font-mono text-[9px] uppercase tracking-widest text-primary">
                {editing.kind === "sticky" ? "Sticky note" : "Text"} — Enter to add, Esc to cancel
              </span>
              <textarea
                ref={editRef}
                rows={editing.kind === "sticky" ? 3 : 1}
                value={editing.value}
                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelText();
                  } else if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    commitText();
                  }
                }}
                placeholder={editing.kind === "sticky" ? "Write the note…" : "Type your label…"}
                className="w-full resize-none border border-border bg-background px-2 py-1.5 text-[13px] text-foreground outline-none"
                style={{ borderRadius: "var(--radius-control)" }}
              />
            </div>
            <button
              type="button"
              onClick={commitText}
              className="chrome-flat chrome-press grid size-8 place-items-center bg-primary text-primary-foreground"
              aria-label="Add"
            >
              <Check className="size-4" />
            </button>
            <button
              type="button"
              onClick={cancelText}
              className="chrome-flat grid size-8 place-items-center bg-surface-raised text-muted-foreground hover:text-foreground"
              aria-label="Cancel"
            >
              <X className="size-4" />
            </button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

/** the Canvas window: a gallery of saved boards, or one open board */
export function CanvasWindow() {
  const [openBoard, setOpenBoard] = useState<Board | null>(null);
  if (openBoard) {
    return <CanvasBoard key={openBoard.id} board={openBoard} onBack={() => setOpenBoard(null)} />;
  }
  return <CanvasGallery onOpen={setOpenBoard} />;
}
