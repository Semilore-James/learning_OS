"use client";

/* ============================================================================
   A topic's sub-constellation. SQL and Git have hand-placed nodes; every other
   topic is auto-laid-out by lib/curriculumLayout. Marking the last sub-node
   complete rolls the parent topic node up to complete on the level-1 map.
   ========================================================================== */
import { useMemo, useState } from "react";
import { TOPICS_BY_ID, type NodeState } from "@/content/curriculum";
import { subNodesFor } from "@/lib/curriculumLayout";
import { deriveStates, blockingPrerequisite } from "@/lib/graph";
import { useStore, select } from "@/lib/store";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useWindowActions } from "@/lib/windowContext";
import { Constellation, type CNode, type CEdge } from "./Constellation";
import { NodeDrawer } from "./NodeDrawer";
import { Legend } from "./Legend";

const W = 840;
const H = 600;

export function SubConstellationWindow({ topicId }: { topicId: string }) {
  const topic = TOPICS_BY_ID[topicId];
  const { state, dispatch } = useStore();
  const reduced = useReducedMotion();
  const win = useWindowActions();
  const [selected, setSelected] = useState<string | null>(null);

  const subNodes = useMemo(() => (topic ? subNodesFor(topic) : []), [topic]);
  const completed = select.completedNodeIds(state);
  const started = select.startedNodeIds(state);

  const states = useMemo<Record<string, NodeState>>(
    () =>
      deriveStates({
        nodes: subNodes.map((s) => ({ id: s.id, prerequisites: s.prerequisites })),
        completed,
        started,
      }),
    [subNodes, completed, started],
  );

  if (!topic) return <div style={{ padding: 24 }}>Unknown track.</div>;

  const cnodes: CNode[] = subNodes.map((s) => ({ id: s.id, label: s.label, pos: s.pos }));
  const edges: CEdge[] = subNodes.flatMap((s) => s.prerequisites.map((p) => ({ from: p, to: s.id })));
  const sel = selected ? subNodes.find((s) => s.id === selected) ?? null : null;
  const selState = selected ? states[selected] ?? "locked" : "locked";
  const blockerId = sel ? blockingPrerequisite({ id: sel.id, prerequisites: sel.prerequisites }, completed) : null;
  const blockerLabel = blockerId ? subNodes.find((s) => s.id === blockerId)?.label ?? null : null;

  const remainingAfter = (doneId: string) =>
    subNodes.filter((s) => s.id !== doneId && !completed.has(s.id)).length === 0;

  return (
    <div style={{ position: "relative", height: "100%", display: "flex" }}>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <Constellation
          nodes={cnodes}
          edges={edges}
          states={states}
          width={W}
          height={H}
          labelSize={8}
          selectedId={selected}
          reducedMotion={reduced}
          onNodeClick={(id) => setSelected(id)}
        />
        <Legend />
      </div>

      {sel && (
        <NodeDrawer
          key={sel.id}
          node={sel}
          topicLabel={topic.label.replace(/\n/g, " ")}
          state={selState}
          blockingLabel={blockerLabel}
          onStart={() => dispatch({ type: "startNode", nodeId: sel.id, level: "sub", topicId: topic.id })}
          onComplete={() =>
            dispatch({
              type: "completeNode",
              nodeId: sel.id,
              level: "sub",
              topicId: topic.id,
              alsoCompleteTopic: remainingAfter(sel.id) ? topic.id : undefined,
            })
          }
          onOpenChapter={() => win.open("textbook")}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
