/* ============================================================================
   Sub-constellation layout. SQL and Git have hand-placed nodes in
   content/curriculum.ts. Every other topic carries `plannedSubNodes` (labels
   only, from the PRD). This turns those into a branching, asterism-style star
   map — three tiers (fundamentals -> intermediate -> advanced), nodes
   scattered irregularly within each tier and relaxed apart, prerequisite edges
   drawn to the 1-2 nearest nodes in the previous tier. Nothing linear.

   Every sub-node also gets a short course code ("XL 04") for the map label;
   the full name shows in the drawer.  (Build plan step 7.)
   ========================================================================== */
import type { SubNode, TopicNode } from "@/content/curriculum";
import { TOPIC_CODE } from "@/content/curriculum";

function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 840;
const H = 600;
const MARGIN = 60;
const MIN_DIST = 104;

interface P {
  x: number;
  y: number;
}

/** push overlapping points apart, a few passes */
function relax(pts: P[]) {
  for (let pass = 0; pass < 24; pass++) {
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x;
        const dy = pts[j].y - pts[i].y;
        const d = Math.hypot(dx, dy) || 0.01;
        if (d < MIN_DIST) {
          const push = (MIN_DIST - d) / 2;
          const ux = dx / d;
          const uy = dy / d;
          pts[i].x -= ux * push;
          pts[i].y -= uy * push;
          pts[j].x += ux * push;
          pts[j].y += uy * push;
        }
      }
    }
    for (const p of pts) {
      p.x = Math.max(MARGIN, Math.min(W - MARGIN, p.x));
      p.y = Math.max(MARGIN, Math.min(H - MARGIN, p.y));
    }
  }
}

function hashSeed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

export function subNodesFor(topic: TopicNode): SubNode[] {
  // hand-authored track: just make sure every node has a code
  if (topic.subNodes.length) {
    const prefix = TOPIC_CODE[topic.id] ?? topic.id.slice(0, 3).toUpperCase();
    return topic.subNodes.map((n, i) => ({
      ...n,
      code: n.code ?? `${prefix} ${String(i + 1).padStart(2, "0")}`,
    }));
  }

  const labels = topic.plannedSubNodes ?? [];
  const n = labels.length;
  if (n === 0) return [];

  const prefix = TOPIC_CODE[topic.id] ?? topic.id.slice(0, 3).toUpperCase();
  const r = rng(hashSeed(topic.id));

  // three tiers
  const t1 = Math.max(1, Math.round(n * 0.34));
  const t2 = Math.max(1, Math.round(n * 0.33));
  const tierOf = (i: number) => (i < t1 ? 0 : i < t1 + t2 ? 1 : 2);
  const bands = [
    { x0: MARGIN, x1: W * 0.36 },
    { x0: W * 0.32, x1: W * 0.68 },
    { x0: W * 0.62, x1: W - MARGIN },
  ];

  const pts: P[] = labels.map((_, i) => {
    const b = bands[tierOf(i)];
    return {
      x: b.x0 + r() * (b.x1 - b.x0),
      y: MARGIN + r() * (H - 2 * MARGIN),
    };
  });
  relax(pts);

  const ids = labels.map((l) => slug(l) || `n${labels.indexOf(l)}`);

  const nodes: SubNode[] = labels.map((label, i) => {
    const tier = tierOf(i);
    let prerequisites: string[] = [];
    if (tier === 0) {
      prerequisites = i === 0 ? [] : [ids[0]];
    } else {
      // connect to the 1-2 nearest nodes in the previous tier
      const prevRange = tier === 1 ? [0, t1] : [t1, t1 + t2];
      const near = [];
      for (let j = prevRange[0]; j < prevRange[1]; j++) {
        near.push({ id: ids[j], d: Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y) });
      }
      near.sort((a, b) => a.d - b.d);
      prerequisites = near.slice(0, 1 + (r() > 0.5 ? 1 : 0)).map((x) => x.id);
    }
    return {
      id: ids[i],
      label,
      code: `${prefix} ${String(i + 1).padStart(2, "0")}`,
      prerequisites,
      chapters: [`${topic.id}/${String(i + 1).padStart(2, "0")}-${ids[i]}`],
      estHours: 1.5,
      pos: { x: pts[i].x, y: pts[i].y, r: tier === 0 ? 12 : tier === 1 ? 11 : 10 },
    };
  });

  return nodes;
}
