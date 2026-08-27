import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";
import type { Database } from "./database.types";

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
