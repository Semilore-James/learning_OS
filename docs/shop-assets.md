# Shop assets

How the v1 shop's art was produced and where it lives. Two classes of asset:

## 1. Icon sets — shipped in the app bundle

`app/public/shop/icons/retro/`
- `sheet.png` — the full contact sheet, shown as the shop card preview
- `items/item1.png … item110.png` — the 110 separated 32×32 icons

Source: **itch.io "PXL Retro Computer Icons" set (110)** (`~/Downloads/itchio-pxl-retro-computer-icons-set-110.zip`).
Only the `.png` sheet + `separated-items/*.png` were kept (the `.aseprite` / `.jpg`
were dropped). Files were renamed `…-item42.png` → `item42.png`.

The app-id → icon mapping is hand-maintained in
[`app/lib/shop/iconSets.ts`](../app/lib/shop/iconSets.ts). Unmapped ids fall back
to the built-in lucide glyph.

## 2. Desktop companions — Supabase Storage

Bucket **`shop-assets`** (public read), created by migration `0010_shop.sql`.
Layout: `companions/<name>/<anim>.png` where
`name ∈ {assassin, robber, thug}` and `anim ∈ {idle, idle-blinking, walking, running}`.

Each PNG is a **horizontal strip of 96×96 frames** (idle/blinking 16, walking 20,
running 12). Frame counts + fps live in
[`app/lib/shop/companions.ts`](../app/lib/shop/companions.ts). Left-facing is a CSS
`scaleX(-1)` of the right-facing art.

Source: **"Free Medieval Bandit — 4 Direction Character Pack"**
(`~/Downloads/free-medieval-bandit-4-direction-character-pack.zip`, 124 MB). Only
the `Right - {Idle,Idle Blinking,Walking,Running}` spritesheets for the 3
characters were used; frames were cut from the 4-column grid, scaled to 96 px, and
laid out as a single strip. A copy of the processed strips is kept in
`supabase/shop-assets/companions/` for reproducibility.

### Re-uploading

```bash
# needs SUPABASE_ACCESS_TOKEN in the env (or `supabase login`)
cd learning_OS
npx supabase storage cp -r supabase/shop-assets/companions ss:///shop-assets --linked --experimental
```

The base URL is `NEXT_PUBLIC_SHOP_ASSET_BASE`
(`<project>.supabase.co/storage/v1/object/public/shop-assets`); unset it locally
to fall back to the project's own Supabase URL.

## Not used

`Pixelart_App_Icons_v5_by_ReffPixels.zip` — contains real company logos
(Discord, Gmail, …). Trademark risk in a paid shop; deliberately excluded.
