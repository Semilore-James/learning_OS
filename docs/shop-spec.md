# Shop — implementation spec (spend side)

This supersedes the `task_c426bb82` prompt. Earn side is already live
(`docs/coin-economy.md`, commit d540d41). This is the build for spending coins.

Branch: work off `shop-spec`. Migration number is **0010** (0009 is onboarding).

---

## 1. Scope — what ships, what's a locked card

The Council cut "full 8-category shop now" (weeks of empty plumbing). Ship the
items that are backed by a real asset and a renderer. Everything else in the
1000-item taxonomy ships as a **locked catalogue card** (price + preview +
"coming soon"), so the ambition is visible without being a promise.

### v1 buyable (this build)
| Item | Category | Asset | New infra needed |
|---|---|---|---|
| Retro icon set | `icon-set` | itch.io pack (~1 MB) | glyph-set indirection in `IconGrid` |
| Desktop companion "Rogue" | `companion` | 1 medieval sprite, Walk sheet only (~200 KB) | `DesktopCompanion.tsx` |

### v1 fast-follow (same PR if time, else next)
| Item | Category | Asset | Infra |
|---|---|---|---|
| 3 premium wallpaper variants | `wallpaper` | recolour/intensity variants of existing procedural SVGs | none — new `WALLPAPERS` entries |
| 2 window themes | `window-theme` | CSS token sets | one `data-window-theme` attr + globals block |

### Locked catalogue only (data + card, no renderer)
Boot sequences, cursor trails, sound packs, avatar frames & badges, plus the
long tail of every category. `available: false`.

---

## 2. Assets — where they come from, where they go

**Retro icon set** — `C:\Users\Morpheus\Downloads\itchio-pxl-retro-computer-icons-set-110.zip`
- Use `separated-items/*.png` only (skip the `.aseprite` source and the sheet).
- Pick ~12 that map to the apps (a monitor, a folder, a chat bubble, a grid, a
  chart, a gamepad, a bag, a book, a pen, a wrench, a bell-ish, a spark).
- Drop at `app/public/shop/icons/retro/<appId>.png` (e.g. `constellation.png`,
  `casefiles.png`). 32-64 px, PNG. Commit these (~1 MB total is fine).

**Desktop companion** — `C:\Users\Morpheus\Downloads\free-medieval-bandit-4-direction-character-pack.zip`
- 124 MB zip. Extract **one** character (Robber or Thug), and from it **only**
  `PNG/Spritesheets/*Walk*.png` (the walking spritesheet, one direction).
- Downscale to ~32-48 px per frame if it's larger. Target < 250 KB.
- Drop at `app/public/shop/companions/rogue/walk.png`. Commit it.
- Do **not** commit the AI/, EPS/, PNG Sequences/, or other directions.

**Do NOT use** `Pixelart_App_Icons_v5_by_ReffPixels.zip` anywhere. It's ~150
real brand logos (Discord, Gmail, Amazon, Firefox…). Trademark liability in a
product with a currency. Skeptic-coder veto stands.

---

## 3. State

Keep `profile.wallpaperId` and `profile.skin` exactly as they are — they're the
"currently applied" values and the renderers already read them. Add:

```ts
// lib/store/types.ts — profile
equipped: {
  iconSet: string;          // "" = default SVG glyphs
  companion: string | null; // null = none
  windowTheme: string;      // "" = skin default
  // future slots land here; wallpaper + skin stay as their own fields
};
```

```ts
// AppState — already exists, currently always []
unlocks: string[];          // shop item ids the learner owns
```

`EMPTY_STATE`: `equipped: { iconSet: "", companion: null, windowTheme: "" }`.

**Ownership rule (uniform):** an item is usable if it's free or owned.
```ts
select.owns(state, itemId) = ITEMS_BY_ID[itemId]?.price === 0 || state.unlocks.includes(itemId)
```
The 16 existing wallpapers and 3 existing skins are **free and stay free** —
they are not shop items, never go in `unlocks`, never get a price. Nothing a
user already has is taken away.

---

## 4. Catalogue — `app/content/shop/items.ts`

Structure and a real seed set are in that file (this branch). Shape:

