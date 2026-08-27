/* ============================================================================
   Procedural SVG wallpapers. Every one is built from CSS tokens so it themes
   automatically, is deterministic (no jump on re-render), covers a 1440x900
   frame with preserveAspectRatio="xMidYMid slice", and freezes when
   reducedMotion is set.

   User-supplied raster art is added later as kind: "image" entries in
   registry.ts and never touches this file.
   ========================================================================== */
import type { WallpaperProps } from "./types";

const W = 1440;
const H = 900;

/** tiny deterministic PRNG (mulberry32) so layouts are stable across renders */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const frame = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none" as const,
  display: "block" as const,
};

/* -------------------------------------------------------------- 1. starfield */
export function Starfield({ theme, reducedMotion }: WallpaperProps) {
  const r = rng(1);
  const stars = Array.from({ length: 90 }, () => ({
    x: r() * W,
    y: r() * H,
    rad: 0.5 + r() * 1.1,
    op: theme === "dark" ? 0.03 + r() * 0.06 : 0,
    dur: 4 + r() * 5,
    delay: r() * 6,
  }));
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="sf-glow" cx="50%" cy="46%" r="62%">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity={theme === "dark" ? 0.5 : 0.35} />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <rect width={W} height={H} fill="url(#sf-glow)" />
      {theme === "dark" &&
        stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.rad} fill="#ffffff" opacity={s.op}>
            {!reducedMotion && (
              <animate
                attributeName="opacity"
                values={`${s.op};${s.op * 2.6};${s.op}`}
                dur={`${s.dur}s`}
                begin={`${s.delay}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
    </svg>
  );
}

/* --------------------------------------------------------------- 2. dot grid */
export function DotGrid({ theme }: WallpaperProps) {
  const cols: number[] = [];
  for (let x = 24; x < W; x += 26) cols.push(x);
  const rows: number[] = [];
  for (let y = 24; y < H; y += 26) rows.push(y);
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width={W} height={H} fill="var(--bg)" />
      {rows.map((y) =>
        cols.map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={0.8} fill="var(--border)" opacity={theme === "dark" ? 0.35 : 0.55} />
        )),
      )}
    </svg>
  );
}

/* ---------------------------------------------------------------- 3. nebula */
export function Nebula({ theme, reducedMotion }: WallpaperProps) {
  const o = theme === "dark" ? 1 : 0.4;
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="neb-a" cx="30%" cy="35%" r="45%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.22 * o} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="neb-b" cx="72%" cy="62%" r="46%">
          <stop offset="0%" stopColor="var(--accent-3)" stopOpacity={0.2 * o} />
          <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="neb-c" cx="55%" cy="20%" r="40%">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity={0.12 * o} />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <rect width={W} height={H} fill="url(#neb-a)">
        {!reducedMotion && <animate attributeName="x" values="0;40;0" dur="26s" repeatCount="indefinite" />}
      </rect>
      <rect width={W} height={H} fill="url(#neb-b)">
        {!reducedMotion && <animate attributeName="x" values="0;-30;0" dur="32s" repeatCount="indefinite" />}
      </rect>
      <rect width={W} height={H} fill="url(#neb-c)" />
    </svg>
  );
}

/* --------------------------------------------------------------- 4. orbital */
export function Orbital({ theme, reducedMotion }: WallpaperProps) {
  const cx = W * 0.5;
  const cy = H * 0.5;
  const rings = [110, 200, 300, 410, 530];
  const op = theme === "dark" ? 0.5 : 0.7;
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width={W} height={H} fill="var(--bg)" />
      <g transform={`translate(${cx} ${cy})`}>
        {rings.map((rad, i) => (
          <g key={i}>
            <ellipse rx={rad} ry={rad * 0.42} fill="none" stroke="var(--border)" strokeWidth={1} opacity={op} />
            <g>
              {!reducedMotion && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0"
                  to={i % 2 ? "-360" : "360"}
                  dur={`${40 + i * 22}s`}
                  repeatCount="indefinite"
                />
              )}
              <circle
                cx={rad}
                cy={0}
                r={i === 2 ? 5 : 3}
                fill={i === 2 ? "var(--primary)" : "var(--muted)"}
                opacity={0.9}
              />
            </g>
          </g>
        ))}
        <circle r={7} fill="var(--accent-1)" opacity={0.85} />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------ 5. star chart */
export function StarChart({ theme }: WallpaperProps) {
  const r = rng(7);
  const pts = Array.from({ length: 26 }, () => ({ x: r() * W, y: r() * H }));
  // connect each point to its nearest 2 neighbours
  const edges: Array<[number, number]> = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    near.forEach((n) => {
      if (!edges.some(([a, b]) => (a === n.j && b === i) || (a === i && b === n.j))) edges.push([i, n.j]);
    });
  });
  const op = theme === "dark" ? 0.28 : 0.4;
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width={W} height={H} fill="var(--bg)" />
      {edges.map(([a, b], i) => (
        <line key={i} x1={pts[a].x} y1={pts[a].y} x2={pts[b].x} y2={pts[b].y} stroke="var(--border)" strokeWidth={1} opacity={op} />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i % 6 === 0 ? 3 : 1.6} fill="var(--muted)" opacity={0.7} />
      ))}
    </svg>
  );
}

/* ---------------------------------------------------------------- 6. aurora */
export function Aurora({ theme, reducedMotion }: WallpaperProps) {
  const op = theme === "dark" ? 0.5 : 0.28;
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="aur" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-3)" stopOpacity={0.0} />
          <stop offset="45%" stopColor="var(--primary)" stopOpacity={0.3 * op} />
          <stop offset="70%" stopColor="var(--accent-2)" stopOpacity={0.28 * op} />
          <stop offset="100%" stopColor="var(--accent-3)" stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M -200 ${180 + i * 190} C ${W * 0.3} ${60 + i * 190}, ${W * 0.7} ${320 + i * 190}, ${W + 200} ${140 + i * 190} L ${W + 200} ${H + 200} L -200 ${H + 200} Z`}
          fill="url(#aur)"
          opacity={0.6 - i * 0.15}
        >
          {!reducedMotion && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0 0; ${i % 2 ? -40 : 40} ${i * 8}; 0 0`}
              dur={`${22 + i * 9}s`}
              repeatCount="indefinite"
            />
          )}
        </path>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------- 7. grid horizon */
export function GridHorizon({ theme }: WallpaperProps) {
  const horizon = H * 0.42;
  const op = theme === "dark" ? 0.4 : 0.55;
  const verticals = Array.from({ length: 25 }, (_, i) => (i - 12) / 12);
  const rows = Array.from({ length: 14 }, (_, i) => i);
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="gh-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--bg)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <g stroke="var(--primary)" strokeWidth={1} opacity={op}>
        {verticals.map((v, i) => (
          <line key={i} x1={W / 2 + v * 90} y1={horizon} x2={W / 2 + v * W} y2={H} />
        ))}
        {rows.map((i) => {
          const t = i / rows.length;
          const y = horizon + Math.pow(t, 2.2) * (H - horizon);
          return <line key={i} x1={0} y1={y} x2={W} y2={y} />;
        })}
      </g>
      <rect width={W} height={horizon + 40} fill="url(#gh-fade)" />
      <line x1={0} y1={horizon} x2={W} y2={horizon} stroke="var(--accent-3)" strokeWidth={1.5} opacity={0.6} />
    </svg>
  );
}

/* --------------------------------------------------------------- 8. contour */
export function Contour({ theme }: WallpaperProps) {
  const r = rng(19);
  const centers = Array.from({ length: 3 }, () => ({ x: r() * W, y: r() * H }));
  const op = theme === "dark" ? 0.22 : 0.35;
  const lines: string[] = [];
  for (let level = 1; level <= 9; level++) {
    centers.forEach((c) => {
      const rad = level * 62 + (r() * 14 - 7);
      lines.push(
        `M ${c.x - rad} ${c.y} a ${rad} ${rad * 0.7} 0 1 0 ${rad * 2} 0 a ${rad} ${rad * 0.7} 0 1 0 ${-rad * 2} 0`,
      );
    });
  }
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width={W} height={H} fill="var(--bg)" />
      <g fill="none" stroke="var(--muted)" strokeWidth={1} opacity={op}>
        {lines.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>
    </svg>
  );
}
