"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { useStore } from "@/lib/store";

/**
 * true when celebratory / ambient motion should play. False if the OS
 * "reduce motion" setting is on OR the learner turned "Reduce celebration
 * effects" on in Settings. Every motion primitive checks this.
 */
export function useMotionAllowed(): boolean {
  const osReduced = useReducedMotion();
  const userReduced = useStore().state.profile.reduceEffects;
  return !osReduced && !userReduced;
}
