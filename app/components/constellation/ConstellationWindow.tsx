"use client";

/* ============================================================================
   Level-1 constellation: the 11 topic tracks. Click a track to open its
   drawer; "Enter this track" opens that topic's sub-constellation window.
   ========================================================================== */
import { useMemo, useState } from "react";
import {
  TOPICS,
  TOPICS_BY_ID,
  TOPIC_EDGES,
  type NodeState,
} from "@/content/curriculum";
import { subNodesFor } from "@/lib/curriculumLayout";
import { deriveStates, topicProgress, blockingPrerequisite } from "@/lib/graph";
import { useStore, select } from "@/lib/store";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useWindowActions } from "@/lib/windowContext";
import { Constellation, type CNode, type SubGraph } from "./Constellation";
import { NodeDrawer } from "./NodeDrawer";
import { Legend } from "./Legend";

const MAP_W = 860;
const MAP_H = 620;

export function ConstellationWindow() {
  const { state, dispatch } = useStore();
  const reduced = useReducedMotion();
  const win = useWindowActions();
  const [selected, setSelected] = useState<string | null>(null);

  const completedSubs = select.completedNodeIds(state);
  const startedSubs = select.startedNodeIds(state);

  const states = useMemo<Record<string, NodeState>>(() => {
    const completedTopics = new Set<string>();
    const startedTopics = new Set<string>();
    for (const t of TOPICS) {
      const subs = subNodesFor(t).map((s) => s.id);
      const prog = topicProgress(subs, completedSubs);
      if (state.nodes[t.id]?.state === "completed" || prog.complete) completedTopics.add(t.id);
      else if (
        state.nodes[t.id]?.state === "active" ||
        subs.some((id) => startedSubs.has(id) || completedSubs.has(id))
      ) {
        startedTopics.add(t.id);
      }
    }
    return deriveStates({
      nodes: TOPICS.map((t) => ({ id: t.id, prerequisites: t.prerequisites })),
      completed: completedTopics,
      started: startedTopics,
    });
  }, [state.nodes, completedSubs, startedSubs]);

  const cnodes: CNode[] = TOPICS.map((t) => ({ id: t.id, label: t.label.replace(/\n/g, " "), pos: t.pos }));

  // level-of-detail: each topic's sub-graph, revealed on zoom-in
  const { expandable, subStates } = useMemo(() => {
    const exp: Record<string, SubGraph> = {};
    const ss: Record<string, NodeState> = {};
    for (const t of TOPICS) {
      const subs = subNodesFor(t);
      if (!subs.length) continue;
      exp[t.id] = {
        nodes: subs.map((s) => ({ id: s.id, label: s.label, code: s.code, pos: s.pos })),
        edges: subs.flatMap((s) => s.prerequisites.map((p) => ({ from: p, to: s.id }))),
        space: { w: 840, h: 600 },
      };
      Object.assign(
        ss,
        deriveStates({
          nodes: subs.map((s) => ({ id: s.id, prerequisites: s.prerequisites })),
          completed: completedSubs,
          started: startedSubs,
        }),
      );
    }
    return { expandable: exp, subStates: ss };
  }, [completedSubs, startedSubs]);

  const sel = selected ? TOPICS_BY_ID[selected] : null;
  const selState = selected ? states[selected] : "locked";
  const blocker = sel
    ? blockingPrerequisite({ id: sel.id, prerequisites: sel.prerequisites }, new Set(TOPICS.filter((t) => states[t.id] === "completed").map((t) => t.id)))
    : null;

  return (
    <div style={{ position: "relative", height: "100%", display: "flex" }}>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <Constellation
          nodes={cnodes}
          edges={TOPIC_EDGES}
          states={states}
          width={MAP_W}
          height={MAP_H}
          selectedId={selected}
          reducedMotion={reduced}
          onNodeActivate={(id) => setSelected(id)}
          expandable={expandable}
          subStates={subStates}
          onExpandedActivate={(topicId) => {
            if (states[topicId] === "available")
              dispatch({ type: "startNode", nodeId: topicId, level: "topic", topicId: null });
            win.open(`subconstellation:${topicId}`);
          }}
        />
        <ZoneLabels />
        <Legend />
      </div>

      {sel && (
        <NodeDrawer
          key={sel.id}
          node={sel}
          kind="topic"
          topicLabel={sel.cluster}
          state={selState}
          blockingLabel={blocker ? TOPICS_BY_ID[blocker]?.label : null}
          onStart={() => {
            if (selState === "available") dispatch({ type: "startNode", nodeId: sel.id, level: "topic", topicId: null });
            win.open(`subconstellation:${sel.id}`);
          }}
          onComplete={() => win.open(`subconstellation:${sel.id}`)}
          onOpenChapter={() => win.open("textbook")}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

function ZoneLabels() {
  const zones = [
    { label: "FOUNDATIONS", x: 120, y: 500 },
    { label: "ANALYSIS", x: 470, y: 150 },
    { label: "OUTPUT", x: 720, y: 70 },
  ];
  return (
    <>
      {zones.map((z) => (
        <span
          key={z.label}
          style={{
            position: "absolute",
            left: `${(z.x / MAP_W) * 100}%`,
            top: `${(z.y / MAP_H) * 100}%`,
            font: "700 8px var(--font-mono)",
            letterSpacing: "0.24em",
            color: "var(--muted-foreground)",
            opacity: 0.55,
            pointerEvents: "none",
          }}
        >
          {z.label}
        </span>
      ))}
    </>
  );
}
