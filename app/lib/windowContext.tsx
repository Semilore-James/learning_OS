"use client";

/* ============================================================================
   Lets a window body open / close / focus other windows without prop-drilling.
   Desktop provides it from its useWindows() instance.
   ========================================================================== */
import { createContext, useContext } from "react";

export interface WindowActions {
  open: (id: string, size?: { width: number; height: number }) => void;
  close: (id: string) => void;
  focus: (id: string) => void;
  /** open the Textbook window at a specific chapter slug (or node id) */
  openTextbook: (slugOrNodeId?: string) => void;
  /** the pending textbook target set by the last openTextbook call, consumed once */
  consumeTextbookTarget: () => string | undefined;
}

const Ctx = createContext<WindowActions | null>(null);

export function WindowActionsProvider({
  value,
  children,
}: {
  value: WindowActions;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWindowActions(): WindowActions {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWindowActions must be used inside <WindowActionsProvider>");
  return v;
}
