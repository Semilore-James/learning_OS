"use client";

/* ============================================================================
   First-run intro (the "mission" onboarding phase). A welcome modal, then a
   short guided walk that ends with the learner reading their first lesson,
   then it hands off to the calibration question.

   The walk advances on which windows are open (openIds), so the overlay never
   anchors to anything inside a window. Skippable at every step; the skip
   persists via advanceOnboarding("done").

   OnboardingOrientation is kept as a no-op-safe fallback for anyone who was
   mid-"orientation" when this shipped.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { INTRO } from "@/content/onboarding";

type Step = "welcome" | "open-constellation" | "pick-track" | "open-lesson" | "done-card";

const ORDER: Record<Step, number> = {
  welcome: 0,
  "open-constellation": 1,
  "pick-track": 2,
  "open-lesson": 3,
  "done-card": 4,
};

function SkipLink({ onSkip, label }: { onSkip: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="text-[11px] text-muted-foreground hover:text-foreground"
    >
      {label}
    </button>
  );
}

export function OnboardingTour({
  openIds,
  onPulse,
}: {
  /** ids of currently-open windows, from the window manager */
  openIds: string[];
  /** ask Desktop to pulse a dock icon (or clear it with null) */
  onPulse: (id: string | null) => void;
}) {
  const { dispatch } = useStore();
  const [step, setStep] = useState<Step>("welcome");

  const skip = () => dispatch({ type: "advanceOnboarding", to: "done" });
  const toCalibration = () => dispatch({ type: "advanceOnboarding", to: "calibration" });

  // the step the currently-open windows imply (null when nothing relevant is open)
  const windowStep: Step | null = openIds.includes("textbook")
    ? "done-card"
    : openIds.some((id) => id.startsWith("subconstellation:"))
      ? "open-lesson"
      : openIds.includes("constellation")
        ? "pick-track"
        : null;

  // advance the walk (forward only) as the learner opens each window
  useEffect(() => {
    if (step === "welcome" || !windowStep || ORDER[windowStep] <= ORDER[step]) return;
    const t = setTimeout(() => setStep(windowStep), 0);
    return () => clearTimeout(t);
  }, [step, windowStep]);

  // pulse the Constellation icon only while we are waiting for it to open
  useEffect(() => {
    onPulse(step === "open-constellation" ? "constellation" : null);
    return () => onPulse(null);
  }, [step, onPulse]);

  if (step === "welcome") {
    return (
      <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm">
        <div className="chrome-panel w-[460px] max-w-full bg-surface p-7">
          <h2 className="font-display text-lg font-bold text-foreground">{INTRO.welcome.title}</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">{INTRO.welcome.body}</p>
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep("open-constellation")}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              {INTRO.welcome.continueLabel}
            </button>
            <button
              type="button"
              onClick={skip}
              className="flex-1 rounded-md bg-[#e5484d] px-4 py-2 text-sm font-semibold text-white"
            >
              {INTRO.welcome.skipLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const caption =
    step === "open-constellation"
      ? INTRO.steps.openConstellation.caption
      : step === "pick-track"
        ? INTRO.steps.pickTrack.caption
        : step === "open-lesson"
          ? INTRO.steps.openLesson.caption
          : INTRO.steps.done.caption;

  return (
    <div className="fixed bottom-4 right-4 z-[401] w-[360px] max-w-[92vw]">
      <div className="chrome-panel bg-surface p-4">
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-[9px] uppercase tracking-widest text-primary">Getting started</span>
          {step !== "done-card" && <SkipLink onSkip={skip} label={INTRO.skipLabel} />}
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground">{caption}</p>
        {step === "done-card" && (
          <button
            type="button"
            onClick={toCalibration}
            className="mt-3 rounded-md bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground"
          >
            {INTRO.steps.done.button}
          </button>
        )}
      </div>
    </div>
  );
}

export function OnboardingOrientation() {
  const { dispatch } = useStore();
  const win = useWindowActions();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    win.open("constellation");
  }, [win]);

  return (
    <div className="fixed bottom-4 right-4 z-[401] w-[360px] max-w-[92vw]">
      <div className="chrome-panel bg-surface p-4">
        <p className="text-[13px] leading-relaxed text-foreground">
          This is the whole path. Everything you unlock lives here. Your first real
          case is under <span className="text-primary">SQL</span>.
        </p>
        <button
          type="button"
          onClick={() => dispatch({ type: "advanceOnboarding", to: "done" })}
          className="mt-3 rounded-md bg-primary px-4 py-1.5 text-[13px] font-semibold text-primary-foreground"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
