"use client";

/* ============================================================================
   Shop (coming soon). Cosmetic unlocks bought with coins. Coins are earned from
   chapters read, nodes and cases completed, game clears, and streak days (see
   docs/coin-economy.md). Nothing is purchasable yet; this shows the plan and
   the learner's balance.
   ========================================================================== */
import {
  Frame,
  Image as IconImage,
  Lock,
  MousePointer2,
  Music,
  Palette,
  Power,
  Shapes,
  SquareStack,
} from "lucide-react";
import { useStore, select } from "@/lib/store";

const SHELVES = [
  { icon: IconImage, title: "Wallpapers", note: "Procedural scenes and, later, hand-made art." },
  { icon: Palette, title: "Desktop skins", note: "Chrome languages beyond neobrutalism / swiss / glass." },
  { icon: SquareStack, title: "Window themes", note: "Titlebar, border and shadow treatments." },
  { icon: Power, title: "Boot sequences", note: "The animation you see on load." },
  { icon: MousePointer2, title: "Cursor trails", note: "Particle and ink effects on the pointer." },
  { icon: Shapes, title: "Icon sets", note: "Alternate app-icon glyph styles." },
  { icon: Music, title: "Sound packs", note: "Click, complete and level-up audio." },
  { icon: Frame, title: "Avatar frames & badges", note: "Shown on your profile and share page." },
];

export function ShopWindow() {
  const { state } = useStore();
  const coins = select.coinBalance(state);
  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Shop</h2>
          <p className="text-xs text-muted-foreground">Spend coins on things that are purely for the vibe.</p>
        </div>
        <span className="chrome-flat bg-surface-raised px-3 py-1.5 text-sm font-bold text-brand-amber">
          {coins.toLocaleString()} coins
        </span>
      </div>

      <div className="chrome-flat flex items-center gap-2 bg-surface-raised px-3 py-2 text-xs text-brand-amber">
        <Lock className="size-3.5" /> Coming soon — the shelves are being stocked.
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SHELVES.map((s) => (
          <div key={s.title} className="chrome-panel flex flex-col gap-2 p-4 opacity-70">
            <s.icon className="size-6 text-primary" />
            <span className="font-display text-sm font-bold text-foreground">{s.title}</span>
            <span className="text-[11px] text-muted-foreground">{s.note}</span>
            <span className="mt-auto pt-2 font-mono text-[10px] text-muted-foreground">soon</span>
          </div>
        ))}
      </div>

      <p className="text-[11px] text-muted-foreground">
        Everything that affects learning stays free forever. The shop is cosmetic only. Coins come
        from reading chapters, completing nodes and cases, clearing game levels, and keeping a
        streak. XP is your learning progress and cannot be spent.
      </p>
    </div>
  );
}
