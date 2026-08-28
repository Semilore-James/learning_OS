"use client";

/* ============================================================================
   Generic window chrome. Every feature window wraps its body in this. All
   visual treatment comes from the chrome token contract in globals.css, so a
   skin swap restyles every window at once.
   ========================================================================== */
import type { ReactNode } from "react";

export function Window({
  id,
  title,
  subtitle,
  x,
  y,
  z,
  width,
  height,
  onClose,
  onFocus,
  onDragStart,
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
  onClose: () => void;
  onFocus: () => void;
  onDragStart: (e: React.PointerEvent) => void;
  children: ReactNode;
}) {
  return (
    <section
      id={`win-${id}`}
      onPointerDown={onFocus}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
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
        animation: "fadeIn .18s ease",
        overflow: "hidden",
      }}
    >
      <header
        onPointerDown={onDragStart}
        style={{
          height: 44,
          minHeight: 44,
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 10px 0 0",
          background: "var(--titlebar)",
          borderBottom: "var(--bd)",
          cursor: "grab",
          touchAction: "none",
        }}
      >
        <div
          style={{
            width: "var(--titlebar-accent-w)",
            alignSelf: "stretch",
            background: "var(--primary)",
          }}
        />
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
          <span style={{ font: "400 9px var(--font-mono)", color: "var(--muted)" }}>
            {subtitle}
          </span>
        )}
        <button
          type="button"
          aria-label="Close window"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: 20,
            height: 20,
            display: "grid",
            placeItems: "center",
            background: "var(--surface-raised)",
            border: "var(--bd-inner)",
            borderRadius: "var(--radius-control)",
            color: "var(--muted)",
            font: "700 11px var(--font-mono)",
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </header>
      <div style={{ flex: 1, overflow: "auto", position: "relative" }}>{children}</div>
    </section>
  );
}
