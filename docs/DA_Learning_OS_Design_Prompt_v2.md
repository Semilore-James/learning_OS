# DA // LEARNING OS — Design Prompt v2

## What You Are Designing

A Data Analyst Learning OS built as a desktop operating system metaphor. Neobrutalist chrome floating over an atmospheric deep space canvas. Two visual languages in deliberate collision: hard, tactile window furniture sitting over an infinite breathing environment.

This is not a dashboard. It is a desktop. The homepage is empty except for icon tiles and a taskbar. Everything functional lives inside windows that open on click.

Two fixed modes: dark and light. No custom palette picker. Colors are locked.

---

## Aesthetic Direction

**NOT:** neon cyberpunk, glassmorphism, loud gradients, emoji-heavy interfaces, rounded everything, SaaS product templates.

**YES:** mission control room, deep space observatory, a tool that takes the craft seriously. Sparse. Intentional. Every pixel earns its place.

**The hybrid rule:** Neobrutalist everywhere except the constellation canvas. Hard 2 to 3px black borders. Flat offset drop shadows (5px right, 5px down, solid black, no blur). Zero border-radius on all windows, cards, buttons, and icon tiles. The constellation canvas itself is open, atmospheric, and glowing. The tension between the two is the signature of the product.

---

## Color Tokens

### Dark Mode (Default)

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#080b14` | Desktop wallpaper, window body |
| `--surface` | `#111a28` | Taskbar, sidebar, window chrome |
| `--surface-raised` | `#1a2637` | Cards, panels, hover states |
| `--primary` | `#5b8dee` | Active borders, CTAs, glow, logo |
| `--accent-1` | `#eebc5b` | XP bar, streak counter, alerts (amber) |
| `--accent-2` | `#5beeb0` | Completed node glow, progress (green) |
| `--accent-3` | `#8d5bee` | Available node border, heatmap low (violet) |
| `--text` | `#e8ecf4` | All body text |
| `--muted` | `#63718c` | Labels, metadata, disabled states |
| `--border` | `#26344a` | Window borders, dividers |

### Light Mode

Science-backed: warm off-white reduces glare versus pure white. Warm ink tones sustain reading. Blue primary retained for brand continuity.

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#f5f2eb` | Desktop wallpaper, window body |
| `--surface` | `#edeae0` | Taskbar, sidebar, window chrome |
| `--surface-raised` | `#e4e0d4` | Cards, panels, hover states |
| `--primary` | `#3a6fd4` | Active borders, CTAs (deeper blue for legibility) |
| `--accent-1` | `#c48a10` | XP, streak (deep amber) |
| `--accent-2` | `#1a9e6e` | Completed states (deep green) |
| `--accent-3` | `#6b3ec4` | Available states (deep violet) |
| `--text` | `#1a1f2e` | All body text (warm near-black) |
| `--muted` | `#6b6a62` | Labels, metadata, disabled |
| `--border` | `#c8c4b8` | All borders and dividers |

---

## Typography

| Role | Font | Weight | Notes |
|---|---|---|---|
| OS name, system labels, code | JetBrains Mono | 700 / 400 | Tightest tracking |
| Window titles, nav, headings | Space Grotesk | 600 | Clean, geometric |
| Body, descriptions, textbook | Outfit | 400 / 300 | Readable at small sizes |
| Node labels on constellation | JetBrains Mono | 400 | 9 to 10px, consistent |
| XP, stats, numbers | Space Grotesk | 700 | Tabular figures |

All fonts on Google Fonts.

---

## Frame 1: Login and Sign Up Screen

Full screen. No desktop visible yet.

Dark mode version:
- Background: `--bg` deep space with faint star field
- Center card: `--surface` fill, hard 3px black border, 6px 6px flat black shadow
- Card contains: DA // LEARNING OS logo at top in JetBrains Mono, email input, password input, "Sign In" button (primary fill, black border, flat shadow), "Create account" link below
- All inputs: `--surface-raised` background, `--border` border, `--text` text, no border-radius
- Bottom of card: "Forgot password?" link in `--muted`

Light mode version: same layout, tokens swap. The card sits on the warm off-white background. Borders and shadows remain hard black (neobrutalist chrome does not soften in light mode).

---

## Frame 2: Desktop (Homepage, Dark Mode)

Full 1440 x 900 screen. This is all the user sees on arrival after login.

**Wallpaper:**
Full-bleed `--bg`. Faint white star field: 35 to 40 dots scattered at varying sizes (r 1 to 1.4) and opacities (3 to 6 percent). One subtle radial gradient: slightly lighter at center, pure dark at edges. Nothing else on the wallpaper.

