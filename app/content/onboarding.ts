/* ============================================================================
   First-run intro. A short guided walk that ends with the learner reading
   their first lesson, then hands off to the calibration question. Every step
   is skippable and the skip persists.

   Steps after the welcome modal are driven by which windows are open, so the
   overlay never has to anchor to anything inside a window.
   ========================================================================== */

export const INTRO = {
  welcome: {
    title: "Welcome to DA // LEARNING OS",
    body:
      "This is a desktop where you learn data analysis by doing the actual work. " +
      "Everything you need is on this screen: your learning path, real case files, " +
      "a set of games, and a PM who reviews what you produce. Nothing here is a video " +
      "you watch. You read a little, then you do a lot.",
    continueLabel: "Continue tutorial",
    skipLabel: "Skip tutorial",
  },
  steps: {
    openConstellation: {
      caption:
        "Start with your map. Double-click the Constellation Map on the dock to open it.",
    },
    pickTrack: {
      caption:
        "Every star is a skill. The bright ones are open now, the dim ones unlock as you finish what comes before. Click a bright track, then hit Enter this track.",
    },
    openLesson: {
      caption:
        "These are the lessons in that track, in order. Open the first one to start reading.",
    },
    done: {
      caption:
        "That's the whole loop: read a lesson, then prove it on a case. Everything else lives on the dock, open it when you get stuck. One quick thing so we start you at the right level.",
      button: "Got it",
    },
  },
  skipLabel: "Skip the rest",
} as const;
