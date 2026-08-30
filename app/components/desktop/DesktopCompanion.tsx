"use client";

/* ============================================================================
   Desktop companion — a small animated character that lives along the bottom
   of the desktop. Bought + equipped in the Shop (state.equipped.companion).

   Behaviour:
     - idles and blinks, then wanders to a new spot every few seconds
     - celebrates (runs on the spot, "!" bubble) when a new milestone fires —
       it polls the lib/milestones feed, the same source the bell uses
     - looks glum (static, desaturated) when the streak is 0 but there is
       prior activity
   Off unless a companion is equipped. Hidden entirely when motion is reduced
   (OS setting or the Settings "reduce effects" switch). A per-session hide
   toggle lives in sessionStorage so "not right now" survives navigation but
   not a fresh browser session.
   ========================================================================== */
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { recentMilestones } from "@/lib/milestones";
import { isCompanionName, type CompanionAnim } from "@/lib/shop/companions";
import { CompanionSprite } from "@/components/shop/CompanionSprite";

const HIDE_KEY = "da-os-companion-hidden";
const VIS_EVENT = "da-os-companion-vis";
const SIZE = 84;
const MARGIN = 16;
const SPEED = 44; // px/sec while walking
const TICK_MS = 40;

export function sessionHideCompanion(hidden: boolean) {
  try {
    if (hidden) sessionStorage.setItem(HIDE_KEY, "1");
    else sessionStorage.removeItem(HIDE_KEY);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(VIS_EVENT));
}

export function useSessionHidden(): boolean {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener(VIS_EVENT, cb);
      window.addEventListener("storage", cb);
      return () => {
        window.removeEventListener(VIS_EVENT, cb);
        window.removeEventListener("storage", cb);
      };
    },
    () => {
      try {
        return sessionStorage.getItem(HIDE_KEY) === "1";
      } catch {
        return false;
      }
    },
    () => false,
  );
}

type Phase = "idle" | "walk" | "celebrate";

export function DesktopCompanion() {
  const { state } = useStore();
  const motion = useMotionAllowed();
  const sessionHidden = useSessionHidden();
  const companion = select.equippedCompanion(state);
  const glum =
    select.streak(state).current === 0 && Object.keys(state.heatmap ?? {}).length > 0;

  const [phase, setPhase] = useState<Phase>("idle");
  const [x, setX] = useState(MARGIN);
  const [dir, setDir] = useState<1 | -1>(1);
  const [blink, setBlink] = useState(false);

  // live value the timers read without re-subscribing
  const glumRef = useRef(glum);
  useEffect(() => {
    glumRef.current = glum;
  }, [glum]);
  const active = Boolean(companion) && motion && !sessionHidden;

  // movement + wander state machine
  const mv = useRef({ x: MARGIN, target: MARGIN, nextAt: 0, celebrateUntil: 0 });
  useEffect(() => {
    if (!active) return;
    const box = () => Math.max(MARGIN, window.innerWidth - SIZE - MARGIN);
    const id = window.setInterval(() => {
      const s = mv.current;
      const now = performance.now();

      if (now < s.celebrateUntil) {
        setPhase("celebrate");
        return;
      }

      if (glumRef.current) {
        setPhase("idle");
        return;
      }

      if (s.x !== s.target) {
        const dist = s.target - s.x;
        const step = (SPEED * TICK_MS) / 1000;
        s.x = Math.abs(dist) <= step ? s.target : s.x + Math.sign(dist) * step;
        setX(s.x);
        setPhase("walk");
        if (s.x === s.target) s.nextAt = now + 2600 + Math.random() * 4200;
        return;
      }

      setPhase("idle");
      if (now >= s.nextAt) {
        s.target = MARGIN + Math.random() * (box() - MARGIN);
        setDir(s.target >= s.x ? 1 : -1);
        s.nextAt = 0;
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [active]);

  // blink while idle
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => {
      if (glumRef.current) return;
      setBlink(true);
      window.setTimeout(() => setBlink(false), 240);
    }, 3200 + Math.random() * 2800);
    return () => window.clearInterval(id);
  }, [active]);

  // milestone feed -> celebrate (seed seen-set on first poll)
  const seenRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!active) return;
    const poll = () => {
      const feed = recentMilestones();
      if (seenRef.current === null) {
        seenRef.current = new Set(feed.map((f) => f.key));
        return;
      }
      if (feed.some((f) => !seenRef.current!.has(f.key))) {
        for (const f of feed) seenRef.current!.add(f.key);
        mv.current.celebrateUntil = performance.now() + 3600;
      }
    };
    poll();
    const id = window.setInterval(poll, 4000);
    return () => window.clearInterval(id);
  }, [active]);

  if (!companion || !isCompanionName(companion) || !motion || sessionHidden) return null;

  const anim: CompanionAnim =
    phase === "celebrate"
      ? "running"
      : phase === "walk"
        ? "walking"
        : blink
          ? "idle-blinking"
          : "idle";

  return (
    <div
      className="group pointer-events-none absolute z-[6] select-none"
      style={{ left: Math.round(x), bottom: 44 }}
      data-companion={companion}
      data-phase={glum ? "glum" : phase}
    >
      {phase === "celebrate" && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 font-display text-lg font-black text-brand-amber">
          !
        </div>
      )}
      <div
        className="pointer-events-auto relative"
        style={{
          filter: glum ? "grayscale(0.55) brightness(0.9)" : undefined,
          opacity: glum ? 0.8 : 1,
          transition: "filter 400ms, opacity 400ms",
        }}
      >
        <CompanionSprite
          name={companion}
          anim={glum ? "idle" : anim}
          size={SIZE}
          flip={dir === -1}
          paused={glum}
        />
        <button
          type="button"
          aria-label="Hide the companion for this session"
          onClick={() => sessionHideCompanion(true)}
          className="chrome-flat absolute -right-1 -top-1 hidden size-4 place-items-center bg-surface-raised text-muted-foreground group-hover:grid hover:text-foreground"
        >
          <X className="size-2.5" />
        </button>
      </div>
    </div>
  );
}
