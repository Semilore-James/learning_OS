"use client";

/* ============================================================================
   Desktop companion — a small animated character that lives along the bottom
   of the desktop. Bought + equipped in the Shop (state.equipped.companion).

   Behaviour:
     - idles, then wanders to a new spot every few seconds
     - cheers (attack pose + "!" bubble) on a new lib/milestones feed item and
       glances over when a window opens
     - dozes (sits, "z z z") after ~90s with no pointer/keyboard activity
     - looks glum (static, desaturated) when the streak is 0 with prior activity

   Performance: the sprite frames run on a pure-CSS steps() animation (no JS
   frame timer). Position is written straight to the DOM from a rAF loop that
   ONLY runs while walking; the rest of the time a single 500ms "brain" interval
   decides transitions. Everything pauses while the tab is hidden. Idle cost is
   near zero.

   Off unless a companion is equipped. Hidden entirely when motion is reduced.
   A per-session hide toggle lives in sessionStorage.
   ========================================================================== */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import { useStore, select } from "@/lib/store";
import { useMotionAllowed } from "@/lib/useMotionAllowed";
import { recentMilestones } from "@/lib/milestones";
import { isCompanionName, type CompanionAnim } from "@/lib/shop/companions";
import { CompanionSprite } from "@/components/shop/CompanionSprite";

const HIDE_KEY = "da-os-companion-hidden";
const VIS_EVENT = "da-os-companion-vis";
export const WINDOW_OPENED_EVENT = "da-os-window-opened";

const SIZE = 76;
const MARGIN = 16;
const SPEED = 46; // px/sec while walking
const BRAIN_MS = 500;
const DOZE_AFTER_MS = 90_000;

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

type Phase = "idle" | "walk" | "cheer" | "doze" | "sit";

