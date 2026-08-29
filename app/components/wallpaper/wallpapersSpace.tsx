/* ============================================================================
   Space wallpapers, batch 2 — Milky Way, Galaxy, Black Hole, Space Station,
   Saturn. Same rules as wallpapers.tsx: token-driven, deterministic, full-bleed,
   explicit light treatment, freeze on reducedMotion.

   The black hole uses "density plotting": thousands of small dots whose count
   per patch tracks the brightness of the accretion disk, coloured from a
   blue-white inner edge through orange to deep red at the rim.
   ========================================================================== */
import type { WallpaperProps } from "./types";

const W = 1440;
const H = 900;

const frame = {
  position: "absolute" as const,
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none" as const,
  display: "block" as const,
};

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Field({ n, seed, dark, twinkle }: { n: number; seed: number; dark: boolean; twinkle: boolean }) {
  const r = rng(seed);
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = r() * W;
        const y = r() * H;
        const big = i % 16 === 0;
        const rad = big ? 1.2 + r() * 1.6 : 0.35 + r() * 0.95;
        const base = dark ? (big ? 0.5 : 0.12 + r() * 0.34) : big ? 0.45 : 0.16 + r() * 0.22;
        const dur = 3 + r() * 6;
        const delay = r() * 8;
        const blink = twinkle && i % 4 === 0;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={rad}
            fill={dark ? "#ffffff" : "var(--text)"}
            opacity={base}
          >
            {blink && (
              <animate
                attributeName="opacity"
                values={`${base};${Math.min(1, base * 2.6)};${base}`}
                dur={`${dur}s`}
                begin={`${delay}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        );
      })}
    </>
  );
}

/* ==================================================== milky way =========== */
export function MilkyWay({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const r = rng(101);
  // a diagonal band; sample points with a gaussian across the band's short axis
  const band = Array.from({ length: 1400 }, (_, i) => {
    const t = r();
    // position along the band 0..1
    const along = t;
    // gaussian-ish offset across the band
    const off = (r() + r() + r() - 1.5) / 1.5; // ~[-1,1] bunched at 0
    const bx = -120 + along * (W + 240);
    const by = H * 0.12 + along * H * 0.72 + off * (90 + Math.sin(along * 6) * 40);
    const core = Math.abs(along - 0.52) < 0.16; // brighter towards the centre
    const dust = Math.abs(off) < 0.18 && r() < 0.5; // dark lane near the spine
    const pinkish = i % 23 === 0;
    return {
      x: bx,
      y: by,
      rad: (core ? 0.6 : 0.35) + r() * (core ? 1.5 : 1),
      c: dust ? "var(--bg)" : pinkish ? "var(--accent-3)" : core ? "#ffffff" : "var(--primary)",
      op: dust ? (dark ? 0.5 : 0.35) : (core ? 0.7 : 0.28) * (dark ? 1 : 0.8),
    };
  });
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="mw-band" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
          <stop offset="45%" stopColor="var(--primary)" stopOpacity={dark ? 0.13 : 0.07} />
          <stop offset="55%" stopColor="var(--accent-3)" stopOpacity={dark ? 0.12 : 0.06} />
          <stop offset="100%" stopColor="var(--accent-3)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <rect width={W} height={H} fill="url(#mw-band)" />
      <Field n={220} seed={7} dark={dark} twinkle={!reducedMotion} />
      {band.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.rad} fill={p.c} opacity={p.op} style={{ color: p.c }} />
      ))}
    </svg>
  );
}

/* ==================================================== galaxy ============== */
export function Galaxy({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const cx = W * 0.5;
  const cy = H * 0.5;
  const r = rng(202);
  const ARMS = 2;
  const stars = Array.from({ length: 1600 }, (_, i) => {
    const arm = i % ARMS;
    const dist = Math.pow(r(), 0.6); // denser toward the core
    const rad = 60 + dist * 560;
    const wind = 3.4; // how tightly the arms wind
    const theta = (arm / ARMS) * Math.PI * 2 + dist * wind + (r() - 0.5) * 0.55;
    const x = cx + Math.cos(theta) * rad;
    const y = cy + Math.sin(theta) * rad * 0.42; // inclined disc
    const core = dist < 0.16;
    return {
      x,
      y,
      rad: (core ? 0.7 : 0.35) + r() * (core ? 1.6 : 0.9),
      c: core ? "var(--accent-1)" : i % 17 === 0 ? "var(--accent-2)" : dark ? "#dfe6ff" : "var(--primary)",
      op: (core ? 0.75 : 0.3 + r() * 0.35) * (dark ? 1 : 0.85),
    };
  });
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="gx-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={dark ? 0.9 : 0.6} />
          <stop offset="35%" stopColor="var(--accent-1)" stopOpacity={dark ? 0.5 : 0.3} />
          <stop offset="100%" stopColor="var(--accent-1)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gx-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity={dark ? 0.16 : 0.08} />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <Field n={180} seed={9} dark={dark} twinkle={!reducedMotion} />
      <g transform={`rotate(-18 ${cx} ${cy})`}>
        <ellipse cx={cx} cy={cy} rx={620} ry={280} fill="url(#gx-halo)" />
        {stars.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.rad} fill={p.c} opacity={p.op} style={{ color: p.c }}>
            {!reducedMotion && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${cx} ${cy}`}
                to={`360 ${cx} ${cy}`}
                dur="240s"
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}
        <ellipse cx={cx} cy={cy} rx={150} ry={70} fill="url(#gx-core)" />
        <circle cx={cx} cy={cy} r={4} fill="#fff" />
      </g>
      {/* two distant companion galaxies */}
      <ellipse cx={W * 0.16} cy={H * 0.2} rx={34} ry={12} fill="var(--primary)" opacity={dark ? 0.4 : 0.25} transform={`rotate(20 ${W * 0.16} ${H * 0.2})`} />
      <ellipse cx={W * 0.85} cy={H * 0.8} rx={22} ry={9} fill="var(--accent-3)" opacity={dark ? 0.4 : 0.25} transform={`rotate(-35 ${W * 0.85} ${H * 0.8})`} />
    </svg>
  );
}