```ts
export type ShopCategory =
  | "wallpaper" | "skin" | "window-theme" | "boot"
  | "cursor" | "icon-set" | "sound" | "avatar-frame" | "companion";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface ShopItem {
  id: string;              // "icon-set.retro-terminal" — category prefix, stable
  category: ShopCategory;
  name: string;
  blurb: string;           // one line, in the PM's dry register
  rarity: Rarity;
  price: number;           // coins
  available: boolean;      // false -> locked "coming soon" card
  gate?: { achievement: string; label: string };  // legendaries only
  asset?: string;          // renderer key / path
}
```

Price bands by rarity (from `coin-economy.md`, do not change):
common 20-60 · uncommon 80-200 · rare 250-700 · epic 1,000-4,000 ·
legendary 8,000-60,000 (+ achievement gate).

Legendary gate check: `gate.achievement` is an id the reducer resolves against
progress — start with `"cases-10"`, `"level-15"`, `"streak-365"`,
`"chapters-50"`. Helper `select.hasAchievement(state, id)`.

The seed file has the 2 v1 items fully specified plus ~35 representative
catalogue entries so the shape and the tabs render. The remaining ~950 are a
design task — add them to this same file over time, no code change.

---

## 5. Reducer + selectors

```ts
// actions
| { type: "purchaseItem"; itemId: string }
| { type: "equipItem"; category: ShopCategory; itemId: string | null }
```

**`purchaseItem`** guards, in order, returning `state` unchanged on any fail:
1. item exists and `available`
2. not already in `unlocks`
3. `gate` — if present, `select.hasAchievement(state, gate.achievement)`
4. `select.coinBalance(state) >= item.price`

Then: `coins.spent += price`, `unlocks.push(id)`, and auto-equip (call the same
logic as `equipItem`).

**`equipItem`** guards `owns(state, itemId)` then:
- `category === "wallpaper"` → set `profile.wallpaperId`
- `category === "skin"` → set `profile.skin`
- else → set `profile.equipped[category]`
- `itemId === null` → clear that slot (companion, cursor, etc.)

Selectors: `owns`, `equipped(category)`, `canAfford(itemId)`, `hasAchievement(id)`.

---

## 6. Persistence — `lib/store/adapters/supabase.ts`

Migration **0010** (`supabase/migrations/0010_shop.sql`, on this branch):
```sql
create table public.user_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);
alter table public.user_unlocks enable row level security;
create policy own_unlocks on public.user_unlocks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.profiles
  add column if not exists equipped jsonb not null default '{}'::jsonb;
```

- **loadState**: `unlocks` = `select item_id from user_unlocks`; `equipped` =
  `profiles.equipped` merged over the default shape.
- **commit `purchaseItem`**: insert into `user_unlocks`; the negative
  `coin_events` row is already handled by the existing top-of-`commit`
  `spentDelta` mirror (line ~200) — do not double-insert.
- **commit `equipItem`** / the wallpaper/skin cases: add to the existing
  `profiles.update({...})` action group, include `equipped: next.profile.equipped`.
- `resetProgress` table list: add `"user_unlocks"`. `equipped` resets with the
  profile is fine, or leave it (cosmetics survive a progress wipe — preferable).
- `migrateGuestToAccount`: replay `unlocks` as `user_unlocks` rows; carry
  `equipped`.

Guest (`localAdapter`): whole blob, nothing to do.

hydrate fail-safe: `merged.profile.equipped = { ...DEFAULT_EQUIPPED, ...loaded }`.

---

## 7. Renderers

**Icon set** — `components/desktop/glyphs.tsx`:
```ts
export const GLYPH_SETS: Record<string, Partial<Record<string, ReactNode>>> = {
  "": DEFAULT_GLYPHS,                       // current SVGs, keyed by appId
  "icon-set.retro": RETRO_GLYPHS,           // <img src="/shop/icons/retro/{appId}.png">
};
```
`IconGrid`: `const set = GLYPH_SETS[equipped.iconSet] ?? GLYPH_SETS[""]; ... {set[a.id] ?? DEFAULT_GLYPHS[a.id]}`. Fall back per-icon so a partial set still works.

