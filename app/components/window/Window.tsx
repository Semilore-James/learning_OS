"use client";

/* ============================================================================
   Generic window chrome. Visual treatment comes from the chrome token contract
   (.chrome-panel + CSS vars), so a skin swap restyles every window at once.
   Controls: minimise, maximise, close.
   ========================================================================== */
import { useEffect, useRef, type ReactNode } from "react";
import { Minus, Square, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResizeEdge } from "@/lib/useWindows";

const TASKBAR = 44;

const HANDLES: { edge: ResizeEdge; cls: string }[] = [
  { edge: "n", cls: "-top-[3px] left-2 right-2 h-1.5 cursor-ns-resize" },
  { edge: "s", cls: "-bottom-[3px] left-2 right-2 h-1.5 cursor-ns-resize" },
  { edge: "e", cls: "-right-[3px] top-2 bottom-2 w-1.5 cursor-ew-resize" },
  { edge: "w", cls: "-left-[3px] top-2 bottom-2 w-1.5 cursor-ew-resize" },
  { edge: "ne", cls: "-top-1 -right-1 size-3 cursor-nesw-resize" },
  { edge: "nw", cls: "-top-1 -left-1 size-3 cursor-nwse-resize" },
  { edge: "se", cls: "-bottom-1 -right-1 size-3.5 cursor-nwse-resize" },
  { edge: "sw", cls: "-bottom-1 -left-1 size-3 cursor-nesw-resize" },
];

function ControlButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={(e) => e.stopPropagation()}
      className={cn(
        "chrome-flat grid size-5 place-items-center bg-surface-raised text-muted-foreground transition-colors",
        danger ? "hover:bg-[#e5484d] hover:text-white" : "hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function Window({
  id,
  title,
  subtitle,
  x,
  y,
  z,
  width,
  height,
  maximized,
  compact = false,
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onDragStart,
  onResizeStart,
  fitContent = false,
  onReportNatural,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  maximized: boolean;
  /** small screen: window fills the viewport, no drag / resize / maximise */
  compact?: boolean;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onResizeStart: (edge: ResizeEdge, e: React.PointerEvent) => void;
  fitContent?: boolean;
  onReportNatural?: (size: { width: number; height: number }) => void;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!fitContent || !onReportNatural || !bodyRef.current) return;
    const el = bodyRef.current;
    const report = onReportNatural;
    const measure = () => {
      const inner = el.firstElementChild as HTMLElement | null;
      const target = inner ?? el;
      report({ width: target.scrollWidth + 8, height: target.scrollHeight + 44 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [fitContent, onReportNatural]);

  const geom: React.CSSProperties = maximized
    ? { left: 8, top: 8, width: "calc(100vw - 16px)", height: `calc(100dvh - ${TASKBAR + 16}px)` }
    : { left: x, top: y, width, height };

  return (
    <section
      id={`win-${id}`}
      onPointerDown={onFocus}
      className="chrome-panel absolute flex flex-col overflow-hidden text-foreground"
      style={{ zIndex: z, animation: "fadeIn .16s ease", ...geom }}
    >
      <header
        onPointerDown={compact ? undefined : onDragStart}
        onDoubleClick={compact ? undefined : onMaximize}
        className={cn(
          "flex h-11 min-h-11 touch-none items-center gap-2 pr-2.5",
          maximized || compact ? "cursor-default" : "cursor-grab",
        )}
        style={{ background: "var(--titlebar)", borderBottom: "var(--bd)" }}
      >
        <div className="self-stretch bg-primary" style={{ width: "var(--titlebar-accent-w)" }} />
        <span className="flex-1 truncate pl-1 font-display text-sm font-semibold">{title}</span>
        {subtitle && <span className="font-mono text-[9px] text-muted-foreground">{subtitle}</span>}
        <div className="flex gap-1">
          <ControlButton label="Minimise" onClick={onMinimize}>
            <Minus className="size-2.5" strokeWidth={2.5} />
          </ControlButton>
          {!compact && (
            <ControlButton label={maximized ? "Restore" : "Maximise"} onClick={onMaximize}>
              <Square className="size-2" strokeWidth={2.5} />
            </ControlButton>
          )}
          <ControlButton label="Close" onClick={onClose} danger>
            <X className="size-2.5" strokeWidth={2.5} />
          </ControlButton>
        </div>
      </header>

      <div ref={bodyRef} className="relative flex-1 overflow-auto">
        {children}
      </div>

      {!maximized &&
        HANDLES.map((h) => (
          <div
            key={h.edge}
            onPointerDown={(e) => onResizeStart(h.edge, e)}
            className={cn("absolute z-[5]", h.cls)}
          />
        ))}
    </section>
  );
}
