/* ============================================================================
   Canvas shape model + renderer. Split out of CanvasWindow so the window file
   is about interaction, not SVG geometry.
   ========================================================================== */

export interface El {
  id: string;
  type: "pen" | "rect" | "ellipse" | "arrow" | "text" | "sticky";
  x: number;
  y: number;
  w?: number;
  h?: number;
  points?: [number, number][];
  text?: string;
  /** text only — px, defaults to 15 */
  fontSize?: number;
  color: string;
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** axis-aligned bounding box for an element, in canvas coords */
export function bbox(el: El): Box {
  if (el.type === "pen" && el.points?.length) {
    const xs = el.points.map((p) => p[0]);
    const ys = el.points.map((p) => p[1]);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return { x, y, w: Math.max(...xs) - x || 1, h: Math.max(...ys) - y || 1 };
  }
  if (el.type === "text") {
    const fs = el.fontSize ?? 15;
    const lines = (el.text ?? " ").split("\n");
    const w = Math.max(30, Math.max(...lines.map((l) => l.length)) * fs * 0.6);
    return { x: el.x, y: el.y - fs, w, h: lines.length * fs * 1.3 + 4 };
  }
  if (el.type === "sticky") return { x: el.x, y: el.y, w: el.w ?? 160, h: el.h ?? 120 };
  const w = el.w ?? 0;
  const h = el.h ?? 0;
  return { x: Math.min(el.x, el.x + w), y: Math.min(el.y, el.y + h), w: Math.abs(w) || 1, h: Math.abs(h) || 1 };
}

/** topmost element under a canvas-space point, or null */
export function hitTest(els: El[], px: number, py: number): El | null {
  const pad = 6;
  for (let i = els.length - 1; i >= 0; i--) {
    const b = bbox(els[i]);
    if (px >= b.x - pad && px <= b.x + b.w + pad && py >= b.y - pad && py <= b.y + b.h + pad) return els[i];
  }
  return null;
}

/** re-fit an element from its old bounding box b0 into a new one b1 */
export function resizeEl(el: El, b0: Box, b1: Box): El {
  const sx = b1.w / (b0.w || 1);
  const sy = b1.h / (b0.h || 1);
  const map = (px: number, py: number): [number, number] => [
    b1.x + (px - b0.x) * sx,
    b1.y + (py - b0.y) * sy,
  ];

  if (el.type === "pen" && el.points) {
    return { ...el, points: el.points.map(([px, py]) => map(px, py)) };
  }
  if (el.type === "arrow") {
    const [x1, y1] = map(el.x, el.y);
    const [x2, y2] = map(el.x + (el.w ?? 0), el.y + (el.h ?? 0));
    return { ...el, x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  if (el.type === "text") {
    // scale the font uniformly by the average of the two axes, keep the box's
    // top-left pinned (baseline of line 1 sits one font-size below the top)
    const scale = Math.max(0.25, (sx + sy) / 2);
    const fontSize = Math.max(8, Math.round((el.fontSize ?? 15) * scale));
    return { ...el, x: b1.x, y: b1.y + fontSize, fontSize };
  }
  // rect / ellipse / sticky
  return { ...el, x: b1.x, y: b1.y, w: b1.w, h: b1.h };
}

export function ShapeEl({ el, ghost = false }: { el: El; ghost?: boolean }) {
  const common = { "data-el": el.id, opacity: ghost ? 0.55 : 1 };
  switch (el.type) {
    case "pen":
      return (
        <path
          {...common}
          d={"M" + (el.points ?? []).map((p) => p.join(",")).join(" L ")}
          fill="none"
          stroke={el.color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case "rect":
      return (
        <rect
          {...common}
          x={Math.min(el.x, el.x + (el.w ?? 0))}
          y={Math.min(el.y, el.y + (el.h ?? 0))}
          width={Math.abs(el.w ?? 0)}
          height={Math.abs(el.h ?? 0)}
          fill="none"
          stroke={el.color}
          strokeWidth={2}
        />
      );
    case "ellipse":
      return (
        <ellipse
          {...common}
          cx={el.x + (el.w ?? 0) / 2}
          cy={el.y + (el.h ?? 0) / 2}
          rx={Math.abs((el.w ?? 0) / 2)}
          ry={Math.abs((el.h ?? 0) / 2)}
          fill="none"
          stroke={el.color}
          strokeWidth={2}
        />
      );
    case "arrow": {
      const x2 = el.x + (el.w ?? 0);
      const y2 = el.y + (el.h ?? 0);
      const ang = Math.atan2(y2 - el.y, x2 - el.x);
      const head = 11;
      return (
        <g {...common}>
          <line x1={el.x} y1={el.y} x2={x2} y2={y2} stroke={el.color} strokeWidth={2} />
          <polygon
            points={`${x2},${y2} ${x2 - head * Math.cos(ang - 0.4)},${y2 - head * Math.sin(ang - 0.4)} ${x2 - head * Math.cos(ang + 0.4)},${y2 - head * Math.sin(ang + 0.4)}`}
            fill={el.color}
          />
        </g>
      );
    }
    case "text": {
      const fs = el.fontSize ?? 15;
      return (
        <text {...common} x={el.x} y={el.y} fill={el.color} fontFamily="var(--font-body)" fontSize={fs}>
          {(el.text ?? "").split("\n").map((line, i) => (
            <tspan key={i} x={el.x} dy={i === 0 ? 0 : "1.3em"}>
              {line || " "}
            </tspan>
          ))}
        </text>
      );
    }
    case "sticky":
      return (
        <g {...common}>
          <rect
            x={el.x}
            y={el.y}
            width={el.w ?? 160}
            height={el.h ?? 120}
            fill={el.color}
            opacity={0.16}
            stroke={el.color}
            strokeWidth={1}
          />
          <foreignObject x={el.x + 8} y={el.y + 8} width={(el.w ?? 160) - 16} height={(el.h ?? 120) - 16}>
            <div style={{ font: "13px/1.4 var(--font-body)", color: "var(--text)", whiteSpace: "pre-wrap", overflow: "hidden" }}>
              {el.text}
            </div>
          </foreignObject>
        </g>
      );
  }
}
