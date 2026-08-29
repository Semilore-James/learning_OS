"use client";

/* ============================================================================
   Taskbar notification bell. Badge = items not acknowledged in the last 24h;
   opening the panel marks the current set seen. Items are live-derived from
   store state (reviews due, cases awaiting a decision, streak at risk, a failed
   save).
   ========================================================================== */
import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { buildNotifs, markAllSeen, unseenCount } from "@/lib/notifications";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { state, lastError } = useStore();
  const win = useWindowActions();
  const [open, setOpen] = useState(false);
  // bumped after markAllSeen so the badge recomputes from the updated store
  const [, setSeenBump] = useState(0);

  const notifs = useMemo(() => buildNotifs(state, lastError), [state, lastError]);
  const badge = unseenCount(notifs);

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) {
          markAllSeen(notifs);
          setSeenBump((n) => n + 1);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Notifications${badge ? `, ${badge} new` : ""}`}
          className="relative grid size-[30px] place-items-center text-foreground hover:bg-surface-raised"
        >
          <Bell className="size-[15px]" />
          {badge > 0 && (
            <span className="absolute right-0.5 top-0.5 grid min-w-3.5 place-items-center rounded-full bg-[#e5484d] px-0.5 text-[8px] font-bold leading-[14px] text-white">
              {badge}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-72 p-0">
        <div className="border-b border-border px-3 py-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Notifications
        </div>
        {notifs.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">You&apos;re all caught up.</p>
        ) : (
          <ul className="max-h-72 overflow-auto py-1">
            {notifs.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  disabled={!n.open}
                  onClick={() => {
                    if (n.open) win.open(n.open);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full flex-col items-start gap-0.5 px-3 py-2 text-left",
                    n.open && "hover:bg-surface-raised",
                  )}
                >
                  <span
                    className={cn(
                      "flex items-center gap-1.5 text-[12px] font-semibold",
                      n.tone === "warn" ? "text-brand-amber" : "text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        n.tone === "warn" ? "bg-brand-amber" : "bg-primary",
                      )}
                    />
                    {n.title}
                  </span>
                  {n.detail && <span className="pl-3 text-[11px] text-muted-foreground">{n.detail}</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="border-t border-border px-3 py-1.5 text-[9px] text-muted-foreground">
          Clears daily.
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
