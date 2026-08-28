/* ============================================================================
   Open an external URL in a new tab, defensively. A raw <a target="_blank">
   click can destabilise embedded browser panes (the app is often viewed inside
   one during development); window.open with noopener is handled more gracefully,
   and if the environment blocks it we fall back to copying the link.
   ========================================================================== */
export function openExternal(url: string): void {
  try {
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (w) return;
  } catch {
    /* fall through to clipboard */
  }
  try {
    void navigator.clipboard?.writeText(url);
  } catch {
    /* nothing more we can do */
  }
}
