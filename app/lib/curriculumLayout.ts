/* ============================================================================
   Sub-constellation layout. SQL and Git have hand-placed nodes in
   content/curriculum.ts. Every other topic carries `plannedSubNodes` (labels
   only, from the PRD). This lays those out into a flowing left-to-right path,
   with a linear prerequisite chain, so every topic has a working
   sub-constellation now. Hand-tuning individual topics later just means
   filling in that topic's `subNodes` array — this function stops being used
   for it. (Build plan step 7.)
   ========================================================================== */
import type { SubNode, TopicNode } from "@/content/curriculum";

function slug(label: string): string {
  return label
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const W = 820;
const H = 560;

export function subNodesFor(topic: TopicNode): SubNode[] {
  if (topic.subNodes.length) return topic.subNodes;

  const labels = topic.plannedSubNodes ?? [];
  const n = labels.length;
  if (n === 0) return [];

  // serpentine path: rows of ~6, alternating direction, gentle vertical drift
  const perRow = 6;
  const rows = Math.ceil(n / perRow);
  const rowH = (H - 120) / Math.max(1, rows - 1 || 1);
  const colW = (W - 140) / (perRow - 1);

  return labels.map((label, i) => {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const goingRight = row % 2 === 0;
    const x = 70 + (goingRight ? col : perRow - 1 - col) * colW + ((i * 13) % 18) - 9;
    const y = 60 + row * rowH + ((i * 7) % 22) - 11;
    const id = slug(label) || `n${i}`;
    return {
      id,
      label,
      prerequisites: i === 0 ? [] : [slug(labels[i - 1]) || `n${i - 1}`],
      chapters: [`${topic.id}/${String(i + 1).padStart(2, "0")}-${id}`],
      estHours: 1.5,
      pos: { x, y, r: i % 5 === 0 ? 12 : 10 },
    };
  });
}