/* ==================================================== black hole ========== */
export function BlackHole({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const cx = W * 0.5;
  const cy = H * 0.5;
  const EH = 150; // event horizon radius
  const r = rng(303);
  const F = 0.34; // disk flatten — near edge-on but with visible height

  const rampColour = (t: number, approaching: boolean) => {
    // t: 0 hot inner .. 1 cool rim
    if (t < 0.1) return "#ffffff";
    if (t < 0.24) return approaching ? "#bcd4ff" : "#ffe9d0"; // marine/royal blue vs warm white
    if (t < 0.4) return approaching ? "#7fb0ff" : "#ffcaa0";
    if (t < 0.58) return "#ffab5c";
    if (t < 0.78) return "#ff7a3c";
    return "#d63b26"; // deep red
  };

  // FLAT DISK — density-plotted: dot count and opacity fall off with radius,
  // the approaching (left) half is boosted, the receding (right) half dimmed.
  const DOTS = 3400;
  const disk = Array.from({ length: DOTS }, () => {
    const u = Math.pow(r(), 1.9); // bunch toward the hot inner edge
    const rad = EH * 1.06 + u * EH * 4.6;
    const t = (rad - EH * 1.06) / (EH * 4.6);
    const ang = r() * Math.PI * 2;
    const approaching = Math.cos(ang) < 0; // left half toward us
    const boost = approaching ? 1.5 : 0.55;
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad * F;
    const op = Math.max(0.06, Math.min(1, ((1 - t) * 0.7 + 0.12) * boost)) * (dark ? 1 : 0.72);
    return { x, y, rad: 0.7 + r() * (t < 0.35 ? 2 : 1.2), c: rampColour(t, approaching), op };
  });

  // LENSED HALO — the far side of the disk bent up over the top and down under
  // the bottom of the hole, so it reads as a near-circular ring, not flat.
  const halo = Array.from({ length: 1600 }, () => {
    const upper = r() < 0.5;
    const ang = (upper ? Math.PI : 0) + (r() - 0.5) * Math.PI * 0.9;
    const rad = EH * (1.03 + Math.pow(r(), 2) * 0.9);
    const x = cx + Math.cos(ang) * rad;
    const y = cy + Math.sin(ang) * rad; // full circle here — strong lensing
    const t = r();
    const approaching = Math.cos(ang) < 0;
    const op = (0.75 - t * 0.55) * (approaching ? 1.3 : 0.7) * (dark ? 1 : 0.72);
    return { x, y, rad: 0.7 + r() * 1.6, c: rampColour(t * 0.7, approaching), op: Math.max(0.05, op) };
  });

  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <radialGradient id="bh-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff2dc" stopOpacity={dark ? 0.5 : 0.28} />
          <stop offset="24%" stopColor="#ff9d4d" stopOpacity={dark ? 0.28 : 0.14} />
          <stop offset="60%" stopColor="#d63b26" stopOpacity={dark ? 0.1 : 0.05} />
          <stop offset="100%" stopColor="#d63b26" stopOpacity="0" />
        </radialGradient>
        <filter id="bh-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="0.9" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={dark ? "#03040a" : "#eceef4"} />
      <Field n={130} seed={11} dark={dark} twinkle={!reducedMotion} />
      <ellipse cx={cx} cy={cy} rx={EH * 6} ry={EH * 3.4} fill="url(#bh-bloom)" />

      <g>
        {!reducedMotion && (
          <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`360 ${cx} ${cy}`} dur="120s" repeatCount="indefinite" />
        )}
        {/* far-side halo, behind the shadow */}
        <g filter="url(#bh-soft)">
          {halo.map((p, i) => (
            <circle key={`h${i}`} cx={p.x} cy={p.y} r={p.rad} fill={p.c} opacity={p.op} />
          ))}
        </g>
        {/* the shadow */}
        <circle cx={cx} cy={cy} r={EH} fill="#000000" />
        {/* photon ring — thin, blistering */}
        <circle cx={cx} cy={cy} r={EH + 1.5} fill="none" stroke="#fff4e2" strokeWidth={3} opacity={0.95} />
        <circle cx={cx} cy={cy} r={EH + 1.5} fill="none" stroke="#ffb057" strokeWidth={6} opacity={0.35} />
        {/* the disk, in front of the shadow's lower half */}
        <g filter="url(#bh-soft)">
          {disk.map((p, i) => (
            <circle key={`d${i}`} cx={p.x} cy={p.y} r={p.rad} fill={p.c} opacity={p.op} />
          ))}
        </g>
      </g>
    </svg>
  );
}

