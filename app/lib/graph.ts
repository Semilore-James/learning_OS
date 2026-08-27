/* ============================================================================
   Curriculum graph traversal (FROZEN CONTRACT with content/curriculum.ts).
   ----------------------------------------------------------------------------
   Node state is DERIVED, never stored. Given the set of completed node ids
   (and, optionally, node ids currently flagged for spaced-repetition review),
   this computes every node's display state by walking prerequisite edges.

     locked        -> at least one prerequisite is not completed
     available     -> all prerequisites completed, not started
     active        -> started (in progress) but not completed
     completed     -> done, and not currently due for review
     needs-review  -> completed but the review queue says it is due

   Same function serves the level-1 topic map and every sub-constellation.
   ========================================================================== */

import type { NodeState } from "@/content/curriculum";

export interface GraphNode {
  id: string;
  prerequisites: string[];
}

export interface DeriveInput {
  nodes: GraphNode[];
  completed: Set<string>;
  started?: Set<string>;
  dueForReview?: Set<string>;
}

export function deriveStates(input: DeriveInput): Record<string, NodeState> {
  const { nodes, completed, started = new Set(), dueForReview = new Set() } =
    input;
  const out: Record<string, NodeState> = {};

  for (const node of nodes) {
    if (completed.has(node.id)) {
      out[node.id] = dueForReview.has(node.id) ? "needs-review" : "completed";
      continue;
    }
    if (started.has(node.id)) {
      out[node.id] = "active";
      continue;
    }
    const unlocked = node.prerequisites.every((p) => completed.has(p));
    out[node.id] = unlocked ? "available" : "locked";
  }

  return out;
}

/** First unmet prerequisite for a node, for the "Complete X first" hint. */
export function blockingPrerequisite(
  node: GraphNode,
  completed: Set<string>,
): string | null {
  return node.prerequisites.find((p) => !completed.has(p)) ?? null;
}

/** Topic progress: how many sub-nodes are done, for the level-1 drawer bar. */
export function topicProgress(
  subNodeIds: string[],
  completed: Set<string>,
): { done: number; total: number; complete: boolean } {
  const total = subNodeIds.length;
  const done = subNodeIds.filter((id) => completed.has(id)).length;
  return { done, total, complete: total > 0 && done === total };
}