**Companion** — `components/desktop/DesktopCompanion.tsx`, mounted in the Desktop
shell next to `<Celebrations />`:
- `if (!equipped.companion || !useMotionAllowed()) return null;`
- absolutely positioned just above the taskbar, a `<div>` with the walk sheet as
  `background-image`, `background-position` animated with `steps(N)` + a
  `translateX` keyframe that paces it back and forth across ~60% of the width,
  ~20 s loop. Pure CSS animation, no JS ticker.
- `z-[3]` — behind windows, above the wallpaper.

**Window themes** (fast-follow) — `ChromeController` also writes
`el.dataset.windowTheme = equipped.windowTheme`; globals.css gets a
`:root[data-window-theme="..."]` block overriding titlebar/border/shadow tokens.

---

## 8. Shop window — rebuild `components/shop/ShopWindow.tsx`

- Balance pill top-right (already there).
- **PostHog A/B gate** (see §9): `control` → keep the current "coming soon"
  plan view. `live` → the real shop below.
- Category tabs across the top (only categories with ≥1 item).
- Within a category: rarity sections, cheapest first.
- Item card: preview swatch, name, blurb, price. State-dependent footer:
  - not owned, affordable, available → **Buy (N coins)** button →
    `dispatch purchaseItem`
  - not owned, `gate` unmet → lock icon + `gate.label`
  - not owned, can't afford → greyed price
  - `available: false` → "coming soon" ribbon
  - owned, not equipped → **Equip**
  - owned, equipped → "Equipped" tag + (for companion/cursor) **Unequip**
- Featured strip: 3 items, `id`-hash by ISO week so it rotates weekly, one per
  mid rarity (uncommon/rare/epic), all `available`.
- Buying: button shows a brief disabled/loading state during the optimistic
  dispatch (match the CaseFiles "Send to PM" pattern).

Gate the wallpaper + skin pickers in `SettingsWindow` behind `select.owns` only
for items that ARE shop items — the 16 free wallpapers and 3 free skins render
unconditionally as now. A shop wallpaper the user hasn't bought shows a small
lock and routes to the Shop.

---

## 9. PostHog A/B test

Flag key: **`shop-live`**, variants `control` / `live`.

`ShopWindow`:
```tsx
import { useFeatureFlagVariantKey } from "posthog-js/react";
const variant = useFeatureFlagVariantKey("shop-live");
const shopLive = variant === "live";
```
(Provider is already wired — `AnalyticsProvider` renders `PostHogProvider`.)

New analytics events (`lib/analytics/events.ts` EventMap):
```ts
shop_opened: { variant: string };
shop_item_purchased: { item_id: string; category: string; rarity: string; price: number };
shop_item_equipped: { item_id: string; category: string };
```
Fire `shop_opened` on window open with the variant, `shop_item_purchased` in the
`purchaseItem` commit path (via `eventsForAction`), `shop_item_equipped` likewise.

**Experiment in PostHog:** flag `shop-live`, 50/50, goal metric = 7-day
`session_start` retention, secondary = `shop_item_purchased` count. Ship both
arms behind it; `control` is the current plan view so there's zero risk to the
non-shop experience. Turn the winner to 100% after significance.

---

## 10. Build order

1. Migration 0010 + regenerate `database.types.ts`.
2. State: `equipped` on profile, `purchaseItem`/`equipItem` actions, reducer
   guards, selectors. Unit-check the reducer guards inline.
3. Adapter: load/commit `unlocks` + `equipped`, `migrateGuestToAccount`.
4. `content/shop/items.ts` — flesh out from the seed (this branch has the shape).
5. Assets: strip the two packs into `public/shop/`.
6. Renderers: `glyphs.tsx` GLYPH_SETS + `IconGrid` indirection, then
   `DesktopCompanion.tsx`.
7. Rebuild `ShopWindow.tsx` with the A/B gate.
8. Gate the Settings pickers for shop items only.
9. Analytics events + `eventsForAction` wiring.
10. Verify in a production build (guest + account): earn coins, buy the icon
    set, equip it, see the icons change; buy the companion, see it walk; reload,
    ownership persists; `control` variant still shows the plan view.

CHANGELOG.md entry. No `as any`. Keep `docs/coin-economy.md` and this file in
sync if the taxonomy shifts.
