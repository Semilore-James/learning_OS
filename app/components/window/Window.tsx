"use client";

/* ============================================================================
   Generic window chrome. All visual treatment comes from the chrome token
   contract in globals.css, so a skin swap restyles every window at once.
   Controls: minimise, maximise, close.
   ========================================================================== */
import type { ReactNode } from "react";
import type { ResizeEdge } from "@/lib/useWindows";

const TASKBAR = 44;

const HANDLES: { edge: ResizeEdge; style: React.CSSProperties }[] = [
  { edge: "n", style: { top: -3, left: 8, right: 8, height: 6, cursor: "ns-resize" } },
  { edge: "s", style: { bottom: -3, left: 8, right: 8, height: 6, cursor: "ns-resize" } },
  { edge: "e", style: { right: -3, top: 8, bottom: 8, width: 6, cursor: "ew-resize" } },
  { edge: "w", style: { left: -3, top: 8, bottom: 8, width: 6, cursor: "ew-resize" } },
  { edge: "ne", style: { top: -4, right: -4, width: 12, height: 12, cursor: "nesw-resize" } },
  { edge: "nw", style: { top: -4, left: -4, width: 12, height: 12, cursor: "nwse-resize" } },
  { edge: "se", style: { bottom: -4, right: -4, width: 14, height: 14, cursor: "nwse-resize" } },
  { edge: "sw", style: { bottom: -4, left: -4, width: 12, height: 12, cursor: "nesw-resize" } },
];

function ControlButton({
  label,
  onClick,
  children,
  danger,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
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
      style={{
        width: 20,
        height: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        lineHeight: 1,
        padding: 0,
        background: "var(--surface-raised)",
        border: "var(--bd-inner)",
        borderRadius: "var(--radius-control)",
        color: "var(--muted)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        if (danger) {
          e.currentTarget.style.background = "#e5484d";
          e.currentTarget.style.color = "#fff";
        } else {
          e.currentTarget.style.color = "var(--text)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface-raised)";
        e.currentTarget.style.color = "var(--muted)";
      }}
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
  onClose,
  onFocus,
  onMinimize,
  onMaximize,
  onDragStart,
  onResizeStart,
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
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  onResizeStart: (edge: ResizeEdge, e: React.PointerEvent) => void;
  children: ReactNode;
}) {
  const geom: React.CSSProperties = maximized
    ? { left: 8, top: 8, width: "calc(100vw - 16px)", height: `calc(100dvh - ${TASKBAR + 16}px)` }
    : { left: x, top: y, width, height };

  return (
    <section
      id={`win-${id}`}
      onPointerDown={onFocus}
      style={{
        position: "absolute",
        zIndex: z,
        display: "flex",
        flexDirection: "column",
        background: "var(--panel)",
        color: "var(--text)",
        border: "var(--bd)",
        borderRadius: "var(--radius)",
        boxShadow: "var(--shadow)",
        backdropFilter: "var(--panel-blur)",
        WebkitBackdropFilter: "var(--panel-blur)",
        animation: "fadeIn .16s ease",
        overflow: "hidden",
        ...geom,
      }}
    >
      <header
        onPointerDown={onDragStart}
        onDoubleClick={onMaximize}
        style={{
          height: 44,
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px 0 0",
          background: "var(--titlebar)",
          borderBottom: "var(--bd)",
          cursor: maximized ? "default" : "grab",
          touchAction: "none",
        }}
      >
        <div style={{ width: "var(--titlebar-accent-w)", alignSelf: "stretch", background: "var(--primary)" }} />
        <span
          style={{
            flex: 1,
            font: "600 14px var(--font-display)",
            color: "var(--text)",
            paddingLeft: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </span>
        {subtitle && (
          <span style={{ font: "400 9px var(--font-mono)", color: "var(--muted)" }}>{subtitle}</span>
        )}
        <div style={{ display: "flex", gap: 4 }}>
          <ControlButton label="Minimise" onClick={onMinimize}>
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
              <line x1="1.5" y1="8" x2="8.5" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </ControlButton>
          <ControlButton label={maximized ? "Restore" : "Maximise"} onClick={onMaximize}>
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
              <rect x="1.5" y="1.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </ControlButton>
          <ControlButton label="Close" onClick={onClose} danger>
            <svg width="9" height="9" viewBox="0 0 10 10" aria-hidden>
              <line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </ControlButton>
        </div>
      </header>
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>{children}</div>

      {!maximized &&
        HANDLES.map((h) => (
          <div
            key={h.edge}
            onPointerDown={(e) => onResizeStart(h.edge, e)}
            style={{ position: "absolute", zIndex: 5, ...h.style }}
          />
        ))}
    </section>
  );
}
