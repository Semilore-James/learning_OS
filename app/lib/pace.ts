/* Small timing helpers for making a chat feel like a person is on the other
   end — kept out of components so the React purity lint doesn't fight the
   Math.random / setTimeout calls. */

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** how long before the other person "starts typing" — 3 to 10 seconds */
export const beforeTyping = () => 3000 + Math.random() * 7000;

/** minimum time the typing indicator stays up once shown */
export const TYPING_MIN_MS = 2000;

/** wall-clock ms, kept out of components so the purity lint doesn't flag it */
export const nowMs = () => Date.now();
