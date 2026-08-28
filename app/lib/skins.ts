/* ============================================================================
   Skins — visual design languages, switchable in Settings.
   ----------------------------------------------------------------------------
   A skin sets an html[data-skin] attribute; globals.css maps it to the chrome
   token contract (border, shadow, radius, panel treatment, typography). The
   colour palette (theme: dark/light) is a separate axis and is untouched by
   the skin, so every skin stays legible in both themes.

   PRD note: the PRD locks the product to a single neobrutalist language. This
   picker is a deliberate override at the user's request. Neobrutalism stays
   the default.
   ========================================================================== */
import type { Skin } from "./store/types";

export interface SkinDef {
  id: Skin;
  label: string;
  blurb: string;
}

export const SKINS: SkinDef[] = [
  {
    id: "neobrutalism",
    label: "Neobrutalism",
    blurb: "Hard black borders, flat offset shadows, zero radius. The default.",
  },
  {
    id: "swiss",
    label: "Swiss / International",
    blurb: "Thin hairlines, no shadows, strict grid, Helvetica. Nothing decorative.",
  },
  {
    id: "brutalist-web",
    label: "Brutalist Web",
    blurb: "Raw HTML energy. System serif, visible structure, underlined links.",
  },
  {
    id: "memphis",
    label: "Memphis",
    blurb: "Colour-clash borders, offset colour shadows, scattered shapes. Loud 80s.",
  },
  {
    id: "retro-futurism",
    label: "Retro-Futurism",
    blurb: "Apollo-era consoles. Softened rectangles, wide type, warm glow.",
  },
  {
    id: "glassmorphism",
    label: "Viewport / Glass",
    blurb: "Frosted translucent panels, blur, big soft radius. Reads as HUD.",
  },
];

export const SKINS_BY_ID: Record<Skin, SkinDef> = Object.fromEntries(
  SKINS.map((s) => [s.id, s]),
) as Record<Skin, SkinDef>;
