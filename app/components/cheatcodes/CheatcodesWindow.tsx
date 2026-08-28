"use client";

/* ============================================================================
   Cheatcodes window (build step 13). Two tabs (SQL / Excel), a section list,
   the section's blocks with copy buttons, a search box, and the JOIN Venn
   diagrams. Opening it fires the cheatcode_opened analytics event later.
   ========================================================================== */
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Search } from "lucide-react";
import { track } from "@/lib/analytics";
import { SQL_SECTIONS, EXCEL_SECTIONS, type CheatSection } from "@/content/cheatcodes";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { JoinVenn } from "./JoinVenn";

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1200);
        });
      }}
      className="chrome-flat flex items-center gap-1 bg-surface-raised px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground hover:text-foreground"
      aria-label="Copy"
    >
      {done ? <Check className="size-2.5 text-brand-green" /> : <Copy className="size-2.5" />}
      {done ? "copied" : "copy"}
    </button>
  );
}

export function CheatcodesWindow() {
  const [tab, setTab] = useState<"sql" | "excel">("sql");
  const [sectionId, setSectionId] = useState<string>("select");
  const [q, setQ] = useState("");

  useEffect(() => {
    track("cheatcode_opened", { cheatcode_type: tab });
  }, [tab]);

  const sections = tab === "sql" ? SQL_SECTIONS : EXCEL_SECTIONS;

  const filtered = useMemo<CheatSection[]>(() => {
    if (!q.trim()) return sections;
    const needle = q.toLowerCase();
    return sections
      .map((s) => ({
        ...s,
        blocks: s.blocks.filter(
          (b) =>
            b.label.toLowerCase().includes(needle) ||
            b.code.toLowerCase().includes(needle) ||
            b.note?.toLowerCase().includes(needle),
        ),
      }))
      .filter((s) => s.blocks.length > 0 || s.title.toLowerCase().includes(needle));
  }, [q, sections]);

  const active = filtered.find((s) => s.id === sectionId) ?? filtered[0];

  return (
    <div className="flex h-full flex-col">
      {/* tabs + search */}
      <div className="flex items-center gap-2 border-b border-border p-2.5">
        {(["sql", "excel"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setTab(t);
              setSectionId((t === "sql" ? SQL_SECTIONS : EXCEL_SECTIONS)[0].id);
            }}
            className={cn(
              "chrome-flat px-4 py-1.5 text-xs font-semibold uppercase",
              tab === t ? "bg-primary text-primary-foreground" : "bg-surface-raised text-foreground",
            )}
          >
            {t}
          </button>
        ))}
        <div className="relative ml-auto w-48">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="h-7 pl-7 text-xs"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* section list */}
        <nav className="flex w-44 min-w-44 flex-col gap-0.5 overflow-auto border-r border-border bg-surface p-2.5">
          {filtered.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSectionId(s.id)}
              className={cn(
                "rounded-[var(--radius-control)] px-2.5 py-1.5 text-left text-xs",
                s.id === active?.id ? "chrome-flat bg-surface-raised text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {s.title}
            </button>
          ))}
        </nav>

        {/* content */}
        <div className="min-h-0 flex-1 overflow-auto p-5">
          {!active && <p className="text-sm text-muted-foreground">No matches.</p>}
          {active && (
            <div className="flex flex-col gap-5">
              <h2 className="font-display text-base font-semibold text-foreground">{active.title}</h2>
              {active.diagram === "joins" && <JoinVenn />}
              {active.blocks.map((b, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{b.label}</span>
                    <CopyButton text={b.code} />
                  </div>
                  <pre className="overflow-x-auto border border-border bg-background p-3" style={{ borderRadius: "var(--radius-control)" }}>
                    <code className="font-mono text-[12px] leading-relaxed text-brand-green">{b.code}</code>
                  </pre>
                  {b.note && <p className="text-[11px] font-light text-muted-foreground">{b.note}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 text-right font-mono text-[10px] text-muted-foreground">
        Ctrl/Cmd + P to print this window
      </div>
    </div>
  );
}