/* ==================================================== space station ====== */
export function SpaceStation({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const cx = W * 0.52;
  const cy = H * 0.46;
  const panel = dark ? "#1c2b4a" : "#8fa6c9";
  const hull = dark ? "#b9c0cd" : "#6b7280";
  const gold = "var(--accent-1)";
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="ss-limb" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--accent-2)" stopOpacity={dark ? 0.5 : 0.3} />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <Field n={200} seed={13} dark={dark} twinkle={!reducedMotion} />
      {/* planet limb at the bottom */}
      <circle cx={W * 0.5} cy={H * 2.1} r={H * 1.7} fill={dark ? "#0a1526" : "#cdd8e8"} />
      <path d={`M 0 ${H * 0.72} Q ${W * 0.5} ${H * 0.52} ${W} ${H * 0.72} L ${W} ${H} L 0 ${H} Z`} fill="url(#ss-limb)" />

      <g transform={`translate(${cx} ${cy}) rotate(-16)`}>
        {/* central truss */}
        <rect x={-360} y={-7} width={720} height={14} fill={hull} />
        {[-300, -170, 170, 300].map((x, i) => (
          <g key={i}>
            {/* solar wings */}
            <rect x={x - 6} y={-140} width={12} height={280} fill={hull} />
            <rect x={x - 150} y={-132} width={140} height={120} fill={panel} stroke={gold} strokeWidth={1} opacity={0.92} />
            <rect x={x + 10} y={-132} width={140} height={120} fill={panel} stroke={gold} strokeWidth={1} opacity={0.92} />
            <rect x={x - 150} y={12} width={140} height={120} fill={panel} stroke={gold} strokeWidth={1} opacity={0.92} />
            <rect x={x + 10} y={12} width={140} height={120} fill={panel} stroke={gold} strokeWidth={1} opacity={0.92} />
            {/* panel grid lines */}
            {[0.25, 0.5, 0.75].map((f) => (
              <line key={f} x1={x - 150} x2={x + 150} y1={-132 + 120 * f} y2={-132 + 120 * f} stroke="var(--bg)" strokeWidth={1} opacity={0.4} />
            ))}
          </g>
        ))}
        {/* modules along the spine */}
        <rect x={-70} y={-22} width={140} height={44} rx={20} fill={hull} />
        <rect x={-140} y={-16} width={70} height={32} rx={14} fill={dark ? "#8b93a6" : "#9aa2b0"} />
        <rect x={70} y={-16} width={90} height={32} rx={14} fill={dark ? "#8b93a6" : "#9aa2b0"} />
        <circle cx={0} cy={0} r={7} fill={gold} opacity={0.9}>
          {!reducedMotion && <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />}
        </circle>
        <rect x={-6} y={-70} width={12} height={48} fill={hull} />
        <circle cx={0} cy={-78} r={10} fill={dark ? "#8b93a6" : "#9aa2b0"} />
      </g>
    </svg>
  );
}