**Desktop icon grid:**
Left side, 2 columns of 5 rows (9 icons, last cell empty). Each tile: 80 x 80px, `--surface` fill, 2px solid black border, 5px 5px flat black drop shadow. Icon glyph centered in tile, SVG stroke in `--muted`. Label below tile in JetBrains Mono 10px `--muted`.

Active tile (window currently open): `--primary` border replaces black border. Small 6px `--primary` dot below label.

Hover state: border color switches to `--primary`. Glyph stroke switches to `--primary`.

Nine icons: Constellation Map, Video Library, Case Files, PM-AI, Heatmap, Canvas, Games, Cheatcodes, Daily Log.

**Taskbar (bottom, full width):**
`--surface` background. 2px solid black top border. No shadow (it sits at the screen edge).
Left: DA // OS in JetBrains Mono 700 `--primary`.
Center: live clock HH:MM in JetBrains Mono `--text`.
Right: XP chip (number + thin bar), streak counter (flame glyph + number), theme toggle (moon icon dark mode / sun icon light mode), circular avatar with dropdown.

---

## Frame 3: Desktop (Homepage, Light Mode)

Same layout. Wallpaper: `--bg` warm off-white with faint dot grid (1px dots, `--border` color, 24px spacing). No star field. Icon tiles and taskbar use light mode tokens. Hard black borders and shadows remain unchanged.

---

## Frame 4: Constellation Map Window (Dark Mode, Level 1 Topics)

Large window floating above desktop. 860px wide, 640px tall. Positioned center-left.

**Window chrome (neobrutalist):**
Title bar: 44px tall, `--surface` fill, 3px solid black bottom border. Left side: 3px `--primary` vertical accent bar, then window title "Constellation Map" in Space Grotesk 600, then "TRACK 01" in JetBrains Mono 9px `--muted`. Right side: three square control buttons (minimize, maximize, close), each 18px, `--surface-raised` fill, 2px solid black border.

**Window body (atmospheric):**
`--bg` fill with radial gradient (slightly lighter at center). This is the only place the neobrutalist rule breaks. The canvas breathes.

**Topic nodes (Level 1, 10 nodes):**
Larger star nodes than sub-nodes will be. Scattered organically in three loose clusters: Foundations (bottom-left: Excel, SQL, Python, Statistics), Analysis (center: Data Cleaning, Visualization, Power BI), Output (top-right: Storytelling, Textbooks, Portfolio).

Node sizes: Foundations nodes larger (r 18 to 22). Analysis nodes medium (r 14 to 17). Output nodes smaller (r 12 to 14).

Node states shown across the 10 nodes:
- 2 completed: accent-2 fill, soft outer glow ring (radialGradient), 4-point star cross overlay at 55% opacity, breathe animation (scale 1 to 1.14, opacity 0.35 to 0.75, 7 to 9 second cycle)
- 1 active: primary fill, pulse ring animation (expanding ring that fades out every 3.5 seconds)
- 3 available: surface-raised fill, solid accent-3 border
- 4 locked: surface-raised fill, dashed muted border, tiny lock glyph centered

Node labels: JetBrains Mono 10px below each node in `--text` (completed and active) or `--muted` (available and locked).

**Connection lines:**
Thin curved paths (quadratic bezier, not straight). Completed segments: accent-2 solid 1.2px stroke. Incomplete segments: border-color dashed (4px dash, 6px gap). Traveling signal dots animate along completed paths (animateMotion, 6 to 9 second duration, staggered begins).

**Zone labels:**
"FOUNDATIONS", "ANALYSIS", "OUTPUT" in JetBrains Mono 8px letter-spacing 0.24em, `--muted` at 55% opacity.

**Legend (top-right corner of window body):**
Small neobrutalist card: `--surface` fill, 2px black border, 4px 4px black shadow. Four rows: completed / active / available / locked with color dots and labels.

---

## Frame 5: Sub-Constellation Window (SQL Node Expanded)

Same window chrome as the main map. Title bar reads: "SQL // Sub-constellation" with "26 NODES" count in `--muted` monospace.

Body: same atmospheric canvas but denser. 26 nodes arranged in a flowing path that suggests a journey: left to right, simple to complex. Node sizes smaller (r 9 to 13). Cluster zones: Core (SELECT, WHERE, ORDER BY, GROUP BY, HAVING), Relationships (all JOIN types, UNION), Advanced Querying (subqueries, CTEs, window functions), Performance and Patterns (indexes, views, real-world patterns, formatting standards).

Same node states, same animation rules as Level 1. The visual vocabulary is identical, just at smaller scale and higher density.

