/* ============================================================================
   Procedural SVG wallpapers. Every one:
     - is built from CSS tokens, so it themes automatically
     - is deterministic (seeded PRNG — no jump on re-render)
     - fills a 1440x900 frame with preserveAspectRatio="xMidYMid slice"
     - has an explicit LIGHT-mode treatment (ink-on-paper), not just a dimmed
       dark treatment
     - freezes when reducedMotion is set

   Interactive dots: circles with className "wp-dot" get pointer-events back and
   a hover pop (globals.css). They do nothing else — just react.

   User-supplied raster art is added later as kind: "image" entries in
   registry.ts and never touches this file.
   ========================================================================== */
import type { WallpaperProps } from "./types";

const W = 1440;
const H = 900;

/** mulberry32 — stable seeded layouts */
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

const ACCENTS = ["var(--primary)", "var(--accent-2)", "var(--accent-3)", "var(--accent-1)"];

/* ==================================================== 1. starfield ======== */
export function Starfield({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const r = rng(11);
  const stars = Array.from({ length: 260 }, (_, i) => {
    const big = i % 17 === 0;
    const colored = i % 6 === 0;
    return {
      x: r() * W,
      y: r() * H,
      rad: big ? 1.6 + r() * 2.2 : 0.5 + r() * 1.3,
      color: colored ? ACCENTS[i % ACCENTS.length] : dark ? "#ffffff" : "var(--text)",
      base: dark ? (big ? 0.5 : 0.16 + r() * 0.28) : big ? 0.5 : 0.22 + r() * 0.22,
      dur: 3 + r() * 6,
      delay: r() * 8,
      big,
    };
  });
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="sf-glow" cx="50%" cy="44%" r="66%">
          <stop offset="0%" stopColor="var(--surface)" stopOpacity={dark ? 0.7 : 0.5} />
          <stop offset="60%" stopColor="var(--primary)" stopOpacity={dark ? 0.06 : 0.03} />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </radialGradient>
        <filter id="sf-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <rect width={W} height={H} fill="url(#sf-glow)" />
      {stars.map((s, i) => (
        <g key={i}>
          {s.big && (
            <circle cx={s.x} cy={s.y} r={s.rad * 3.2} fill={s.color} opacity={dark ? 0.22 : 0.1} filter="url(#sf-blur)" />
          )}
          <circle className="wp-dot" cx={s.x} cy={s.y} r={s.rad} fill={s.color} opacity={s.base} style={{ color: s.color }}>
            {!reducedMotion && (
              <animate
                attributeName="opacity"
                values={`${s.base};${Math.min(1, s.base * 2.4)};${s.base}`}
                dur={`${s.dur}s`}
                begin={`${s.delay}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ==================================================== 2. dot grid ======== */
export function DotGrid({ theme }: WallpaperProps) {
  const dark = theme === "dark";
  const cols: number[] = [];
  for (let x = 24; x < W; x += 32) cols.push(x);
  const rows: number[] = [];
  for (let y = 24; y < H; y += 32) rows.push(y);
  const cx = W / 2;
  const cy = H / 2;
  const maxD = Math.hypot(cx, cy);
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width={W} height={H} fill="var(--bg)" />
      {rows.map((y) =>
        cols.map((x) => {
          const d = Math.hypot(x - cx, y - cy) / maxD; // 0 centre -> 1 edge
          const near = d < 0.34;
          return (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={near ? 1.5 : 0.9}
              fill={near ? "var(--primary)" : "var(--border)"}
              opacity={(near ? 0.55 : dark ? 0.3 : 0.5) * (1 - d * 0.5)}
            />
          );
        }),
      )}
    </svg>
  );
}

/* ==================================================== 3. nebula ========== */
export function Nebula({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const o = dark ? 1 : 0.45;
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="neb-a" cx="32%" cy="36%" r="46%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3 * o} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="neb-b" cx="70%" cy="60%" r="48%">
          <stop offset="0%" stopColor="var(--accent-3)" stopOpacity={0.28 * o} />
          <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="neb-c" cx="55%" cy="22%" r="42%">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity={0.18 * o} />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <rect width={W} height={H} fill="url(#neb-a)">
        {!reducedMotion && <animate attributeName="x" values="0;44;0" dur="28s" repeatCount="indefinite" />}
      </rect>
      <rect width={W} height={H} fill="url(#neb-b)">
        {!reducedMotion && <animate attributeName="x" values="0;-34;0" dur="34s" repeatCount="indefinite" />}
      </rect>
      <rect width={W} height={H} fill="url(#neb-c)" />
    </svg>
  );
}

/* ==================================================== 4. orbital ========= */
export function Orbital({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const cx = W * 0.5;
  const cy = H * 0.5;
  const FLAT = 0.4; // vertical squash — perspective on the orbit plane
  const ringOp = dark ? 0.6 : 0.62;
  const r = rng(23);
  const rings = [110, 190, 285, 395, 520, 650].map((rad, i) => ({
    rad,
    col: ACCENTS[i % ACCENTS.length],
    size: i === 2 ? 7 : 4 + r() * 3,
    dur: 26 + rad * 0.14, // outer orbits slower
    phase: Math.round(r() * 360),
    retro: i % 3 === 2,
  }));
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="orb-c" cx="50%" cy="50%" r="10%">
          <stop offset="0%" stopColor="var(--accent-1)" stopOpacity={dark ? 0.95 : 0.7} />
          <stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <circle cx={cx} cy={cy} r={100} fill="url(#orb-c)" />
      <g transform={`translate(${cx} ${cy})`}>
        {rings.map((ring, i) => (
          <ellipse
            key={`r${i}`}
            rx={ring.rad}
            ry={ring.rad * FLAT}
            fill="none"
            stroke={ring.col}
            strokeWidth={1.5}
            opacity={ringOp}
          />
        ))}
        {/* each planet follows its own ellipse via animateMotion, so it stays
            exactly on the ring line and stays perfectly round */}
        {rings.map((ring, i) => {
          const ry = ring.rad * FLAT;
          const rad = (ring.phase * Math.PI) / 180;
          if (reducedMotion) {
            return (
              <circle
                key={`p${i}`}
                className="wp-dot"
                cx={Math.cos(rad) * ring.rad}
                cy={Math.sin(rad) * ry}
                r={ring.size}
                fill={ring.col}
                opacity={0.96}
                style={{ color: ring.col }}
              />
            );
          }
          const path = `M ${ring.rad},0 A ${ring.rad},${ry} 0 1 1 ${-ring.rad},0 A ${ring.rad},${ry} 0 1 1 ${ring.rad},0 Z`;
          const off = -(ring.phase / 360) * ring.dur;
          return (
            <circle key={`p${i}`} className="wp-dot" r={ring.size} fill={ring.col} opacity={0.96} style={{ color: ring.col }}>
              <animateMotion
                path={path}
                dur={`${ring.dur}s`}
                begin={`${off}s`}
                repeatCount="indefinite"
                keyPoints={ring.retro ? "1;0" : "0;1"}
                keyTimes="0;1"
                calcMode="linear"
              />
            </circle>
          );
        })}
        <circle r={10} fill="var(--accent-1)" opacity={0.97} />
      </g>
    </svg>
  );
}

/* ==================================================== 5. star chart ====== */
export function StarChart({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const r = rng(23);
  const N = 58;
  const pts = Array.from({ length: N }, (_, i) => ({
    x: 40 + r() * (W - 80),
    y: 40 + r() * (H - 80),
    hub: i % 7 === 0,
    color: i % 5 === 0 ? ACCENTS[i % ACCENTS.length] : dark ? "#ffffff" : "var(--text)",
  }));
  const edges: Array<[number, number]> = [];
  pts.forEach((p, i) => {
    pts
      .map((q, j) => ({ j, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 }))
      .filter((n) => n.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, p.hub ? 4 : 2)
      .forEach((n) => {
        if (!edges.some(([a, b]) => (a === n.j && b === i) || (a === i && b === n.j))) edges.push([i, n.j]);
      });
  });
  const lineOp = dark ? 0.22 : 0.32;
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="sc-glow" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="var(--accent-3)" stopOpacity={dark ? 0.1 : 0.04} />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </radialGradient>
        <filter id="sc-blur" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <rect width={W} height={H} fill="url(#sc-glow)" />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={pts[a].x}
          y1={pts[a].y}
          x2={pts[b].x}
          y2={pts[b].y}
          stroke={pts[a].hub || pts[b].hub ? "var(--primary)" : "var(--border)"}
          strokeWidth={pts[a].hub || pts[b].hub ? 1.1 : 0.8}
          opacity={lineOp}
        />
      ))}
      {pts.map((p, i) => (
        <g key={i}>
          {p.hub && <circle cx={p.x} cy={p.y} r={10} fill={p.color} opacity={dark ? 0.25 : 0.12} filter="url(#sc-blur)" />}
          <circle
            className="wp-dot"
            cx={p.x}
            cy={p.y}
            r={p.hub ? 3.6 : 1.9}
            fill={p.color}
            opacity={p.hub ? 0.95 : dark ? 0.7 : 0.6}
            style={{ color: p.color }}
          >
            {p.hub && !reducedMotion && (
              <animate attributeName="opacity" values="0.95;0.5;0.95" dur={`${5 + (i % 4)}s`} repeatCount="indefinite" />
            )}
          </circle>
        </g>
      ))}
    </svg>
  );
}

/* ==================================================== 6. aurora ========== */
export function Aurora({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const op = dark ? 0.6 : 0.3;
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="aur" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accent-3)" stopOpacity="0" />
          <stop offset="42%" stopColor="var(--primary)" stopOpacity={0.36 * op} />
          <stop offset="68%" stopColor="var(--accent-2)" stopOpacity={0.34 * op} />
          <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      {[0, 1, 2, 3].map((i) => (
        <path
          key={i}
          d={`M -200 ${170 + i * 170} C ${W * 0.3} ${50 + i * 170}, ${W * 0.7} ${320 + i * 170}, ${W + 200} ${130 + i * 170} L ${W + 200} ${H + 200} L -200 ${H + 200} Z`}
          fill="url(#aur)"
          opacity={0.7 - i * 0.14}
        >
          {!reducedMotion && (
            <animateTransform
              attributeName="transform"
              type="translate"
              values={`0 0; ${i % 2 ? -46 : 46} ${i * 6}; 0 0`}
              dur={`${20 + i * 8}s`}
              repeatCount="indefinite"
            />
          )}
        </path>
      ))}
    </svg>
  );
}

/* ==================================================== 7. grid horizon ==== */
export function GridHorizon({ theme }: WallpaperProps) {
  const dark = theme === "dark";
  const horizon = H * 0.42;
  const op = dark ? 0.45 : 0.55;
  const verticals = Array.from({ length: 27 }, (_, i) => (i - 13) / 13);
  const rows = Array.from({ length: 15 }, (_, i) => i);
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="gh-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--bg)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="gh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent-3)" stopOpacity={dark ? 0.14 : 0.06} />
          <stop offset="100%" stopColor="var(--bg)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <rect width={W} height={horizon} fill="url(#gh-sky)" />
      <g stroke="var(--primary)" strokeWidth={1} opacity={op}>
        {verticals.map((v, i) => (
          <line key={i} x1={W / 2 + v * 90} y1={horizon} x2={W / 2 + v * W} y2={H} />
        ))}
        {rows.map((i) => {
          const t = i / rows.length;
          const y = horizon + Math.pow(t, 2.2) * (H - horizon);
          return <line key={`r${i}`} x1={0} y1={y} x2={W} y2={y} />;
        })}
      </g>
      <rect width={W} height={horizon + 40} fill="url(#gh-fade)" />
      <line x1={0} y1={horizon} x2={W} y2={horizon} stroke="var(--accent-2)" strokeWidth={1.6} opacity={0.7} />
    </svg>
  );
}

/* ==================================================== 8. contour ========= */
export function Contour({ theme }: WallpaperProps) {
  const dark = theme === "dark";
  const r = rng(31);
  const centers = Array.from({ length: 3 }, () => ({ x: r() * W, y: r() * H }));
  const op = dark ? 0.24 : 0.34;
  const lines: Array<{ d: string; hot: boolean }> = [];
  for (let level = 1; level <= 10; level++) {
    centers.forEach((c) => {
      const rad = level * 58 + (r() * 16 - 8);
      lines.push({
        d: `M ${c.x - rad} ${c.y} a ${rad} ${rad * 0.72} 0 1 0 ${rad * 2} 0 a ${rad} ${rad * 0.72} 0 1 0 ${-rad * 2} 0`,
        hot: level <= 2,
      });
    });
  }
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width={W} height={H} fill="var(--bg)" />
      <g fill="none" strokeWidth={1} opacity={op}>
        {lines.map((l, i) => (
          <path key={i} d={l.d} stroke={l.hot ? "var(--accent-1)" : "var(--muted-foreground)"} />
        ))}
      </g>
    </svg>
  );
}

/* ==================================================== 9. quasar ========== */
/* inspired by a bright galactic core with bipolar jets */
export function Quasar({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const cx = W * 0.5;
  const cy = H * 0.52;
  const r = rng(41);
  const dust = Array.from({ length: 190 }, (_, i) => {
    const base = dark ? 0.32 + r() * 0.4 : 0.2 + r() * 0.25;
    return {
      a: r() * Math.PI * 2,
      d: 40 + r() * 520,
      rad: 0.6 + r() * 1.8,
      c: ACCENTS[i % ACCENTS.length],
      base,
      dur: 2.2 + r() * 5,
      delay: r() * 6,
      blink: i % 3 === 0,
    };
  });
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="q-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={dark ? 1 : 0.85} />
          <stop offset="30%" stopColor="var(--accent-1)" stopOpacity={dark ? 0.9 : 0.6} />
          <stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="q-jet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity={dark ? 0.5 : 0.3} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="q-disc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--accent-3)" stopOpacity="0" />
          <stop offset="55%" stopColor="var(--primary)" stopOpacity={dark ? 0.22 : 0.12} />
          <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <g transform={`translate(${cx} ${cy}) rotate(-24)`}>
        <ellipse rx={620} ry={210} fill="url(#q-disc)" />
        {dust.map((p, i) => (
          <circle
            key={i}
            className="wp-dot"
            cx={Math.cos(p.a) * p.d}
            cy={Math.sin(p.a) * p.d * 0.36}
            r={p.rad}
            fill={p.c}
            opacity={p.base}
            style={{ color: p.c }}
          >
            {!reducedMotion && p.blink && (
              <animate
                attributeName="opacity"
                values={`${p.base};${Math.min(1, p.base * 2.6)};${p.base}`}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
        <rect x={-26} y={-560} width={52} height={1120} fill="url(#q-jet)">
          {!reducedMotion && <animate attributeName="opacity" values="0.7;1;0.7" dur="6s" repeatCount="indefinite" />}
        </rect>
        <circle r={120} fill="url(#q-core)" />
        <circle r={5} fill="#fff" />
      </g>
    </svg>
  );
}

/* ==================================================== 10. nightside ====== */
/* the overview effect — looking across a planet's limb from low orbit, the
   atmosphere lit as a thin band on the horizon, deep space above */
export function Nightside({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const pcx = W * 0.5;
  const pcy = H * 1.72; // planet centre well below frame — we see only the top arc
  const R = H * 1.45;
  const r = rng(53);
  const stars = Array.from({ length: 150 }, (_, i) => ({
    x: r() * W,
    y: r() * (pcy - R) * 0.98,
    rad: i % 13 === 0 ? 1.4 + r() * 1.4 : 0.4 + r() * 1,
    base: dark ? 0.15 + r() * 0.4 : 0.2 + r() * 0.25,
    dur: 3 + r() * 6,
    delay: r() * 8,
    blink: i % 4 === 0,
  }));
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="ns-space" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--bg)" />
          <stop offset="100%" stopColor={dark ? "#0a1120" : "#dfe6f0"} />
        </linearGradient>
        <linearGradient id="ns-atmo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
          <stop offset="55%" stopColor="var(--primary)" stopOpacity={dark ? 0.5 : 0.3} />
          <stop offset="78%" stopColor="var(--accent-2)" stopOpacity={dark ? 0.55 : 0.32} />
          <stop offset="100%" stopColor="var(--accent-1)" stopOpacity={dark ? 0.5 : 0.28} />
        </linearGradient>
        <radialGradient id="ns-terra" cx="50%" cy="0%" r="60%">
          <stop offset="0%" stopColor={dark ? "#12203a" : "#c9d4e6"} />
          <stop offset="100%" stopColor={dark ? "#050810" : "#e9edf4"} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ns-space)" />
      {stars.map((s, i) => (
        <circle key={i} className="wp-dot" cx={s.x} cy={s.y} r={s.rad} fill={dark ? "#fff" : "var(--text)"} opacity={s.base} style={{ color: dark ? "#fff" : "var(--text)" }}>
          {!reducedMotion && s.blink && (
            <animate attributeName="opacity" values={`${s.base};${Math.min(1, s.base * 2.6)};${s.base}`} dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
          )}
        </circle>
      ))}
      {/* atmosphere band follows the limb */}
      <path d={`M ${pcx - R},${pcy} A ${R} ${R} 0 0 1 ${pcx + R},${pcy}`} fill="none" stroke="url(#ns-atmo)" strokeWidth={70} opacity={0.9} />
      {/* the planet body */}
      <circle cx={pcx} cy={pcy} r={R} fill="url(#ns-terra)" />
      <circle cx={pcx} cy={pcy} r={R} fill="none" stroke="var(--accent-2)" strokeWidth={2} opacity={dark ? 0.5 : 0.3} />
    </svg>
  );
}

/* ==================================================== 11. luna =========== */
/* a crescent moon — real terminator, shadowed craters near the lit edge */
export function Luna({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const cx = W * 0.56;
  const cy = H * 0.46;
  const R = 300;
  const r = rng(67);
  const stars = Array.from({ length: 110 }, (_, i) => ({
    x: r() * W,
    y: r() * H,
    rad: i % 15 === 0 ? 1.3 + r() * 1.3 : 0.4 + r() * 1,
    base: dark ? 0.12 + r() * 0.36 : 0.18 + r() * 0.22,
    dur: 3 + r() * 6,
    delay: r() * 8,
    blink: i % 5 === 0,
  }));
  // craters sit on the whole disc; those near the lit (right) edge read best
  const craters = Array.from({ length: 30 }, () => {
    const a = r() * Math.PI * 2;
    const d = Math.sqrt(r()) * R * 0.9;
    return { x: cx + Math.cos(a) * d, y: cy + Math.sin(a) * d, rad: 6 + r() * 26 };
  });
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="lu2-lit" cx="72%" cy="40%" r="75%">
          <stop offset="0%" stopColor={dark ? "#eef0f4" : "#f0ece0"} />
          <stop offset="60%" stopColor={dark ? "#b9c0cd" : "#cdc7b6"} />
          <stop offset="100%" stopColor={dark ? "#7c8494" : "#a49d8b"} />
        </radialGradient>
        <clipPath id="lu2-clip">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
        <radialGradient id="lu2-halo" cx="50%" cy="50%" r="50%">
          <stop offset="72%" stopColor="var(--primary)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity={dark ? 0.14 : 0.07} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      {stars.map((s, i) => (
        <circle key={i} className="wp-dot" cx={s.x} cy={s.y} r={s.rad} fill={dark ? "#fff" : "var(--text)"} opacity={s.base} style={{ color: dark ? "#fff" : "var(--text)" }}>
          {!reducedMotion && s.blink && (
            <animate attributeName="opacity" values={`${s.base};${Math.min(1, s.base * 2.6)};${s.base}`} dur={`${s.dur}s`} begin={`${s.delay}s`} repeatCount="indefinite" />
          )}
        </circle>
      ))}
      <circle cx={cx} cy={cy} r={R * 1.5} fill="url(#lu2-halo)" />
      <circle cx={cx} cy={cy} r={R} fill="url(#lu2-lit)" />
      <g clipPath="url(#lu2-clip)">
        {craters.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={c.rad} fill={dark ? "#6b7383" : "#948d7b"} opacity={0.45} />
            <circle cx={c.x - c.rad * 0.22} cy={c.y - c.rad * 0.22} r={c.rad * 0.82} fill={dark ? "#c6cdd9" : "#ddd7c6"} opacity={0.4} />
          </g>
        ))}
        {/* terminator: a shadow disc offset left carves the crescent */}
        <circle cx={cx - R * 0.62} cy={cy - R * 0.06} r={R * 1.06} fill="var(--bg)" opacity={0.97} />
        <circle cx={cx - R * 0.5} cy={cy - R * 0.04} r={R * 1.02} fill="var(--bg)" opacity={0.55} />
      </g>
    </svg>
  );
}
