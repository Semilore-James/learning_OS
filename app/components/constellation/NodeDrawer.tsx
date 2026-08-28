"use client";

/* ============================================================================
   The node drawer — slides in on the right of a constellation window.
   Tabs: Resources | Tasks | Notes | Textbook (PRD 6.6 / Userflow 5).
   Notes are real and sync through the store. Resources / Tasks show what will
   fill them (videos import at step 15, cases author at step 16).
   ========================================================================== */
import { useState } from "react";
import type { NodeState, SubNode, TopicNode } from "@/content/curriculum";
import { useStore } from "@/lib/store";

type Tab = "resources" | "tasks" | "notes" | "textbook";

const TABS: { id: Tab; label: string }[] = [
  { id: "resources", label: "Resources" },
  { id: "tasks", label: "Tasks" },
  { id: "notes", label: "Notes" },
  { id: "textbook", label: "Textbook" },
];

export function NodeDrawer({
  node,
  topicLabel,
  state,
  blockingLabel,
  onStart,
  onComplete,
  onOpenChapter,
  onClose,
}: {
  node: SubNode | TopicNode;
  topicLabel: string;
  state: NodeState;
  blockingLabel: string | null;
  onStart: () => void;
  onComplete: () => void;
  onOpenChapter: (slug: string) => void;
  onClose: () => void;
}) {
  const { state: s, dispatch } = useStore();
  const [tab, setTab] = useState<Tab>("resources");
  const [note, setNote] = useState(s.notes[node.id] ?? "");
  const chapters = "chapters" in node ? node.chapters : [];

  const commitNote = () => {
    if (note !== (s.notes[node.id] ?? "")) dispatch({ type: "saveNote", nodeId: node.id, body: note });
  };

  return (
    <aside
      style={{
        width: 288,
        minWidth: 288,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        borderLeft: "var(--bd)",
        animation: "fadeIn .18s ease",
      }}
    >
      <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", display: "flex", gap: 8, alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ font: "600 14px var(--font-display)", color: "var(--text)", lineHeight: 1.25 }}>{node.label}</div>
          <div style={{ marginTop: 4, font: "400 9px var(--font-mono)", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {topicLabel}
            {"estHours" in node ? ` · ~${node.estHours}h` : ""}
          </div>
        </div>
        <button
          type="button"
          aria-label="Close drawer"
          onClick={onClose}
          style={{ background: "none", border: "none", color: "var(--muted)", font: "700 13px var(--font-mono)", cursor: "pointer" }}
        >
          ×
        </button>
      </div>

      {/* blurb / status line */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid var(--border)", font: "300 12px var(--font-body)", color: "var(--muted)" }}>
        {state === "locked"
          ? `Locked. Complete ${blockingLabel ?? "the prerequisite"} first.`
          : "blurb" in node
            ? node.blurb
            : state === "completed"
              ? "Completed. Notes stay editable."
              : state === "needs-review"
                ? "Due for review — the queue will bring back a question from this."
                : "Work through the resources, then mark this complete."}
      </div>

      {/* tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              padding: "8px 0",
              background: "none",
              border: "none",
              borderBottom: tab === t.id ? "2px solid var(--primary)" : "2px solid transparent",
              color: tab === t.id ? "var(--primary)" : "var(--muted)",
              font: "600 10px var(--font-display)",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: 14 }}>
        {tab === "resources" && (
          <p style={{ font: "300 12px var(--font-body)", color: "var(--muted)", margin: 0 }}>
            Curated videos for this skill appear here once the Video Library import runs
            (build step 15). They come from Semilore&rsquo;s spreadsheet, tagged{" "}
            <code style={{ font: "400 11px var(--font-mono)", color: "var(--accent-2)" }}>{node.id}</code>.
          </p>
        )}
        {tab === "tasks" && (
          <p style={{ font: "300 12px var(--font-body)", color: "var(--muted)", margin: 0 }}>
            The Case Files that exercise this skill link here (build step 16). Completing one
            is what unlocks &ldquo;Mark as complete&rdquo;.
          </p>
        )}
        {tab === "notes" && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={commitNote}
            placeholder="Your notes on this skill…"
            style={{
              width: "100%",
              minHeight: 180,
              resize: "vertical",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-control)",
              color: "var(--text)",
              font: "400 12px/1.5 var(--font-body)",
              padding: 10,
            }}
          />
        )}
        {tab === "textbook" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {chapters.length === 0 && (
              <p style={{ font: "300 12px var(--font-body)", color: "var(--muted)", margin: 0 }}>
                No chapter mapped yet.
              </p>
            )}
            {chapters.map((slug) => (
              <button
                key={slug}
                type="button"
                onClick={() => onOpenChapter(slug)}
                style={{
                  textAlign: "left",
                  padding: "8px 10px",
                  background: "var(--surface-raised)",
                  border: "var(--bd-inner)",
                  borderRadius: "var(--radius-control)",
                  color: "var(--text)",
                  font: "400 11px var(--font-mono)",
                  cursor: "pointer",
                }}
              >
                {slug} &rarr;
              </button>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ padding: 12, borderTop: "1px solid var(--border)" }}>
        {state === "available" && (
          <button type="button" onClick={onStart} style={ctaStyle}>
            Start this skill
          </button>
        )}
        {(state === "active" || state === "needs-review") && (
          <button type="button" onClick={onComplete} style={ctaStyle}>
            Mark as complete
          </button>
        )}
        {state === "completed" && (
          <div style={{ font: "400 10px var(--font-mono)", color: "var(--accent-2)", textAlign: "center" }}>
            ✓ complete
          </div>
        )}
        {state === "locked" && (
          <div style={{ font: "400 10px var(--font-mono)", color: "var(--muted)", textAlign: "center" }}>
            complete {blockingLabel ?? "prerequisite"} first
          </div>
        )}
      </div>
    </aside>
  );
}

const ctaStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  background: "var(--primary)",
  color: "#fff",
  border: "var(--bd-inner)",
  borderRadius: "var(--radius-control)",
  font: "600 12px var(--font-display)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  cursor: "pointer",
};
