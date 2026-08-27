/* ============================================================================
   Supabase schema types.

   PLACEHOLDER. Regenerate from the live database once the migration in
   supabase/migrations/0001_init.sql has been applied:

     npx supabase gen types typescript --project-id <ref> > app/lib/supabase/database.types.ts

   Until then the clients are loosely typed. Do not hand-edit beyond this stub.
   ========================================================================== */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
