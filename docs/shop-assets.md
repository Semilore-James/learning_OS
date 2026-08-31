# Shop assets

How the v1 shop's art was produced and where it lives.

## Icon sets — shipped in the app bundle / inline

`app/lib/shop/iconSets.tsx` maps each app id to an icon per set. Unmapped ids
fall back to the built-in lucide glyph.

| Set key | Source | Licence | Form |
|---|---|---|---|
| `retro` | itch.io "PXL Retro Computer Icons (110)" | free, redistributable | 32px PNGs in `app/public/shop/icons/retro/items/` |
| `pixel` | [pixelarticons](https://github.com/halfmage/pixelarticons) | MIT | SVG path data inlined in `iconSets.tsx` (viewBox 24) |
| `solid` | [Phosphor Icons](https://github.com/phosphor-icons/core) "fill" weight | MIT | SVG path data inlined in `iconSets.tsx` (viewBox 256) |

To add a set: add a `SetDef` to `SETS` in `iconSets.tsx` and fill in the ~14
app-id → icon mappings.

## Desktop companions — Supabase Storage

Bucket **`shop-assets`** (public read), created by migration `0010_shop.sql`.
Layout: `companions/<name>/<anim>.png`.

- **names** (10): `ninja-green ninja-red ninja-grey scout villager wanderer ember
  knight sentinel crimson`
- **anims**: `idle` (1 frame), `walk` (4), `cheer` (2 — attack + jump), `sit` (1
  — lie-down, used for the doze state). Frame counts + fps in
  `app/lib/shop/companions.ts`.
- **frames**: 80px, horizontal strips. Right-facing only; left is a CSS
  `scaleX(-1)`.

Source: **Ninja Adventure Asset Pack** by pixel-boy — **CC0**, via the
[Superpowers mirror](https://github.com/sparklinlabs/superpowers-asset-packs/tree/master/ninja-adventure)
(`characters/1.png` … `25.png`). Each character is a 4×7 grid of 16px frames:
columns = direction (DOWN 0, UP 1, LEFT 2, RIGHT 3), rows 0–3 = walk cycle,
row 4 = attack, row 5 = jump, row 6 = down/dead. We take the RIGHT column, scale
×5, and lay the needed rows out as strips. Processed strips are kept in
`supabase/shop-assets/companions/` for reproducibility.

### Re-uploading

```bash
# needs SUPABASE_ACCESS_TOKEN in the env (or `supabase login`)
cd learning_OS
npx supabase storage cp -r supabase/shop-assets/companions ss:///shop-assets --linked --experimental
```

Base URL is `NEXT_PUBLIC_SHOP_ASSET_BASE`, which is **optional** — it falls back
to `<project>.supabase.co/storage/v1/object/public/shop-assets`, and that project
URL is already set in Vercel, so production companions load with no extra config.

## Not used

- `Pixelart_App_Icons_v5_by_ReffPixels.zip` — real company logos, trademark risk.
- `free-medieval-bandit-4-direction-character-pack.zip` — used for the first 3
  companions, then dropped: only 3 characters, irregular sheets, and a detailed
  style that clashed with everything else. Superseded by Ninja Adventure.
