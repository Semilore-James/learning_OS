"use client";

/* ============================================================================
   The constellation canvas. One renderer for the level-1 topic map and every
   sub-constellation. SVG, token-driven, pan + wheel/trackpad zoom.

   - wheel / pinch  -> zoom toward the cursor (0.6x .. 4x)
   - drag on empty  -> pan
   - double click a node -> activate (opens its drawer)
   - double click empty  -> reset view
   Single clicks do nothing — deliberate, so a stray click while panning
   doesn't fling a panel open.

   Node state (locked / available / active / completed / needs-review) is
   passed in — derived by lib/graph.ts, never computed here.
   ========================================================================== */
import { useId, useRef, useState } from "react";
import type { NodeState } from "@/content/curriculum";

export interface CNode {
  id: string;
  label: string;
  pos: { x: number; y: number; r: number };
}
export interface CEdge {
  from: string;
  to: string;
}

const STATE_FILL: Record<NodeState, string> = {
  completed: "var(--accent-2)",
  "needs-review": "var(--accent-1)",
  active: "var(--primary)",
  available: "var(--surface-raised)",
  locked: "var(--surface-raised)",
};
const STATE_STROKE: Record<NodeState, string> = {
  completed: "var(--accent-2)",
  "needs-review": "var(--accent-1)",
  active: "var(--primary)",
  available: "var(--accent-3)",
  locked: "var(--border)",
};

const MIN_K = 0.6;
const MAX_K = 4;

