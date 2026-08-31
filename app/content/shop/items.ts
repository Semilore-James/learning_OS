/* ============================================================================
   Shop catalog — the ITEMS the learner can buy with coins (docs/coin-economy.md).

   Live categories (Council shop-scope verdict, 2026-08-29): icon sets and
   desktop companions. Wallpapers and design skins stay FREE for now — the
   shipped ones are not re-sold; new wallpaper art drops into the free picker,
   and the shop's wallpaper tab is reserved for future original art.

   Shape (frozen for the reducer + adapter):
     id             stable key, also the row id in public.user_unlocks
     category       which tab / subsystem
     name / blurb   card copy
     rarity         drives price band + sort order (coin-economy.md §3)
     price          coins
     achievementGate?  a lib/milestones key that must also be earned (legendary)
     slot?          "iconSet" | "companion" — equippable items only
     preview        how ShopWindow renders the live card preview
     asset          what the subsystem consumes. `asset.key` is written to
                    state.equipped[slot].
   ========================================================================== */

export type ShopCategory = "icons" | "companion";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type EquipSlot = "iconSet" | "companion";

export interface AchievementGate {
  /** key from lib/milestones detectEarned(): "level-10", "streak-30", … */
  key: string;
  label: string;
}

export type ShopPreview =
  | { kind: "iconSet"; setKey: string }
  | { kind: "companion"; name: string };

export interface ShopItem {
  id: string;
  category: ShopCategory;
  name: string;
  blurb: string;
  rarity: Rarity;
  price: number;
  achievementGate?: AchievementGate;
  slot?: EquipSlot;
  preview: ShopPreview;
  asset: { key: string } & Record<string, string>;
}

export const RARITY_ORDER: Record<Rarity, number> = {
  common: 0,
  uncommon: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

/* -------------------------------------------------------- icon sets --- */

const ICON_SETS: ShopItem[] = [
  {
    id: "icons-retro",
    category: "icons",
    name: "Retro Computer Icons",
    blurb: "Every desktop and taskbar glyph becomes a hand-drawn 32px pixel icon. Beige-box energy.",
    rarity: "uncommon",
    price: 180,
    slot: "iconSet",
    preview: { kind: "iconSet", setKey: "retro" },
    asset: { key: "retro" },
  },
  {
    id: "icons-pixel",
    category: "icons",
    name: "Pixel Mono",
    blurb: "Crisp one-colour pixel glyphs (pixelarticons). Reads like an early GUI.",
    rarity: "uncommon",
    price: 150,
    slot: "iconSet",
    preview: { kind: "iconSet", setKey: "pixel" },
    asset: { key: "pixel" },
  },
  {
    id: "icons-solid",
    category: "icons",
    name: "Phosphor Solid",
    blurb: "Bold filled shapes instead of hairline strokes. Heavier, friendlier.",
    rarity: "rare",
    price: 300,
    slot: "iconSet",
    preview: { kind: "iconSet", setKey: "solid" },
    asset: { key: "solid" },
  },
];

/* ------------------------------------------------------- companions --- */
/* Ninja Adventure Asset Pack (pixel-boy, CC0). */

type CoSeed = [key: string, name: string, rarity: Rarity, price: number, blurb: string];
const COMPANION_SEEDS: CoSeed[] = [
  ["ninja-green", "Green Ninja", "common", 40, "Standard-issue shinobi. Paces the taskbar, cheers your level-ups."],
  ["ninja-red", "Red Ninja", "common", 50, "Same moveset, warmer palette."],
  ["villager", "Villager", "common", 60, "Off-duty. Wanders, dozes when you step away."],
  ["scout", "Scout", "uncommon", 120, "Cap and pack. Always looks like they're mid-errand."],
  ["ninja-grey", "Grey Ninja", "uncommon", 160, "Scarfed and stealthy. Blends into a dark wallpaper."],
  ["wanderer", "Wanderer", "uncommon", 200, "Broad hat, long road. Unbothered."],
  ["ember", "Ember", "rare", 350, "Fire-lit hair. Cheer animation actually lands."],
  ["knight", "Knight", "rare", 550, "Full helm. Stomps rather than pads."],
  ["sentinel", "Sentinel", "epic", 1800, "A walking chassis. Whirs when it wakes from a doze."],
  [
    "crimson",
    "The Crimson",
    "legendary",
    9000,
    "The one you work toward. Coins alone won't buy it.",
  ],
];

const COMPANION_ITEMS: ShopItem[] = COMPANION_SEEDS.map(([key, name, rarity, price, blurb]) => ({
  id: `companion-${key}`,
  category: "companion" as const,
  name,
  blurb,
  rarity,
  price,
  slot: "companion" as const,
  preview: { kind: "companion" as const, name: key },
  asset: { key },
  ...(key === "crimson"
    ? { achievementGate: { key: "level-5", label: "Reach level 5" } }
    : {}),
}));

/* ------------------------------------------------------------- exports --- */

export const ITEMS: ShopItem[] = [...ICON_SETS, ...COMPANION_ITEMS];

export const ITEMS_BY_ID: Record<string, ShopItem> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i]),
);

export const CATEGORY_LABEL: Record<ShopCategory, string> = {
  icons: "Icon sets",
  companion: "Companions",
};

export const CATEGORY_ORDER: ShopCategory[] = ["companion", "icons"];

/** items in a category, cheapest rarity first then price */
export function itemsInCategory(category: ShopCategory): ShopItem[] {
  return ITEMS.filter((i) => i.category === category).sort(
    (a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] || a.price - b.price,
  );
}
