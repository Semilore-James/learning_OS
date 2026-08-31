/* ============================================================================
   Icon sets — an equipped icon set swaps every desktop / taskbar app glyph for
   an alternate style. v1 has one set: "retro" (32px pixel icons in
   app/public/shop/icons/retro/items/). Each app id is hand-mapped to the
   closest icon on the sheet; anything unmapped (or iconSet == null) falls back
   to the app's built-in lucide-style glyph.
   ========================================================================== */

/** app id -> icon file, per set. Keys are ids from lib/appRegistry (+ settings,
 *  textbook). Values are files in app/public/shop/icons/retro/items/. */
const RETRO_MAP: Record<string, string> = {
  constellation: "item95", // linked coloured nodes
  video: "item61", // camcorder
  casefiles: "item57", // mystery book with a "?"
  pmai: "item104", // speech bubble
  heatmap: "item79", // calendar grid
  canvas: "item63", // marker + brush
  games: "item74", // joystick
  review: "item70", // checklist with ticks
  shop: "item56", // cardboard box
  cheatcodes: "item77", // open book
  dailylog: "item43", // notepad with a pencil
  toolkit: "item28", // folder of tools
  settings: "item16", // control-panel window
  textbook: "item34", // closed green book
};

const SETS: Record<string, Record<string, string>> = {
  retro: RETRO_MAP,
};

/** true if `key` is a known icon-set key */
export function isIconSetKey(key: string | null | undefined): key is string {
  return !!key && key in SETS;
}

/**
 * The image src for an app under an icon set, or null to use the built-in glyph.
 * `iconSet` is state.equipped.iconSet (a set key like "retro", or null).
 */
export function iconSrc(appId: string, iconSet: string | null): string | null {
  if (!iconSet) return null;
  const map = SETS[iconSet];
  const file = map?.[appId];
  return file ? `/shop/icons/retro/items/${file}.png` : null;
}
