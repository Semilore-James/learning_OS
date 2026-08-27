import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/lib/env";
import { serverEnv } from "@/lib/env.server";
import type { Database } from "./database.types";

/**
 * ADMIN client — uses the service role key and BYPASSES Row Level Security.
 *
 * Use only for trusted server jobs that legitimately need to see every user's
 * data, such as the streak-reminder cron. NEVER use it to serve a request on
 * behalf of a logged-in user: that is what lib/supabase/server.ts is for, and
 * it keeps RLS on.
 *
 * The "server-only" import above makes importing this into client code a build
 * error.
 */
export function createAdminClient() {
  if (!serverEnv.supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
