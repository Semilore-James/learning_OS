/* ============================================================================
   Shop catalogue. See docs/shop-spec.md for the full plan.

   - The 16 built-in wallpapers and 3 built-in skins are FREE and are NOT in
     this file. Nothing a learner already has is sold back to them.
   - `available: false` = a locked "coming soon" card (price + preview, no buy).
   - Legendary items also need `gate` — money alone never buys one.
   - This is a seed: the 2 v1 items are real, the rest establish the shape and
     the tabs. Filling out the ~1000-item taxonomy is an ongoing design task and
     needs no code change, just more entries here.
   ========================================================================== */

export type ShopCategory =
  | "wallpaper"
  | "skin"
  | "window-theme"
  | "boot"
  | "cursor"
  | "icon-set"
  | "sound"
  | "avatar-frame"
  | "companion";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ShopItem {
  /** stable id, category-prefixed: "icon-set.retro" */
  id: string;
  category: ShopCategory;
  name: string;
  /** one line, the PM's dry register */
  blurb: string;
  rarity: Rarity;
  /** coins */
  price: number;
  /** false = locked catalogue card, not purchasable yet */
  available: boolean;
  /** legendaries only: an achievement that must also be met */
  gate?: { achievement: string; label: string };
  /** renderer key / asset path, meaning depends on category */
  asset?: string;
}

/** price sanity per rarity (docs/coin-economy.md) — not enforced, a guide */
export const PRICE_BAND: Record<Rarity, [number, number]> = {
  common: [20, 60],
  uncommon: [80, 200],
  rare: [250, 700],
  epic: [1000, 4000],
  legendary: [8000, 60000],
};

export const CATEGORY_LABEL: Record<ShopCategory, string> = {
  wallpaper: "Wallpapers",
  skin: "Desktop skins",
  "window-theme": "Window themes",
  boot: "Boot sequences",
  cursor: "Cursor trails",
  "icon-set": "Icon sets",
  sound: "Sound packs",
  "avatar-frame": "Avatar frames & badges",
  companion: "Desktop companions",
};

