/* ============================================================================
   Rate limiting for expensive routes (the PM-AI route, step 17). Sliding
   window keyed by user id, backed by Upstash Redis.

   When UPSTASH_REDIS_REST_* are unset (local dev) this is a no-op that always
   allows — so the route works locally without Redis, and is protected in prod.
   ========================================================================== */
import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/env.server";

export interface RateResult {
  success: boolean;
  remaining: number;
  reset: number;
}

const enabled = Boolean(serverEnv.upstashRedisUrl && serverEnv.upstashRedisToken);

const limiter = enabled
  ? new Ratelimit({
      redis: new Redis({
        url: serverEnv.upstashRedisUrl,
        token: serverEnv.upstashRedisToken,
      }),
      // 20 advisor calls per user per hour — generous for real study, cheap
      // enough to survive a scripted abuser draining the LLM quota
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "pmai",
      analytics: false,
    })
  : null;

export async function checkRateLimit(key: string): Promise<RateResult> {
  if (!limiter) return { success: true, remaining: 99, reset: 0 };
  const r = await limiter.limit(key);
  return { success: r.success, remaining: r.remaining, reset: r.reset };
}
