"use client";

/* Root client shell. Guest mode for now (localStorage adapter). The auth step
   wraps this with a session provider that swaps in the Supabase adapter and
   runs the guest -> account migration on sign-up. */
import { StoreProvider } from "@/lib/store";
import { Desktop } from "@/components/desktop/Desktop";

export function App() {
  return (
    <StoreProvider>
      <Desktop />
    </StoreProvider>
  );
}
