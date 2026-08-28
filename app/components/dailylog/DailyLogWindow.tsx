"use client";

/* ============================================================================
   Daily Log (build step 14 / PRD 15). One line per day, 280 chars, auto-tagged
   to the active sub-node, locked after midnight. Feeds the heatmap; +20 XP the
   first time you write on a given day.
   ========================================================================== */
import { useState } from "react";
import { useStore, select } from "@/lib/store";
import { todayUTC } from "@/lib/store/reducer";
import { TOPICS } from "@/content/curriculum";
import { subNodesFor } from "@/lib/curriculumLayout";
import { Button } from "@/components/ui/button";

const MAX = 280;

function nodeLabel(id: string | null): string | null {
  if (!id) return null;
  for (const t of TOPICS) {
    const s = subNodesFor(t).find((n) => n.id === id);
    if (s) return `${s.code ?? s.label}`;
  }
  return id;
}

export function DailyLogWindow() {
  const { state, dispatch } = useStore();
  const today = todayUTC();
  const activeId = select.activeNodeId(state);
  const tag = nodeLabel(activeId);

  const existing = state.dailyLog[today];
  const [text, setText] = useState(existing?.body ?? "");
  const dirty = text.trim() !== (existing?.body ?? "").trim();

  const save = () => {
    if (!text.trim() || !dirty) return;
    dispatch({ type: "writeDailyLog", day: today, body: text.trim().slice(0, MAX), nodeTag: activeId });
  };

  const past = Object.entries(state.dailyLog)
    .filter(([d]) => d !== today)
    .sort((a, b) => (a[0] < b[0] ? 1 : -1));

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col gap-2 border-b border-border p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {new Date(today + "T00:00:00Z").toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </span>
          {tag && <span className="font-mono text-[10px] text-brand-green">tagged: {tag}</span>}
        </div>
        <textarea
          value={text}
          maxLength={MAX}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              save();
            }
          }}
          placeholder="One line about today. What did you learn, get stuck on, or ship?"
          className="min-h-16 w-full resize-none border border-border bg-background p-2.5 font-body text-sm leading-relaxed"
          style={{ borderRadius: "var(--radius-control)" }}
        />
        <div className="flex items-center justify-between">
          <span className={text.length >= MAX ? "text-[11px] text-brand-amber" : "text-[11px] text-muted-foreground"}>
            {text.length} / {MAX}
          </span>
          <Button size="sm" disabled={!dirty || !text.trim()} onClick={save}>
            {existing ? "Update" : "Save"} <span className="ml-1 font-mono text-[9px] opacity-70">(Enter)</span>
          </Button>
        </div>
        {existing && <p className="text-[10px] text-muted-foreground">Saved. This entry locks at midnight UTC.</p>}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Past entries</span>
        {past.length === 0 && <p className="mt-2 text-xs text-muted-foreground">Nothing yet. Come back tomorrow.</p>}
        <div className="mt-3 flex flex-col gap-2.5">
          {past.map(([day, entry]) => (
            <div key={day} className="chrome-flat bg-surface-raised p-2.5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-muted-foreground">{day}</span>
                {entry.nodeTag && (
                  <span className="font-mono text-[9px] text-brand-green">{nodeLabel(entry.nodeTag)}</span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-foreground">{entry.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
