/* ============================================================================
   Shop catalog — the ITEMS the learner can buy with coins (docs/coin-economy.md).

   v1 ships 4 of the 8 taxonomy categories (Council: shop-scope verdict,
   2026-08-29): icon sets, desktop companions, wallpapers, design skins. The
   other four (cursor trails, boot sequences, sound packs, window themes) have
   plumbing but no renderer yet — they are deliberately absent from this list.

   Shape (frozen for the reducer + adapter):
     id             stable key, also the row id in public.user_unlocks
     category       which tab / subsystem
     name / blurb   card copy
     rarity         drives price band + sort order (see coin-economy.md §3)
     price          coins
     achievementGate?  a lib/milestones key that must also be earned (legendary)
     slot?          "iconSet" | "companion" — equippable items only
     preview        how ShopWindow renders the live card preview
     asset          what the subsystem consumes. `asset.key` is the value written
                    to state.equipped[slot] / read by the picker.
   ========================================================================== */

export type ShopCategory = "icons" | "companion" | "wallpaper" | "skin";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type EquipSlot = "iconSet" | "companion";

export interface AchievementGate {
  /** key from lib/milestones detectEarned(): "level-10", "streak-30", … */
  key: string;
  label: string;
}

export type ShopPreview =
  | { kind: "iconSheet"; src: string }
  | { kind: "companion"; name: string }
  | { kind: "wallpaper"; wallpaperId: string }
  | { kind: "skin"; skin: string };

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

/* -------------------------------------------------------- icon sets (1) --- */

const ICON_SETS: ShopItem[] = [
  {
    id: "icons-retro",
    category: "icons",
    name: "Retro Computer Icons",
    blurb:
      "Every desktop and taskbar glyph becomes a hand-drawn 32px pixel icon. Beige-box energy.",
    rarity: "uncommon",
    price: 180,
    slot: "iconSet",
    preview: { kind: "iconSheet", src: "/shop/icons/retro/sheet.png" },
    asset: { key: "retro" },
  },
];

/* ------------------------------------------------------- companions (3) --- */

const COMPANION_ITEMS: ShopItem[] = [
  {
    id: "companion-assassin",
    category: "companion",
    name: "The Assassin",
    blurb: "A hooded desktop companion. Paces the taskbar, celebrates your level-ups.",
    rarity: "rare",
    price: 600,
    slot: "companion",
    preview: { kind: "companion", name: "assassin" },
    asset: { key: "assassin" },
  },
  {
    id: "companion-robber",
    category: "companion",
    name: "The Robber",
    blurb: "Same idle-and-wander loop, lighter palette. Sulks when your streak breaks.",
    rarity: "epic",
    price: 1500,
    slot: "companion",
    preview: { kind: "companion", name: "robber" },
    asset: { key: "robber" },
  },
  {
    id: "companion-thug",
    category: "companion",
    name: "The Enforcer",
    blurb: "The heavyweight companion. Earns his keep once you've put the work in.",
    rarity: "legendary",
    price: 9000,
    achievementGate: { key: "level-5", label: "Reach level 5" },
    slot: "companion",
    preview: { kind: "companion", name: "thug" },
    asset: { key: "thug" },
  },
];

/* ------------------------------------------------------- wallpapers (13) --- */
/* starfield / grid-horizon / dot-grid stay free (the shipped defaults). The
   other 13 procedural scenes are priced by vibe. */

type WpSeed = [id: string, name: string, rarity: Rarity, price: number];
const WALLPAPER_SEEDS: WpSeed[] = [
  ["aurora", "Aurora", "common", 40],
  ["contour", "Contour", "common", 50],
  ["star-chart", "Star Chart", "common", 60],
  ["nebula", "Nebula", "uncommon", 120],
  ["luna", "Luna", "uncommon", 150],
  ["nightside", "Nightside", "uncommon", 180],
  ["orbital", "Orbital", "uncommon", 200],
  ["saturn", "Saturn", "rare", 350],
  ["milky-way", "Milky Way", "rare", 450],
  ["galaxy", "Galaxy", "rare", 550],
  ["space-station", "Space Station", "rare", 650],
  ["quasar", "Quasar", "epic", 1600],
  ["black-hole", "Black Hole", "epic", 2400],
];

const WALLPAPER_ITEMS: ShopItem[] = WALLPAPER_SEEDS.map(([wid, name, rarity, price]) => ({
  id: `wp-${wid}`,
  category: "wallpaper" as const,
  name,
  blurb: "Procedural wallpaper. Unlocks in the Settings picker once bought.",
  rarity,
  price,
  preview: { kind: "wallpaper" as const, wallpaperId: wid },
  asset: { key: wid, wallpaperId: wid },
}));

/** wallpaper ids that never need buying */
export const FREE_WALLPAPER_IDS = ["starfield", "grid-horizon", "dot-grid"];

/* ---------------------------------------------------------- skins (2) --- */
/* neobrutalism is free (the PRD default). */

const SKIN_ITEMS: ShopItem[] = [
  {
    id: "skin-swiss",
    category: "skin",
    name: "Swiss / International",
    blurb: "Thin hairlines, no shadows, strict grid. Nothing decorative.",
    rarity: "rare",
    price: 400,
    preview: { kind: "skin", skin: "swiss" },
    asset: { key: "swiss", skin: "swiss" },
  },
  {
    id: "skin-glassmorphism",
    category: "skin",
    name: "Viewport / Glass",
    blurb: "Frosted translucent panels, blur, big soft radius. Reads as HUD.",
    rarity: "epic",
    price: 1200,
    preview: { kind: "skin", skin: "glassmorphism" },
    asset: { key: "glassmorphism", skin: "glassmorphism" },
  },
];

export const FREE_SKIN_IDS = ["neobrutalism"];

/* ------------------------------------------------------------- exports --- */

export const ITEMS: ShopItem[] = [
  ...ICON_SETS,
  ...COMPANION_ITEMS,
  ...WALLPAPER_ITEMS,
  ...SKIN_ITEMS,
];

export const ITEMS_BY_ID: Record<string, ShopItem> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i]),
);

export const CATEGORY_LABEL: Record<ShopCategory, string> = {
  icons: "Icon sets",
  companion: "Companions",
  wallpaper: "Wallpapers",
  skin: "Design skins",
};

export const CATEGORY_ORDER: ShopCategory[] = ["icons", "companion", "wallpaper", "skin"];

/** items in a category, cheapest rarity first then price */
export function itemsInCategory(category: ShopCategory): ShopItem[] {
  return ITEMS.filter((i) => i.category === category).sort(
    (a, b) => RARITY_ORDER[a.rarity] - RARITY_ORDER[b.rarity] || a.price - b.price,
  );
}
