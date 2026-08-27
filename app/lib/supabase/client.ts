"use client";

import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Browser Supabase client. Uses the anon key (public by design) and the
 * logged-in user's session cookie. Every query runs under Row Level Security,
 * so this client can only ever read or write the current user's own rows.
 */
export function createClient() {
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  );
}
