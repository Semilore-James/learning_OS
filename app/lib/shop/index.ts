/* ============================================================================
   Shop purchase + equip logic. Pure, dependency-light (only store types + the
   catalog) so the reducer can re-check a purchase without pulling in the
   milestone / cases graph.

   Achievement gates use the same key convention as lib/milestones
   (`level-<n>`, `streak-<n>`); the check is recomputed here from raw state to
   keep this module free of import cycles.
   ========================================================================== */
import type { AppState } from "@/lib/store/types";
import {
  ITEMS,
  ITEMS_BY_ID,
  CATEGORY_ORDER,
  RARITY_ORDER,
  type ShopItem,
} from "@/content/shop/items";

export { ITEMS, ITEMS_BY_ID };

export interface PurchaseCheck {
  ok: boolean;
  reason?: string;
}

const balance = (s: AppState) => Math.max(0, s.coins.earned - s.coins.spent);

/** longest consecutive-day run anywhere in the heatmap */
function longestStreak(heatmap: Record<string, number>): number {
  const days = Object.keys(heatmap)
    .filter((d) => (heatmap[d] ?? 0) > 0)
    .sort();
  if (!days.length) return 0;
  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = (Date.parse(days[i]) - Date.parse(days[i - 1])) / 86_400_000;
    run = gap === 1 ? run + 1 : 1;
    if (run > longest) longest = run;
  }
  return longest;
}

/** whether an achievement key (`level-10`, `streak-30`) is currently satisfied */
export function hasAchievement(state: AppState, key: string): boolean {
  const m = /^(level|streak)-(\d+)$/.exec(key);
  if (!m) return false;
  const n = Number(m[2]);
  if (m[1] === "level") return Math.floor(Math.max(0, state.xpTotal) / 1000) + 1 >= n;
  return longestStreak(state.heatmap) >= n;
}

export function ownsItem(state: AppState, item: ShopItem): boolean {
  return state.unlocks.includes(item.id);
}

export function canPurchase(state: AppState, item: ShopItem): PurchaseCheck {
  if (ownsItem(state, item)) return { ok: false, reason: "Already owned" };
  if (balance(state) < item.price)
    return { ok: false, reason: `Need ${item.price.toLocaleString()} coins` };
  if (item.achievementGate && !hasAchievement(state, item.achievementGate.key))
    return { ok: false, reason: item.achievementGate.label };
  return { ok: true };
}

/** the item currently equipped in a slot, if any */
export function equippedItem(
  state: AppState,
  slot: "iconSet" | "companion",
): ShopItem | null {
  const key = state.equipped[slot];
  if (!key) return null;
  return ITEMS.find((i) => i.slot === slot && i.asset.key === key) ?? null;
}

/* ------------------------------------------------- weekly featured strip --- */

/** week index since epoch — changes once a week, same for all viewers */
function weekIndex(now = Date.now()): number {
  return Math.floor(now / (7 * 86_400_000));
}

/**
 * Three items to feature this week, rotating weekly. Takes one from each
 * category first (so the strip always shows variety), then fills the rest by
 * ascending rarity. Never features a legendary (those are the long-game goal,
 * not an impulse buy).
 */
export function weeklyFeatured(now = Date.now()): ShopItem[] {
  const wk = weekIndex(now);
  const eligible = ITEMS.filter((i) => i.rarity !== "legendary");
  const pick: ShopItem[] = [];

  for (const cat of CATEGORY_ORDER) {
    const pool = eligible
      .filter((i) => i.category === cat)
      .sort((a, b) => a.id.localeCompare(b.id));
    if (pool.length && pick.length < 3) pick.push(pool[wk % pool.length]);
  }
  const rest = eligible
    .filter((i) => !pick.includes(i))
    .sort((a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity]);
  while (pick.length < 3 && rest.length) pick.push(rest[(wk + pick.length) % rest.length]);

  return pick;
}
