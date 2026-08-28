"use client";

/* ============================================================================
   Command palette (build step 21). Cmd/Ctrl-K anywhere on the desktop opens a
   fuzzy launcher: open any app, jump to any track, toggle theme, start review.
   Pure client, mounted inside WindowActionsProvider so it can open windows.
   ========================================================================== */
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { APPS } from "@/lib/appRegistry";
import { TOPICS } from "@/content/curriculum";
import { flag } from "@/lib/flags";

interface Cmd {
  id: string;
  label: string;
  hint: string;
  run: () => void;
}

export function CommandPalette() {
  const { state, dispatch } = useStore();
  const win = useWindowActions();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
        setSel(0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const commands = useMemo<Cmd[]>(() => {
    const list: Cmd[] = [];
    for (const a of APPS) {
      if (a.flag && !flag(a.flag)) continue;
      list.push({
        id: `app:${a.id}`,
        label: `Open ${a.label.replace(/\n/g, " ")}`,
        hint: a.hint,
        run: () => win.open(a.id),
      });
    }
    list.push({
      id: "app:settings",
      label: "Open Settings",
      hint: "Theme, skin, wallpaper, data",
      run: () => win.open("settings"),
    });
    list.push({
      id: "toggle-theme",
      label: `Switch to ${state.profile.theme === "dark" ? "light" : "dark"} theme`,
      hint: "Palette",
      run: () => dispatch({ type: "setTheme", theme: state.profile.theme === "dark" ? "light" : "dark" }),
    });
    for (const t of TOPICS) {
      list.push({
        id: `topic:${t.id}`,
        label: `Go to ${t.label.replace(/\n/g, " ")}`,
        hint: "Track",
        run: () => {
          win.open("constellation");
          win.open(`subconstellation:${t.id}`);
        },
      });
    }
    return list;
  }, [state.profile.theme, win, dispatch]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return commands.slice(0, 8);
    return commands
      .filter((c) => (c.label + " " + c.hint).toLowerCase().includes(s))
      .slice(0, 10);
  }, [q, commands]);

  if (!open) return null;

  const pick = (c: Cmd | undefined) => {
    if (!c) return;
    c.run();
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex items-start justify-center bg-black/40 pt-[14vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="chrome-panel w-[440px] max-w-[90vw] overflow-hidden bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setSel((n) => Math.min(n + 1, filtered.length - 1));
            else if (e.key === "ArrowUp") setSel((n) => Math.max(n - 1, 0));
            else if (e.key === "Enter") pick(filtered[sel]);
          }}
          placeholder="Type a command or a track…"
          className="w-full border-b border-border bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <ul className="max-h-[46vh] overflow-auto py-1">
          {filtered.length === 0 && (
            <li className="px-4 py-3 text-xs text-muted-foreground">No matches</li>
          )}
          {filtered.map((c, i) => (
            <li key={c.id}>
              <button
                type="button"
                onMouseEnter={() => setSel(i)}
                onClick={() => pick(c)}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-[13px] ${
                  i === sel ? "bg-surface-raised text-foreground" : "text-muted-foreground"
                }`}
              >
                <span>{c.label}</span>
                <span className="shrink-0 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  {c.hint}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