export function DesktopCompanion() {
  const { state } = useStore();
  const motion = useMotionAllowed();
  const sessionHidden = useSessionHidden();
  const companion = select.equippedCompanion(state);

  const glum = useMemo(
    () =>
      select.streak(state).current === 0 && Object.keys(state.heatmap ?? {}).length > 0,
    [state],
  );

  const active =
    state.ready && !!companion && isCompanionName(companion) && motion && !sessionHidden;

  const [phase, setPhase] = useState<Phase>("idle");
  const [dir, setDir] = useState<1 | -1>(-1);

  const boxRef = useRef<HTMLDivElement | null>(null);
  const world = useRef({
    x: MARGIN,
    target: MARGIN,
    nextMoveAt: 0,
    cheerUntil: 0,
    lastActivity: 0,
    raf: 0,
    lastT: 0,
  });
  const glumRef = useRef(glum);
  useEffect(() => {
    glumRef.current = glum;
  }, [glum]);

  // wake-on-activity (cheap: ref write only, no setState)
  useEffect(() => {
    if (!active) return;
    const bump = () => {
      world.current.lastActivity = Date.now();
    };
    window.addEventListener("pointermove", bump, { passive: true });
    window.addEventListener("keydown", bump, { passive: true });
    window.addEventListener("pointerdown", bump, { passive: true });
    return () => {
      window.removeEventListener("pointermove", bump);
      window.removeEventListener("keydown", bump);
      window.removeEventListener("pointerdown", bump);
    };
  }, [active]);

  // glance when a window opens
  useEffect(() => {
    if (!active) return;
    const onOpen = () => {
      world.current.cheerUntil = Math.max(world.current.cheerUntil, performance.now() + 900);
    };
    window.addEventListener(WINDOW_OPENED_EVENT, onOpen);
    return () => window.removeEventListener(WINDOW_OPENED_EVENT, onOpen);
  }, [active]);

  // milestone feed -> cheer (seed the seen-set on the first poll)
  const seenRef = useRef<Set<string> | null>(null);
  useEffect(() => {
    if (!active) return;
    const poll = () => {
      if (document.hidden) return;
      const feed = recentMilestones();
      if (seenRef.current === null) {
        seenRef.current = new Set(feed.map((f) => f.key));
        return;
      }
      if (feed.some((f) => !seenRef.current!.has(f.key))) {
        for (const f of feed) seenRef.current!.add(f.key);
        world.current.cheerUntil = performance.now() + 3400;
      }
    };
    poll();
    const id = window.setInterval(poll, 6000);
    return () => window.clearInterval(id);
  }, [active]);

  // the brain: coarse 500ms decisions. Smooth walking is a rAF started here.
  useEffect(() => {
    if (!active) return;
    const w = world.current;
    w.lastActivity = Date.now();

    const place = (x: number) => {
      w.x = x;
      if (boxRef.current) boxRef.current.style.transform = `translateX(${Math.round(x)}px)`;
    };
    place(w.x);
    // little wave when it first appears
    w.cheerUntil = performance.now() + 1200;

    // what the companion does when it next stops: stand, sit a while, or (rarely)
    // it's mid-peek and needs to come back on screen
    let restMode: "stand" | "sit" = "stand";
    let peeking = false;

    const pickDestination = () => {
      const max = Math.max(MARGIN, window.innerWidth - SIZE - MARGIN);
      const r = Math.random();
      if (!peeking && r < 0.14) {
        // slip off an edge, then peek back
        peeking = true;
        w.target = w.x < window.innerWidth / 2 ? -SIZE * 0.6 : window.innerWidth - SIZE * 0.4;
      } else {
        peeking = false;
        // travel somewhere genuinely different so it isn't constantly turning
        let t = MARGIN + Math.random() * (max - MARGIN);
        if (Math.abs(t - w.x) < 200) t = w.x < max / 2 ? Math.min(max, w.x + 260) : Math.max(MARGIN, w.x - 260);
        w.target = t;
        restMode = Math.random() < 0.28 ? "sit" : "stand";
      }
      setDir(w.target >= w.x ? 1 : -1);
      setPhase("walk");
      w.raf = requestAnimationFrame(stepWalk);
    };

    const stepWalk = (t: number) => {
      const dt = w.lastT ? Math.min(64, t - w.lastT) : 16;
      w.lastT = t;
      const dist = w.target - w.x;
      if (Math.abs(dist) < 1) {
        place(w.target);
        w.raf = 0;
        w.lastT = 0;
        if (peeking) {
          // reached the edge: hold briefly, then come back on
          w.nextMoveAt = performance.now() + 900 + Math.random() * 1200;
          setPhase("idle");
        } else {
          w.nextMoveAt =
            performance.now() + (restMode === "sit" ? 6000 : 2600) + Math.random() * 5000;
          setPhase(restMode === "sit" ? "sit" : "idle");
        }
        return;
      }
      place(w.x + Math.sign(dist) * Math.min(Math.abs(dist), (SPEED * dt) / 1000));
      w.raf = requestAnimationFrame(stepWalk);
    };

    const brain = window.setInterval(() => {
      if (document.hidden) return;
      const now = performance.now();

      if (now < w.cheerUntil) {
        if (w.raf) {
          cancelAnimationFrame(w.raf);
          w.raf = 0;
          w.lastT = 0;
        }
        setPhase("cheer");
        return;
      }
      if (glumRef.current) {
        setPhase("idle");
        return;
      }
      if (w.raf) return; // walking, let the rAF finish

      if (!peeking && Date.now() - w.lastActivity > DOZE_AFTER_MS) {
        setPhase("doze");
        return;
      }

      if (now >= w.nextMoveAt) {
        pickDestination();
      } else if (!peeking) {
        setPhase(restMode === "sit" ? "sit" : "idle");
      }
    }, BRAIN_MS);

    return () => {
      window.clearInterval(brain);
      if (w.raf) cancelAnimationFrame(w.raf);
      w.raf = 0;
      w.lastT = 0;
    };
  }, [active]);

  if (!active || !companion) return null;

  const shownPhase: Phase | "glum" = glum ? "glum" : phase;
  const anim: CompanionAnim =
    shownPhase === "cheer"
      ? "cheer"
      : shownPhase === "walk"
        ? "walk"
        : shownPhase === "doze" || shownPhase === "sit"
          ? "sit"
          : "idle";

  return (
    <div
      ref={boxRef}
      className="group pointer-events-none absolute bottom-[44px] left-0 z-[6] select-none will-change-transform"
      data-companion={companion}
      data-phase={shownPhase}
    >
      {shownPhase === "cheer" && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 font-display text-lg font-black text-brand-amber">
          !
        </div>
      )}
      {shownPhase === "doze" && (
        <div className="companion-zzz absolute -top-1 right-0 font-mono text-[10px] font-bold text-muted-foreground">
          z
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
          anim={anim}
          size={SIZE}
          flip={dir === -1}
          paused={shownPhase === "glum"}
        />
        <button
          type="button"
          aria-label="Hide the companion for this session"
          onClick={() => sessionHideCompanion(true)}
          className="chrome-flat pointer-events-auto absolute -right-1 -top-1 hidden size-4 place-items-center bg-surface-raised text-muted-foreground group-hover:grid hover:text-foreground"
        >
          <X className="size-2.5" />
        </button>
      </div>
    </div>
  );
}
