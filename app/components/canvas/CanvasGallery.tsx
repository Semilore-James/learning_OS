"use client";

/* ============================================================================
   Canvas gallery — the first thing the Canvas window shows. A "New canvas" card
   plus one card per saved board (thumbnail + name + last-edited), rename and
   delete inline. Boards live in localStorage via lib/canvas/boards.
   ========================================================================== */
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBoard, deleteBoard, listBoards, renameBoard, type Board } from "@/lib/canvas/boards";
import { ShapeEl, bbox, type El } from "./shapes";

function Thumb({ els }: { els: El[] }) {
  const vb = useMemo(() => {
    if (!els.length) return null;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const el of els) {
      const b = bbox(el);
      x0 = Math.min(x0, b.x);
      y0 = Math.min(y0, b.y);
      x1 = Math.max(x1, b.x + b.w);
      y1 = Math.max(y1, b.y + b.h);
    }
    const pad = 24;
    return `${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`;
  }, [els]);

  if (!vb) {
    return <div className="grid h-full place-items-center text-[10px] text-muted-foreground">empty</div>;
  }
  return (
    <svg viewBox={vb} preserveAspectRatio="xMidYMid meet" className="h-full w-full" aria-hidden>
      {els.map((el) => (
        <ShapeEl key={el.id} el={el} />
      ))}
    </svg>
  );
}

export function CanvasGallery({ onOpen }: { onOpen: (b: Board) => void }) {
  const [boards, setBoards] = useState<Board[]>(listBoards);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const refresh = () => setBoards(listBoards());

  return (
    <div className="flex h-full flex-col overflow-auto p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-sm font-bold text-foreground">Canvases</h3>
        <span className="font-mono text-[10px] text-muted-foreground">
          {boards.length} board{boards.length === 1 ? "" : "s"} · saved to this browser
        </span>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
        <button
          type="button"
          onClick={() => onOpen(createBoard())}
          className="chrome-panel flex aspect-[4/3] flex-col items-center justify-center gap-1.5 text-muted-foreground transition-colors hover:bg-surface-raised hover:text-primary"
        >
          <Plus className="size-6" />
          <span className="text-[11px] font-semibold">New canvas</span>
        </button>

        {boards.map((b) => (
          <div key={b.id} className="chrome-panel group relative flex flex-col overflow-hidden">
            <button
              type="button"
              onClick={() => onOpen(b)}
              className="aspect-[4/3] w-full border-b border-border bg-surface-raised p-1 transition-colors hover:bg-surface"
            >
              <Thumb els={b.els} />
            </button>
            <div className="flex items-center justify-between gap-1 p-2">
              {renaming === b.id ? (
                <input
                  autoFocus
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  onBlur={() => {
                    renameBoard(b.id, draftName);
                    setRenaming(null);
                    refresh();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      renameBoard(b.id, draftName);
                      setRenaming(null);
                      refresh();
                    } else if (e.key === "Escape") {
                      setRenaming(null);
                    }
                  }}
                  className="w-full border border-primary bg-background px-1 py-0.5 text-[11px] text-foreground outline-none"
                />
              ) : (
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-foreground">{b.name}</span>
              )}
              <div className={cn("flex shrink-0 gap-0.5", renaming === b.id && "hidden")}>
                <button
                  type="button"
                  aria-label="Rename"
                  onClick={() => {
                    setDraftName(b.name);
                    setRenaming(b.id);
                  }}
                  className="grid size-5 place-items-center text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100"
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  aria-label="Delete"
                  onClick={() => {
                    deleteBoard(b.id);
                    refresh();
                  }}
                  className="grid size-5 place-items-center text-muted-foreground opacity-0 hover:text-[#e5484d] group-hover:opacity-100"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            </div>
            <span className="px-2 pb-1.5 font-mono text-[9px] text-muted-foreground">
              {b.updatedAt.slice(0, 10)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
