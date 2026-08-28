"use client";

/* ============================================================================
   The constellation canvas. One renderer for the level-1 topic map and every
   sub-constellation. SVG, token-driven. Ported and adapted from
   docs/DA Learning OS.dc.html buildConstellation().

   Node state (locked / available / active / completed / needs-review) is
   passed in — derived by lib/graph.ts, never computed here.
   ========================================================================== */
import { useId } from "react";
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
  locked: "var(--muted)",
};

export function Constellation({
  nodes,
  edges,
  states,
  width,
  height,
  labelSize = 10,
  selectedId,
  reducedMotion,
  onNodeClick,
}: {
  nodes: CNode[];
  edges: CEdge[];
  states: Record<string, NodeState>;
  width: number;
  height: number;
  labelSize?: number;
  selectedId?: string | null;
  reducedMotion: boolean;
  onNodeClick: (id: string) => void;
}) {
  const byId: Record<string, CNode> = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const uid = useId().replace(/[^a-z0-9]/gi, "");

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ position: "absolute", inset: 0, display: "block" }}
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

      {/* connections */}
      {edges.map((e, i) => {
        const f = byId[e.from];
        const t = byId[e.to];
        if (!f || !t) return null;
        const done = states[e.from] === "completed" && states[e.to] === "completed";
        const half = states[e.from] === "completed";
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
              stroke={done ? "var(--accent-2)" : half ? "var(--primary)" : "var(--border)"}
              strokeWidth={done ? 1.3 : 0.9}
              strokeDasharray={done ? "none" : "4 6"}
              opacity={done ? 0.6 : half ? 0.4 : 0.3}
            />
            {done && !reducedMotion && (
              <circle r={2.2} fill="var(--accent-2)" opacity={0.9}>
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
            onClick={() => onNodeClick(n.id)}
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
              <circle cx={x} cy={y} r={r + 5} fill="none" stroke="var(--text)" strokeWidth={1} opacity={0.5} />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={STATE_FILL[st]}
              stroke={STATE_STROKE[st]}
              strokeWidth={isL ? 0.9 : 1.6}
              strokeDasharray={isL ? "3 3" : "none"}
              filter={isC || isA || isR ? `url(#glow-${uid})` : undefined}
            />
            {isC && (
              <g opacity={0.55} pointerEvents="none">
                <line x1={x} y1={y - r * 0.6} x2={x} y2={y + r * 0.6} stroke="#fff" strokeWidth={0.9} />
                <line x1={x - r * 0.6} y1={y} x2={x + r * 0.6} y2={y} stroke="#fff" strokeWidth={0.9} />
              </g>
            )}
            {isL && (
              <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="central" fontSize={r * 0.7} fill="var(--muted)" pointerEvents="none">
                ⊘
              </text>
            )}
            <text
              x={x}
              y={y + r + 13}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize={labelSize}
              fill={labelColor}
              pointerEvents="none"
            >
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
