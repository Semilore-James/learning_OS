# Coin economy — design (Council: game designer + finance/ops + PM)

Status: **earn side agreed and being implemented. Catalog is a taxonomy for you
to fill with item designs.**

## The principle that survived (from the earlier shop Council)

Learning stays free forever. Coins buy **cosmetic** unlocks only, never anything
that affects progress, review, cases, or games. XP is learning progress and is
never spendable.

What changed: "coins come from games only" was an implementation detail, not the
principle. The reader who clears three cases and ten chapters and never opens a
game had an empty wallet and a locked shop, which punishes the exact behaviour
we want. Coins now drop from several sources, weighted.

## 1. Coin sources (v1 — implemented)

Game designer's shape: a **spike** for skill, a **drip** for showing up, a
**chunk** for finishing something real, gated so none of it can be farmed.

| Source | Coins | Farm guard |
|---|---|---|
| Game level cleared (new best) | `10 + level x 2` | difficulty is the cap; a re-clear pays `3` |
| Chapter read (first time only) | `6` | each chapter pays once, ever (~100 chapters total = ~600 lifetime) |
| Node completed (first time) | `15` | finite; one per curriculum node |
| Streak day (first activity logged that day) | `10 + min(streakDays, 20)` | once per calendar day; day 1 pays 11, day 20+ pays 30 |
| Case completed | `100` accepted / `50` overridden | 20 cases total, not repeatable |

**Modelled active day** (mixed use): ~3 new chapters (18) + a streak day at week
two (25) + two game clears (~34) = ~77 coins/day, ~500/week. A case clear that
week adds 100. Call it **~2,000 coins in a busy month**.

Milestones (level-up, streak 7/30/100) as coin windfalls are **phase 2** — cheap
to add later through the same path.

## 2. Spending — schema only for now

- `state.coins = { earned, spent, lastStreakDay }`; balance = `earned - spent`.
- `state.unlocks: string[]` — item ids the learner owns.
- Account: `coin_events(user_id, reason, amount, created_at)` append-only, positive
  for earns, negative for purchases; balance = `sum(amount)`. Existing accounts
  seed `earned` from their old game score so nobody loses a balance.
- A purchase is: check `balance >= price`, append a negative `coin_event`, push
  the item id to `unlocks`. One `purchaseItem` action, guarded in the reducer.

## 3. The 1000+ item catalog — taxonomy (you design the items)

Not a flat list. **8 categories x 5 rarities x ~25 items = ~1,000.**

### Categories
1. **Wallpapers** — procedural scenes and, later, hand-made art
2. **Desktop skins** — chrome languages beyond neobrutalism / swiss / glass
3. **Window themes** — titlebar + border + shadow treatments
4. **Boot sequences** — the animation on load
5. **Cursor trails** — particle / ink / comet effects on the pointer
6. **Icon sets** — alternate app-icon glyph styles
7. **Sound packs** — click / complete / level-up audio (respects the mute toggle)
8. **Avatar frames & badges** — shown on the profile and the public /share page

### Rarity → price band → gate

| Rarity | Price band | Extra gate beyond coins |
|---|---|---|
| Common | 20 – 60 | none — the shop is never fully locked |
| Uncommon | 80 – 200 | none |
| Rare | 250 – 700 | none |
| Epic | 1,000 – 4,000 | none |
| Legendary | 8,000 – 60,000 | **an achievement too** — e.g. "clear 10 cases", "level 15", "365-day streak". Money alone never buys a legendary. |

Roughly half the catalog sits under 500 coins, so there is always something to
buy; the top end is a genuine multi-year goal. The catalog (1,000 items,
250,000+ coins of content) permanently outgrows the wallet, which is what keeps
the shop alive without inflation.

### Shop window layout (when built)
- Category tabs across the top.
- Within a category: rarity sections, cheapest first.
- Each item card: preview, name, price, "owned" / "equip" / a lock icon with the
  achievement requirement if legendary.
- A "featured" strip that rotates weekly (three items, one per mid rarity) to
  give a reason to check back.

## 4. What ships now vs. later

**Now:** the `coins` schema + migration, the five earn sources wired through one
reducer helper, `select.coinBalance`, `coin_events` table, ProfileCard + Shop
showing the real balance.

**Later (needs your item designs):** the `ITEMS` catalog file, the `purchaseItem`
action + reducer guard, the achievement-gate check, the rebuilt Shop window with
equip logic, wiring each unlock into its subsystem (wallpaper picker, skin
picker, cursor renderer, sound player, ...).
