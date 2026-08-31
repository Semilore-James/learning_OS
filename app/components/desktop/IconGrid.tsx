"use client";

import { cn } from "@/lib/utils";
import { APPS } from "@/lib/appRegistry";
import { flag } from "@/lib/flags";

export function IconGrid({
  openIds,
  onOpen,
  pulseId = null,
}: {
  openIds: string[];
  onOpen: (id: string) => void;
  /** dock icon the intro tour is asking the learner to notice */
  pulseId?: string | null;
}) {
  return (
    <div className="absolute left-6 top-6 z-[5] grid grid-cols-2 gap-4" style={{ gridTemplateColumns: "repeat(2, 84px)" }}>
      {APPS.filter((a) => !a.flag || flag(a.flag)).map((a) => {
        const isOpen = openIds.includes(a.id);
        const pulsing = pulseId === a.id;
        return (
          <button
            key={a.id}
            type="button"
            data-app={a.id}
            title={`${a.hint} · double-click to open`}
            onDoubleClick={() => onOpen(a.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpen(a.id);
            }}
            className={cn(
              "chrome-press flex w-[84px] select-none flex-col items-center gap-1.5",
              isOpen ? "text-primary" : "text-muted-foreground",
              pulsing && "z-[6] animate-pulse text-primary",
            )}
          >
            <span
              className="grid size-[76px] place-items-center bg-[var(--tile-bg)]"
              style={{
                border: isOpen || pulsing ? "var(--bd-width) solid var(--primary)" : "var(--bd)",
                borderRadius: "var(--radius)",
                boxShadow: pulsing ? "0 0 0 4px color-mix(in srgb, var(--primary) 35%, transparent)" : "var(--shadow-sm)",
              }}
            >
              {a.glyph}
            </span>
            <span className="whitespace-pre-line text-center font-mono text-[10px]/[1.2] text-muted-foreground">
              {a.label}
            </span>
            {isOpen && <span className="-mt-0.5 size-1.5 rounded-full bg-primary" />}
          </button>
        );
      })}
    </div>
  );
}