/* ==================================================== saturn ============== */
export function Saturn({ theme, reducedMotion }: WallpaperProps) {
  const dark = theme === "dark";
  const cx = W * 0.52;
  const cy = H * 0.48;
  const R = 210;
  const r = rng(404);
  const ringDots = Array.from({ length: 1500 }, () => {
    const gap = r();
    // Cassini division around 0.42
    let rr = 1.24 + r() * 1.05;
    if (Math.abs(rr - 1.62) < 0.05) rr = 1.7 + r() * 0.3;
    const ang = r() * Math.PI * 2;
    const x = Math.cos(ang) * R * rr;
    const y = Math.sin(ang) * R * rr * 0.32;
    const bright = gap > 0.6;
    return {
      x,
      y,
      rad: 0.4 + r() * 1.1,
      c: bright ? "var(--accent-1)" : dark ? "#d8cdb6" : "#b6a988",
      op: (0.2 + r() * 0.45) * (dark ? 1 : 0.75),
      back: y < 0, // behind the planet
    };
  });
  return (
    <svg style={frame} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="sat-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={dark ? "#e6cfa0" : "#d8c39a"} />
          <stop offset="45%" stopColor={dark ? "#d4b17a" : "#c7ad82"} />
          <stop offset="100%" stopColor={dark ? "#9c8258" : "#a68f6c"} />
        </linearGradient>
        <clipPath id="sat-clip">
          <circle cx={cx} cy={cy} r={R} />
        </clipPath>
        <radialGradient id="sat-halo" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="var(--accent-1)" stopOpacity="0" />
          <stop offset="100%" stopColor="var(--accent-1)" stopOpacity={dark ? 0.12 : 0.06} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="var(--bg)" />
      <Field n={170} seed={17} dark={dark} twinkle={!reducedMotion} />
      <circle cx={cx} cy={cy} r={R * 2.6} fill="url(#sat-halo)" />

      <g transform={`translate(${cx} ${cy}) rotate(-14)`}>
        {/* rings behind */}
        <g transform={`translate(${-cx} ${-cy})`}>
          {ringDots.filter((d) => d.back).map((p, i) => (
            <circle key={`rb${i}`} cx={cx + p.x} cy={cy + p.y} r={p.rad} fill={p.c} opacity={p.op} style={{ color: p.c }} />
          ))}
        </g>
        {/* planet */}
        <circle cx={0} cy={0} r={R} fill="url(#sat-body)" />
        <g clipPath="url(#sat-clip)" transform={`translate(${-cx} ${-cy})`}>
          {[-0.55, -0.28, 0, 0.3, 0.58].map((f, i) => (
            <ellipse key={i} cx={cx} cy={cy + f * R} rx={R} ry={R * 0.14} fill={dark ? "#c8a874" : "#bfa680"} opacity={0.35} />
          ))}
          {/* ring shadow band on the planet */}
          <ellipse cx={cx} cy={cy - R * 0.05} rx={R} ry={R * 0.09} fill="var(--bg)" opacity={0.28} />
          {/* night side */}
          <circle cx={cx + R * 0.7} cy={cy - R * 0.2} r={R} fill="var(--bg)" opacity={dark ? 0.42 : 0.28} />
        </g>
        {/* rings in front */}
        <g transform={`translate(${-cx} ${-cy})`}>
          {ringDots.filter((d) => !d.back).map((p, i) => (
            <circle key={`rf${i}`} cx={cx + p.x} cy={cy + p.y} r={p.rad} fill={p.c} opacity={p.op} style={{ color: p.c }} />
          ))}
        </g>
        {/* a moon */}
        <circle cx={430} cy={-120} r={6} fill={dark ? "#cfd4de" : "#9a9484"} opacity={0.9} />
      </g>
    </svg>
  );
}