export function Constellation({
  nodes,
  edges,
  states,
  width,
  height,
  labelSize = 11,
  selectedId,
  reducedMotion,
  onNodeActivate,
}: {
  nodes: CNode[];
  edges: CEdge[];
  states: Record<string, NodeState>;
  width: number;
  height: number;
  labelSize?: number;
  selectedId?: string | null;
  reducedMotion: boolean;
  onNodeActivate: (id: string) => void;
}) {
  const byId: Record<string, CNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const uid = useId().replace(/[^a-z0-9]/gi, "");
  const svgRef = useRef<SVGSVGElement>(null);

  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const [panning, setPanning] = useState(false);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);

  // convert a client point to svg-user coords (pre-transform)
  const toLocal = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * width;
    const sy = ((clientY - rect.top) / rect.height) * height;
    return { sx, sy };
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const { sx, sy } = toLocal(e.clientX, e.clientY);
    setView((v) => {
      const factor = Math.exp(-e.deltaY * 0.0015);
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
      // keep the point under the cursor fixed:  local = (s - t) / k
      const tx = sx - ((sx - v.tx) / v.k) * k;
      const ty = sy - ((sy - v.ty) / v.k) * k;
      return { k, tx, ty };
    });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // only pan when the background (not a node) is grabbed
    if ((e.target as Element).closest("[data-node]")) return;
    pan.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false };
    setPanning(true);
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const p = pan.current;
    if (!p) return;
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) p.moved = true;
    const rect = svgRef.current!.getBoundingClientRect();
    setView((v) => ({ ...v, tx: p.tx + (dx / rect.width) * width, ty: p.ty + (dy / rect.height) * height }));
  };
  const onPointerUp = () => {
    // let a click that followed a real drag be ignored, then clear
    setTimeout(() => (pan.current = null), 0);
    setPanning(false);
  };

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onDoubleClick={(e) => {
        if (!(e.target as Element).closest("[data-node]")) setView({ k: 1, tx: 0, ty: 0 });
      }}
      style={{
        position: "absolute",
        inset: 0,
        display: "block",
        cursor: panning ? "grabbing" : "grab",
        touchAction: "none",
      }}
    >
      <defs>
        <radialGradient id={`bg-${uid}`} cx="46%" cy="48%" r="60%">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </radialGradient>
        <filter id={`glow-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width={width} height={height} fill="var(--bg)" />
      <rect width={width} height={height} fill={`url(#bg-${uid})`} />

      <g transform={`translate(${view.tx} ${view.ty}) scale(${view.k})`}>
        {/* connections */}
        {edges.map((e, i) => {
          const f = byId[e.from];
          const t = byId[e.to];
          if (!f || !t) return null;
          const done = states[e.from] === "completed" && states[e.to] === "completed";
          const half = states[e.from] === "completed" || states[e.from] === "active";
          const mx = (f.pos.x + t.pos.x) / 2;
          const my = (f.pos.y + t.pos.y) / 2 - 22;
          const d = `M${f.pos.x},${f.pos.y} Q${mx},${my} ${t.pos.x},${t.pos.y}`;
          const pid = `p-${uid}-${i}`;
          return (
            <g key={i}>
              <path
                id={pid}
                d={d}
                fill="none"
                stroke={done ? "var(--accent-2)" : half ? "var(--primary)" : "var(--muted)"}
                strokeWidth={done ? 1.8 : half ? 1.4 : 1.1}
                strokeDasharray={done || half ? "none" : "2 5"}
                strokeLinecap="round"
                opacity={done ? 0.85 : half ? 0.6 : 0.42}
              />
              {done && !reducedMotion && (
                <circle r={2.4} fill="var(--accent-2)">
                  <animateMotion dur={`${6 + (i % 4) * 1.4}s`} repeatCount="indefinite" begin={`${(i % 5) * 0.7}s`}>
                    <mpath href={`#${pid}`} />
                  </animateMotion>
                </circle>
              )}
            </g>
          );
        })}

        {/* nodes */}
        {nodes.map((n) => {
          const st = states[n.id] ?? "locked";
          const { x, y, r } = n.pos;
          const isC = st === "completed";
          const isA = st === "active";
          const isR = st === "needs-review";
          const isL = st === "locked";
          const labelColor = isC || isA || isR ? "var(--text)" : "var(--muted)";
          return (
            <g
              key={n.id}
              data-node={n.id}
              onDoubleClick={(e) => {
                e.stopPropagation();
                onNodeActivate(n.id);
              }}
              style={{ cursor: "pointer" }}
            >
              {(isC || isR) && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 9}
                  fill={isR ? "var(--accent-1)" : "var(--accent-2)"}
                  opacity={0.14}
                  style={
                    !reducedMotion
                      ? { transformOrigin: `${x}px ${y}px`, animation: `breathe ${7 + (r % 4)}s ease-in-out infinite` }
                      : undefined
                  }
                />
              )}
              {isA && !reducedMotion && (
                <circle
                  cx={x}
                  cy={y}
                  r={r}
                  fill="none"
                  stroke="var(--primary)"
                  strokeWidth={1}
                  style={{ transformOrigin: `${x}px ${y}px`, animation: "pulse 3.4s ease-out infinite" }}
                />
              )}
              {selectedId === n.id && (
                <circle cx={x} cy={y} r={r + 6} fill="none" stroke="var(--text)" strokeWidth={1.2} opacity={0.6} />
              )}
              <circle
                cx={x}
                cy={y}
                r={isL ? r * 0.82 : r}
                fill={STATE_FILL[st]}
                fillOpacity={isL ? 0.35 : 1}
                stroke={STATE_STROKE[st]}
                strokeWidth={isL ? 1 : 1.8}
                strokeDasharray={isL ? "2 3" : "none"}
                filter={isC || isA || isR ? `url(#glow-${uid})` : undefined}
              />
              {isC && (
                <g opacity={0.55} pointerEvents="none">
                  <line x1={x} y1={y - r * 0.55} x2={x} y2={y + r * 0.55} stroke="#fff" strokeWidth={1} />
                  <line x1={x - r * 0.55} y1={y} x2={x + r * 0.55} y2={y} stroke="#fff" strokeWidth={1} />
                </g>
              )}
              <text
                x={x}
                y={y + r + 14}
                textAnchor="middle"
                fontFamily="var(--font-label)"
                fontSize={labelSize}
                fontWeight={isC || isA || isR ? 600 : 500}
                fill={labelColor}
                stroke="var(--bg)"
                strokeWidth={3.5}
                paintOrder="stroke"
                pointerEvents="none"
              >
                {n.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
