# Shop work log — night of 2026-08-31

Everything below is on `main` and building green (tsc + eslint + `next build`).
Commits `74e60cb` → `1c29155`.

---

## 1. What changed

### Companions: 3 → 10, new source

- **Dropped** the 3 medieval-bandit companions. Reasons: the pack only had 3
  characters, irregular sheets, and a detailed style that would clash with any
  set added next.
- **Added 10** from the **Ninja Adventure Asset Pack** (pixel-boy) — **CC0, no
  attribution required**, fetched from the Superpowers GitHub mirror (no itch
  download flow). 25 cohesive 16px top-down characters to choose from; I picked
  10 with visual spread: `ninja-green ninja-red ninja-grey scout villager
  wanderer ember knight sentinel crimson`.
- Prices: 3 common (40–60), 3 uncommon (120–200), 2 rare (350–550), 1 epic
  (1800), 1 legendary (`crimson`, 9000 + gated at level 5).
- Each character sliced into 80px strips: `idle` (1f), `walk` (4f), `cheer`
  (2f — attack+jump), `sit` (1f — lie-down, used for doze). Right-facing only;
  left is a CSS flip. Uploaded to the `shop-assets` bucket. Local copies in
  `supabase/shop-assets/companions/` for reproducibility. Full pipeline in
  `docs/shop-assets.md`.

**Why not more/other packs:** LPC sprites are CC-BY-SA (sharealike — messy for a
paid shop). PIPOYA and most itch "free" packs forbid redistribution, which
uploading to our bucket is. Kenney's character packs are side-view platformer,
not top-down. Ninja Adventure was the only CC0 source with a large, consistent,
git-fetchable character set. If you want a second *style family* later (e.g. a
"realistic" or "chibi" set), that's a separate pack + a naming convention.

### Icon sets: 1 → 3

- Kept `retro` (itch.io pixel PNGs).
- Added `pixel` — **pixelarticons** (MIT), monochrome pixel-line SVGs.
- Added `solid` — **Phosphor Icons** "fill" weight (MIT), bold filled SVGs.
- `lib/shop/iconSets.tsx` generalised to render either PNG or inline SVG. SVG
  path data is vendored inline (no npm dep, no bundler config). ~14 app-id
  mappings per set; unmapped falls back to the lucide glyph.
- More sets later: add a `SetDef` + the mappings. Kenney's CC0 Game Icons would
  give a chunky coloured set.

### Wallpapers + skins: reverted to free

Per your call. All 16 wallpapers and all 3 skins are free again — the shipped
ones are **not** re-sold. Settings pickers lost the lock UI. The shop's
wallpaper/skin slots are reserved for future *original* art you add. Shop now
has exactly two categories: Companions, Icon sets.

### Companion performance rewrite

You were right that it was heavy. The old version ran a **25 fps `setInterval`**
that called `setState` (position + phase) on a component subscribed to the whole
store — 25 React re-renders/sec.

New version:
- Sprite frames run on a **pure-CSS `steps()` animation** — zero JS per frame.
- Position is written **straight to the DOM** (`el.style.transform`) from a
  `requestAnimationFrame` loop that **only runs while walking**. Idle / sit /
  doze = no rAF at all.
- A single coarse **500 ms "brain"** interval makes decisions (walk here, sit,
  peek). `setState` fires only on phase changes — a few times a minute.
- Everything **pauses while the tab is hidden**.
- A/B measured (production build, in the preview browser): companion on vs.
  hidden is within measurement noise (~1 fps, and the browser pane's own
  overhead + the animated starfield wallpaper dominate the numbers). Idle cost
  is effectively nil now.

### Companion behaviour — more range

- States: `idle`, `walk`, `cheer`, `doze` (sits + "z z z" after 90 s with no
  pointer/keyboard activity — wakes on any input), `sit` (voluntary, ~28% of
  rests), `glum` (streak 0 with history — static, desaturated), **`peek`** (~14%
  of moves: slips off a screen edge, holds ~1 s, comes back on).
- **Glances over** (`cheer` pose, brief) when any window opens.
- **Waves** (`cheer`) once when it first appears.
- Minimum wander distance raised to ~200–260 px so it stops turning on the spot.
- **Idle fixed:** was 2 frames alternating right-facing / front-facing, which
  read as the head spinning ("rotate too much"). Now a single right-facing frame.

---

## 2. Council — "can the companion interact with the desktop furniture?"

You asked about climbing to app icons, knocking on windows, peeking from behind
a window, interacting with the wallpaper. Ran it through the Council.

**The fork:**
- **A** — full environmental interaction: companion reads live geometry of icons
  + open windows, pathfinds to them, has climb / knock / perch animations,
  reacts to window open/close/focus, interacts with wallpaper elements.
- **B** — scripted set-pieces anchored to *fixed* screen positions (edges,
  taskbar, the notification bell, the Continue chip). No window-manager coupling.
- **C** — nothing more; the current state set is enough.

**Eliminated:**
- **A — killed by the skeptic coder.** It couples a cosmetic to the most
  volatile state in the app: window positions (draggable, resizable, maximised),
  z-order, focus, and the responsive icon grid. Breaks when a window is dragged
  mid-approach, when the grid reflows, on a narrow viewport. And the Ninja
  Adventure sheet has **no climb / knock / ladder frames** — "climb to an app"
  can't actually be drawn, only faked badly.
