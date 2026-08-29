"use client";

/* ============================================================================
   Shop (coming soon). Where XP will buy cosmetic unlocks — extra wallpapers,
   design skins, avatar frames, board templates. Nothing purchasable yet; this
   window shows the plan and the learner's current XP balance.
   ========================================================================== */
import { Lock, Palette, Sparkles, Wallpaper as WallpaperIcon } from "lucide-react";
import { useStore } from "@/lib/store";

const SHELVES = [
  { icon: WallpaperIcon, title: "Wallpapers", note: "Premium procedural scenes and, later, hand-made art." },
  { icon: Palette, title: "Design skins", note: "New chrome languages beyond neobrutalism / swiss / glass." },
  { icon: Sparkles, title: "Avatar frames & badges", note: "Show what you've cleared on your share page." },
];

export function ShopWindow() {
  const { state } = useStore();
  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Shop</h2>
          <p className="text-xs text-muted-foreground">Spend XP on things that are purely for the vibe.</p>
        </div>
        <span className="chrome-flat bg-surface-raised px-3 py-1.5 text-sm font-bold text-brand-amber">
          {state.xpTotal.toLocaleString()} XP
        </span>
      </div>

      <div className="chrome-flat flex items-center gap-2 bg-surface-raised px-3 py-2 text-xs text-brand-amber">
        <Lock className="size-3.5" /> Coming soon — the shelves are being stocked.
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
        Everything that affects learning stays free forever. The shop is cosmetic only — a reason to keep
        the XP counter climbing.
      </p>
    </div>
  );
}