export const ITEMS: ShopItem[] = [
  /* ---- v1 buyable: real assets + renderers ------------------------------ */
  {
    id: "icon-set.retro",
    category: "icon-set",
    name: "Retro Terminal",
    blurb: "Chunky pixel icons like a machine from 1994. Every app, restyled.",
    rarity: "rare",
    price: 450,
    available: true,
    asset: "/shop/icons/retro", // per-app PNGs: /shop/icons/retro/<appId>.png
  },
  {
    id: "companion.rogue",
    category: "companion",
    name: "The Rogue",
    blurb: "A small hooded figure that paces the taskbar while you work. Says nothing. Judges silently.",
    rarity: "epic",
    price: 2200,
    available: true,
    asset: "/shop/companions/rogue/walk.png",
  },

  /* ---- v1 fast-follow: data + a small renderer branch ------------------- */
  {
    id: "wallpaper.black-hole-crimson",
    category: "wallpaper",
    name: "Black Hole (Crimson)",
    blurb: "The accretion disk, dialled to red-shift. Same physics, angrier.",
    rarity: "uncommon",
    price: 160,
    available: false,
    asset: "black-hole-crimson",
  },
  {
    id: "wallpaper.milky-way-mono",
    category: "wallpaper",
    name: "Milky Way (Ink)",
    blurb: "The galactic band in one colour. For people who find stars distracting.",
    rarity: "uncommon",
    price: 140,
    available: false,
    asset: "milky-way-mono",
  },
  {
    id: "wallpaper.quasar-deep",
    category: "wallpaper",
    name: "Quasar (Deep Field)",
    blurb: "The jet, pushed further out, with a fainter core. More room to think.",
    rarity: "rare",
    price: 380,
    available: false,
    asset: "quasar-deep",
  },
  {
    id: "window-theme.hairline",
    category: "window-theme",
    name: "Hairline",
    blurb: "One-pixel borders, no shadow, titlebar flush with the content. Disappears.",
    rarity: "uncommon",
    price: 120,
    available: false,
    asset: "hairline",
  },
  {
    id: "window-theme.crt",
    category: "window-theme",
    name: "CRT",
    blurb: "Rounded corners, a faint inner glow, a scanline you'll stop noticing in a minute.",
    rarity: "rare",
    price: 300,
    available: false,
    asset: "crt",
  },

  /* ---- locked catalogue: shape only, no renderer yet ------------------- */
  // boot sequences
  { id: "boot.dot-matrix", category: "boot", name: "Dot Matrix", blurb: "The name prints one character at a time, with the noise.", rarity: "common", price: 40, available: false },
  { id: "boot.warp", category: "boot", name: "Warp In", blurb: "Stars streak past, then snap to the desktop.", rarity: "uncommon", price: 150, available: false },
  { id: "boot.cold-start", category: "boot", name: "Cold Start", blurb: "A POST check that scrolls too fast to read, like a real one.", rarity: "rare", price: 400, available: false },

  // cursor trails
  { id: "cursor.ink", category: "cursor", name: "Ink", blurb: "A thin trail that pools and fades where you stop.", rarity: "common", price: 50, available: false },
  { id: "cursor.comet", category: "cursor", name: "Comet", blurb: "A short bright tail. Brighter when you move fast.", rarity: "uncommon", price: 180, available: false },
  { id: "cursor.constellation", category: "cursor", name: "Constellation", blurb: "Drops a faint star every so often; they wink out after a few seconds.", rarity: "rare", price: 550, available: false },

  // sound packs
  { id: "sound.mechanical", category: "sound", name: "Mechanical", blurb: "Buckling-spring clicks. Completion is a satisfying chunk.", rarity: "uncommon", price: 200, available: false },
  { id: "sound.soft", category: "sound", name: "Soft", blurb: "Rounded taps, a low chime on complete. Nothing sharp.", rarity: "common", price: 60, available: false },
  { id: "sound.arcade", category: "sound", name: "Arcade", blurb: "Coin-op blips. Level-up is a full jingle. Use with headphones or mercy.", rarity: "rare", price: 500, available: false },

  // avatar frames & badges
  { id: "avatar-frame.bronze", category: "avatar-frame", name: "Bronze Ring", blurb: "A plain metal ring on your profile picture.", rarity: "common", price: 30, available: false },
  { id: "avatar-frame.circuit", category: "avatar-frame", name: "Circuit", blurb: "Traced lines around the frame, like a board.", rarity: "uncommon", price: 190, available: false },
  { id: "avatar-frame.orbit", category: "avatar-frame", name: "Orbit", blurb: "A small body that circles your avatar slowly.", rarity: "epic", price: 1600, available: false },

  // more icon sets (locked)
  { id: "icon-set.blueprint", category: "icon-set", name: "Blueprint", blurb: "White line-art on a drafting-blue tile. Technical.", rarity: "rare", price: 600, available: false },
  { id: "icon-set.hand-drawn", category: "icon-set", name: "Hand-drawn", blurb: "Wobbly ink versions of every icon. Warmer, less serious.", rarity: "uncommon", price: 220, available: false },

  // more skins (locked — these are NEW chrome languages, not the free 3)
  { id: "skin.terminal", category: "skin", name: "Terminal", blurb: "Monospace everything, green on black, block cursor. Commit to the bit.", rarity: "epic", price: 3000, available: false },
  { id: "skin.paper", category: "skin", name: "Paper", blurb: "Off-white, serif, thin rules. Reads like a document, not an OS.", rarity: "rare", price: 700, available: false },

  // more companions (locked)
  { id: "companion.drone", category: "companion", name: "Survey Drone", blurb: "Hovers in one corner, occasionally scans a slow line across the screen.", rarity: "epic", price: 2600, available: false },
  { id: "companion.cat", category: "companion", name: "Server Cat", blurb: "Sleeps on the taskbar. Stretches when you complete something.", rarity: "rare", price: 650, available: false },

  /* ---- legendaries: achievement-gated ---------------------------------- */
  {
    id: "wallpaper.singularity",
    category: "wallpaper",
    name: "Singularity",
    blurb: "Hand-made. The one every other wallpaper is a study for. You'll know when you've earned it.",
    rarity: "legendary",
    price: 20000,
    available: false,
    gate: { achievement: "cases-10", label: "Clear 10 case files" },
  },
  {
    id: "skin.command",
    category: "skin",
    name: "Command",
    blurb: "The skin the whole product was almost built in. Dense, fast, no ornament.",
    rarity: "legendary",
    price: 30000,
    available: false,
    gate: { achievement: "level-15", label: "Reach level 15" },
  },
  {
    id: "avatar-frame.founder",
    category: "avatar-frame",
    name: "Founder",
    blurb: "A year of not missing a day, on a small enamel pin. There is no other way to get this.",
    rarity: "legendary",
    price: 8000,
    available: false,
    gate: { achievement: "streak-365", label: "365-day streak" },
  },
];

export const ITEMS_BY_ID: Record<string, ShopItem> = Object.fromEntries(
  ITEMS.map((i) => [i.id, i]),
);

/** categories that currently have at least one item (for the tab row) */
export const ACTIVE_CATEGORIES: ShopCategory[] = [
  ...new Set(ITEMS.map((i) => i.category)),
];