Show the right-side drawer open on one node ("Window Functions: LAG and LEAD"):
- Tabs: Resources, Tasks, Notes, Textbook Reference
- Resources tab active: 3 to 5 YouTube video cards. Each card: `--surface-raised` fill, 2px black border, 3px 3px black shadow. Thumbnail placeholder left, title in Space Grotesk 600, channel name in Outfit 300 `--muted`, duration chip in JetBrains Mono.
- Each card has two action buttons: "Play in app" (primary fill, black border) and "Open in YouTube" (surface-raised, black border). Both square, no border-radius.

---

## Frame 6: Video Library Window

Medium window. 720px wide, 580px tall. Right side of desktop, overlapping the constellation window slightly.

Title bar: "Video Library" left, "WATCHED 12 / 67" right in JetBrains Mono `--muted`.

Body layout:
- Left: filter sidebar (120px). Filter sections: Topic (checklist), Duration (chips: under 10min, 10 to 20min, over 20min), Status (All, Unwatched, Watched). All in `--surface` fill.
- Right: scrollable video card list.

Video card: full width of right panel, `--surface-raised` fill, 2px black border, 3px 3px black shadow, 12px gap between cards. Left: YouTube thumbnail (120px wide). Right: video title in Space Grotesk 600, channel in Outfit 300 `--muted`, duration chip and difficulty badge side by side, two action buttons ("Play in app" primary, "Open in YouTube" surface-raised).

Active playing card: `--primary` left accent bar (3px), border switches to `--primary`.

---

## Frame 7: Cheatcodes Window

Medium window. 760px wide, 600px tall.

Title bar: "Cheatcodes // Quick Reference".

Two tab buttons at top of body: "SQL" and "Excel". Active tab: `--primary` fill, black border. Inactive: `--surface-raised`, black border.

SQL cheatcodes body: two-column layout. Left column: section list (SELECT patterns, JOIN patterns, Window Functions, CTEs, String Functions, Date Functions, NULL Handling, Formatting). Click a section to jump. Right column: the cheatcode content for selected section. Code blocks: `--bg` fill, `--accent-2` syntax color for keywords, JetBrains Mono. Each block has a copy button (top-right of block).

JOIN patterns section specifically shows a small visual diagram of each join type (INNER, LEFT, RIGHT, FULL) as simple two-circle Venn-style SVG illustrations in `--primary` and `--accent-3`.

---

## Frame 8: Textbook Window

Large window. 900px wide, 680px tall.

Title bar: "DA // Field Guide" with current book and chapter shown as breadcrumb.

Layout:
- Left sidebar (200px): book list at top (master guide + 5 topic books). Below: chapter list for current book. Each chapter has a read or unread indicator dot.
- Right: reading area. Outfit 400, 17px, 1.7 line height, max-width 620px, centered. Generous padding. Code blocks in JetBrains Mono with `--bg` fill and `--accent-2` keyword highlights. "Try This" prompts at chapter end: `--surface-raised` card with `--accent-3` left bar and a link icon.

---

## Frame 9: Case Files Window

Medium window. 600px wide, 560px tall. Floating right, partially overlapping other windows to show depth.

Title bar: "Case Files // 20 Missions".

Scrollable card list. Each card: `--surface-raised` fill, 2px black border, 3px 3px black shadow, left accent bar colored by difficulty (ROOKIE: accent-3, ANALYST: accent-1, SENIOR: primary). Case number in JetBrains Mono 9px. Title in Space Grotesk 600. One-line description in Outfit 300 `--muted`. Status chip right-aligned (OPEN: muted border, IN PROGRESS: accent-1, COMPLETE: accent-2).

Show 5 cards. Progress bar at bottom: "6 of 20 cases touched" in accent-2.

---

## Frame 10: Dark and Light Mode Side by Side

Show frames 2 and 3 (both desktops) as a side-by-side comparison at reduced scale (70 percent). Label each frame with "DARK MODE" and "LIGHT MODE" in JetBrains Mono above. Show the taskbar theme toggle icon as the only UI difference in the chrome. Everything else changes via token swap.

---

## Signature Element

The constellation canvas breathes.

Completed nodes shimmer slowly at very low opacity. Not a flash. Not a bounce. Like light from something very far away. Active nodes pulse once every 3 to 4 seconds. Completed connection lines carry a slow-moving dot, like a signal traveling through a wire. Subtle enough to miss if you are not looking. That is exactly the point. This animation exists in both dark and light mode but is visibly more dramatic in dark mode where the glow reads against the deep background.

---

## Deliverable

Ten frames as described above. High-fidelity. Every zone labelled. Typography legible. Spacing intentional. Detailed enough to hand to a developer as a working spec. Both dark and light mode represented across the frames.
