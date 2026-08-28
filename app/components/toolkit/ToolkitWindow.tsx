"use client";

/* ============================================================================
   Toolkit window (build step 18 / "The Loadout"). Every tool an analyst
   installs to practice, with what/why, the official download link, per-OS
   install steps, a verify command, and the problems people actually hit.
   Marking a tool installed awards +15 XP and a heatmap unit.
   ========================================================================== */
import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { TOOLS, TOOL_CATEGORIES, type OS } from "@/content/toolkit";
import { useStore } from "@/lib/store";
import { openExternal } from "@/lib/openExternal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function detectOS(): OS {
  if (typeof navigator === "undefined") return "windows";
  const p = navigator.userAgent.toLowerCase();
  if (p.includes("mac")) return "mac";
  if (p.includes("linux") || p.includes("x11")) return "linux";
  return "windows";
}

function Copyable({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() =>
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        })
      }
      className="chrome-flat flex items-center gap-1 bg-surface-raised px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground hover:text-foreground"
    >
      {done ? <Check className="size-2.5 text-brand-green" /> : <Copy className="size-2.5" />}
      {done ? "copied" : "copy"}
    </button>
  );
}

export function ToolkitWindow() {
  const { state, dispatch } = useStore();
  const [selectedId, setSelectedId] = useState(TOOLS[0].id);
  const [os, setOs] = useState<OS>(detectOS());

  const tool = useMemo(() => TOOLS.find((t) => t.id === selectedId) ?? TOOLS[0], [selectedId]);
  const installed = state.toolInstalls.includes(tool.id);
  const install = tool.install.find((i) => i.os.includes(os)) ?? tool.install[0];
  const problems = tool.problems.filter((p) => !p.os || p.os.includes(os));

  return (
    <div className="flex h-full">
      {/* nav */}
      <nav className="flex w-52 min-w-52 flex-col gap-3 overflow-auto border-r border-border bg-surface p-3">
        {TOOL_CATEGORIES.map((cat) => (
          <div key={cat.id} className="flex flex-col gap-0.5">
            <span className="mb-0.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {cat.label}
            </span>
            {TOOLS.filter((t) => t.category === cat.id).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-[var(--radius-control)] px-2.5 py-1.5 text-left text-xs",
                  t.id === selectedId ? "chrome-flat bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{t.name}</span>
                {state.toolInstalls.includes(t.id) && <Check className="size-3 shrink-0 text-brand-green" />}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* detail */}
      <div className="min-h-0 flex-1 overflow-auto p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">{tool.name}</h2>
            <div className="mt-1 flex flex-wrap gap-1.5 font-mono text-[9px]">
              <span className="chrome-flat bg-surface-raised px-1.5 py-0.5 text-muted-foreground">{tool.cost.replace("-", " ")}</span>
              {tool.platforms.map((p) => (
                <span key={p} className="chrome-flat bg-surface-raised px-1.5 py-0.5 text-muted-foreground">{p}</span>
              ))}
            </div>
          </div>
          <Button
            variant={installed ? "outline" : "default"}
            size="sm"
            onClick={() => dispatch({ type: "setToolInstalled", toolId: tool.id, installed: !installed })}
          >
            {installed ? "✓ installed" : "Mark installed (+15 XP)"}
          </Button>
        </div>

        <p className="mt-3 text-sm text-foreground">{tool.what}</p>
        <p className="mt-2 text-sm text-muted-foreground">{tool.why}</p>
        {tool.note && (
          <p className="chrome-flat mt-3 bg-surface-raised p-2.5 text-xs text-brand-amber">{tool.note}</p>
        )}

        <button
          type="button"
          onClick={() => openExternal(tool.source)}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
        >
          <ExternalLink className="size-3" />
          Official download page
        </button>

        {/* OS tabs */}
        <div className="mt-5 flex gap-1.5">
          {(["windows", "mac", "linux"] as OS[]).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOs(o)}
              className={cn(
                "chrome-flat px-3 py-1 text-[11px] font-semibold capitalize",
                os === o ? "bg-primary text-primary-foreground" : "bg-surface-raised text-foreground",
              )}
            >
              {o}
            </button>
          ))}
        </div>

        {/* install steps */}
        <div className="mt-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Install</span>
          <ol className="mt-2 flex list-decimal flex-col gap-1.5 pl-5 text-sm text-foreground">
            {install.steps.map((s, i) => (
              <li key={i} className="leading-relaxed">{s}</li>
            ))}
          </ol>
          {install.verify && (
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Verify it worked</span>
                <Copyable text={install.verify} />
              </div>
              <pre className="mt-1 overflow-x-auto border border-border bg-background p-2.5" style={{ borderRadius: "var(--radius-control)" }}>
                <code className="font-mono text-[12px] text-brand-green">{install.verify}</code>
              </pre>
            </div>
          )}
        </div>

        {/* common problems */}
        {problems.length > 0 && (
          <div className="mt-5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Common problems
            </span>
            <div className="mt-2 flex flex-col gap-2.5">
              {problems.map((p, i) => (
                <details key={i} className="chrome-flat bg-surface-raised p-2.5 text-xs">
                  <summary className="cursor-pointer font-medium text-foreground">{p.symptom}</summary>
                  <p className="mt-1.5 text-muted-foreground">
                    <span className="text-brand-amber">Why:</span> {p.cause}
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    <span className="text-brand-green">Fix:</span> {p.fix}
                  </p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
