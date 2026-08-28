"use client";

/* ============================================================================
   The constellation canvas. One renderer for the level-1 topic map and every
   sub-constellation. SVG, token-driven, pan + wheel/trackpad zoom.

   - wheel / pinch  -> zoom toward the cursor (0.6x .. 3x)
   - drag on empty  -> pan
   - click a node   -> activate (opens its drawer); suppressed if the pointer
                       was dragged (a pan), so panning never flings a panel open
   - double click empty -> reset view

   Node state (locked / available / active / completed / needs-review) is
   passed in — derived by lib/graph.ts, never computed here.
   ========================================================================== */
import { useEffect, useId, useRef, useState } from "react";
import type { NodeState } from "@/content/curriculum";

export interface CNode {
  id: string;
  /** full name — shown for the selected node and as a hover title */
  label: string;
  /** short code shown under every node ("XL 04"); falls back to label */
  code?: string;
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
const MAX_K = 3.4;
const LOD_START = 1.7;
const LOD_FULL = 2.5;

export interface SubGraph {
  nodes: CNode[];
  edges: CEdge[];
  /** the space `nodes` positions were laid out in, for normalising */
  space: { w: number; h: number };
}

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
  expandable,
  subStates,
  onExpandedActivate,
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
  /** level-of-detail: parent node id -> its sub-graph, revealed on zoom-in */
  expandable?: Record<string, SubGraph>;
  /** derived states for the sub-graph nodes */
  subStates?: Record<string, NodeState>;
  onExpandedActivate?: (parentId: string, childId: string) => void;
}) {
  const byId: Record<string, CNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const uid = useId().replace(/[^a-z0-9]/gi, "");
  const svgRef = useRef<SVGSVGElement>(null);

  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const [panning, setPanning] = useState(false);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);

  // non-passive wheel listener so preventDefault works (React attaches wheel
  // listeners as passive by default)
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * width;
      const sy = ((e.clientY - rect.top) / rect.height) * height;
      setView((v) => {
        const factor = Math.min(1.12, Math.max(0.89, Math.exp(-e.deltaY * 0.0009)));
        const k = Math.min(MAX_K, Math.max(MIN_K, v.k * factor));
        const tx = sx - ((sx - v.tx) / v.k) * k;
        const ty = sy - ((sy - v.ty) / v.k) * k;
        return { k, tx, ty };
      });
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [width, height]);

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
        {/* level-of-detail: sub-nodes revealed as you zoom into a topic */}
        {expandable &&
          (() => {
            const alpha = Math.min(1, Math.max(0, (view.k - LOD_START) / (LOD_FULL - LOD_START)));
            if (alpha <= 0.02) return null;
            const spread = 46 + alpha * 66;
            return nodes.map((parent) => {
              const sg = expandable[parent.id];
              if (!sg || sg.nodes.length === 0) return null;
              const cx0 = sg.space.w / 2;
              const cy0 = sg.space.h / 2;
              const place = (p: { x: number; y: number }) => ({
                x: parent.pos.x + ((p.x - cx0) / (sg.space.w / 2)) * spread,
                y: parent.pos.y + ((p.y - cy0) / (sg.space.h / 2)) * spread,
              });
              const posOf: Record<string, { x: number; y: number }> = {};
              sg.nodes.forEach((n) => (posOf[n.id] = place(n.pos)));
              return (
                <g key={`lod-${parent.id}`} opacity={alpha} style={{ pointerEvents: alpha > 0.5 ? "auto" : "none" }}>
                  {sg.edges.map((e, i) => {
                    const a = posOf[e.from];
                    const b = posOf[e.to];
                    if (!a || !b) return null;
                    return (
                      <line
                        key={i}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="var(--muted-foreground)"
                        strokeWidth={0.6}
                        opacity={0.4}
                      />
                    );
                  })}
                  {sg.nodes.map((n) => {
                    const p = posOf[n.id];
                    const st = subStates?.[n.id] ?? "locked";
                    const fill =
                      st === "completed" ? "var(--accent-2)" : st === "active" ? "var(--primary)" : "var(--surface-raised)";
                    const stroke =
                      st === "completed" ? "var(--accent-2)" : st === "available" ? "var(--accent-3)" : "var(--muted-foreground)";
                    return (
                      <g
                        key={n.id}
                        data-node={`lod:${n.id}`}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          if (!pan.current?.moved) onExpandedActivate?.(parent.id, n.id);
                        }}
                        style={{ cursor: "pointer" }}
                      >
                        <title>{n.label}</title>
                        <circle cx={p.x} cy={p.y} r={4.5} fill={fill} stroke={stroke} strokeWidth={1} />
                        {alpha > 0.7 && (
                          <text
                            x={p.x}
                            y={p.y + 11}
                            textAnchor="middle"
                            fontFamily="var(--font-mono)"
                            fontSize={5.5}
                            fill="var(--muted-foreground)"
                            stroke="var(--bg)"
                            strokeWidth={2}
                            paintOrder="stroke"
                            pointerEvents="none"
                          >
                            {n.code ?? n.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            });
          })()}

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
                stroke={done ? "var(--accent-2)" : half ? "var(--primary)" : "var(--muted-foreground)"}
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
          const isSel = selectedId === n.id;
          const labelColor = isC || isA || isR ? "var(--text)" : "var(--muted-foreground)";
          const shortLabel = n.code ?? n.label;
          return (
            <g
              key={n.id}
              data-node={n.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!pan.current?.moved) onNodeActivate(n.id);
              }}
              style={{ cursor: "pointer" }}
            >
              <title>{n.label}</title>
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
              {/* short code under every node */}
              <text
                x={x}
                y={y + r + 13}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={labelSize - 1}
                fontWeight={isC || isA || isR ? 700 : 500}
                fill={labelColor}
                stroke="var(--bg)"
                strokeWidth={3.5}
                paintOrder="stroke"
                pointerEvents="none"
                letterSpacing="0.03em"
              >
                {shortLabel}
              </text>
              {/* full name only for the selected node */}
              {isSel && n.code && (
                <text
                  x={x}
                  y={y + r + 27}
                  textAnchor="middle"
                  fontFamily="var(--font-label)"
                  fontSize={labelSize}
                  fontWeight={600}
                  fill="var(--text)"
                  stroke="var(--bg)"
                  strokeWidth={4}
                  paintOrder="stroke"
                  pointerEvents="none"
                >
                  {n.label}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
}