- **A — also killed by the product manager.** A learner bought a companion for
  delight. A sprite crawling over the Case Files window while they work a hard
  problem is hostile. The companion must stay peripheral and ignorable.
- **C — killed by the game designer.** You explicitly asked for more range, and
  "peek from behind something" is a genuinely good beat (Stardew junimos, the
  Clippy-done-right fantasy). Leaving it at plain wandering wastes the hook.

**Survived: B**, scoped to fixed anchors. The teacher's call: A dies to layout
fragility and to being un-drawable with this art; C under-delivers on a direct
request; B gives the "surprising, alive" feeling without ever touching window
geometry.

**Is B "something you'd do"?** Yes — it's exactly the ask, done without turning
the pet into Clippy or a perf problem. So:

- **Done tonight (a down payment on B):** edge-peek, window-open glance,
  voluntary sit, wave-on-appear.
- **Not done tonight, recommended next:** perch on the taskbar's left/right end;
  amble to the notification bell and look up at it when it has unread milestones;
  sit on the "Continue: <track>" chip. Each is a fixed screen anchor + a
  walk-there + face-it + a small hop (the jump frame). ~an afternoon. I held off
  because it's meaty, you were asleep, and I wanted the shop pass solid first.
- **Rejected:** anything that reads live window or icon positions.

---

## 3. Design pass (game-designer eye, vs. real game shops)

Referenced: Fortnite item shop (rarity = the card's identity, featured rail,
owned state), Polytopia tribe shop (preview-the-style cards), Balatro unlocks
(locked items teased with the unlock condition, not just greyed out).

Applied:
- **Rarity accent bar** — a rarity-tinted stripe down the left of every card.
  Rarity was a tiny mono label before; now it's visible at a glance.
- **Locked legendary teases progress** — "Reach level 5 · you're at 3" instead of
  a dead "Locked" button.
- **Coin balance count-ups** when you spend (uses the app's existing `CountUp`).
- **"Owned"** replaces the rarity label on cards you own.
- **Featured strip variety** — takes one item per category, then fills by
  ascending rarity, and never features a legendary. Previously it was usually
  three companions.
- **Companion preview walks on hover** instead of standing still.

Not done (candidates for later): a "NEW" pill on featured cards; a countdown to
the next weekly rotation; bundle pricing; a claimable free daily item.

---

## 4. Known issues / loose ends

- **Guest-mode banner overlaps the companion.** The "Guest mode — progress saves
  to this browser only" banner sits at the bottom-centre (z-150); the companion
  is behind it (z-6). Guest-only and cosmetic. Options if it bothers you: raise
  the companion above the banner (but then it draws over an open window's bottom
  edge), or make it avoid that horizontal band. Left as-is for now.
- **Supabase Storage CDN caches public objects ~1 h.** Re-uploading an asset to
  the same path does *not* show up until the cache expires — you must
  `supabase storage rm` the path first (delete busts the cache), or during
  iteration set `--cache-control "max-age=60"`. Bit me once tonight (stale idle
  frames showed as doubled sprites). Documented in `docs/shop-assets.md`.
- **Orphaned files in the bucket.** Old bandit sprites (`companions/assassin` etc.)
  and a stray `companions/companions/...` tree from an earlier bad upload path
  are still there. The experimental `supabase storage rm -r` silently no-ops in
  CLI 2.116.0. Nothing references them. Clean from the Supabase dashboard if you
  care (~1 MB).
- **`gen types` not re-run.** `database.types.ts` was hand-edited for migration
  0010 (which is applied and live). No schema change tonight. Run
  `npx supabase gen types typescript --project-id txyvxlgianhrffumdxnu > app/lib/supabase/database.types.ts`
  whenever convenient to confirm parity.
- The **icon-set `pixel` glyphs bleed to the tile edges** a little (pixelarticons
  are 24px designed to fill). Looks fine but could inset them ~2px.

---

## 5. The SQL game (from earlier — for reference)

Council verdict stands: build the small **"SQL Settlement"** — a finite ~12-level
campaign where the game owns a real relational schema and you write real SQL
(INSERT / UPDATE…WHERE / DELETE / JOIN / GROUP BY…HAVING / one transaction) to
hit each level's goal; the tile map + your companion sprite re-render from the
database after every successful statement. Movement is arrow keys, not SQL.
Battles are one aggregate query. Runs on the existing sql.js engine, ships as
game #5, feeds `recordGameScore`. Full 12-step build plan is in the chat above
this log. Not started.

---

## 6. Where to pick up

1. Look at the shop in the running app (companions + icon sets, featured strip,
   rarity bars, buy/equip). Sanity-check the 10 companion picks and the prices.
2. Decide how far to take companion behaviour B (taskbar perch / bell / chip).
3. Say go on the SQL Settlement game, or push it behind more textbook content.
4. Optional: add your own premium wallpaper art → drops into
   `content/shop/items.ts` as `wallpaper` items + `app/public/wallpapers/`.
