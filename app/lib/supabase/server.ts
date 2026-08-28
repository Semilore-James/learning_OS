import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

/**
 * Cookie-less anon client for public pages (no user session). Used by the
 * /share/<handle> route, which only ever calls the public shared_progress()
 * RPC. Still the anon key + RLS.
 */
export function createPublicClient() {
  return createSupabaseClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    { auth: { persistSession: false } },
  );
}

/**
 * Server Supabase client for Server Components, Route Handlers, and Server
 * Actions. Still the anon key + the user's session (read from cookies), so
 * every query runs under Row Level Security. This is the client to use for
 * anything acting on behalf of a logged-in user.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component — safe to ignore when middleware
            // is refreshing the session.
          }
        },
      },
    },
  );
}
