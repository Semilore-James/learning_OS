"use client";

/* ============================================================================
   Live shop-card previews, one per category.
   ========================================================================== */
import { useStore } from "@/lib/store";
import { WALLPAPERS_BY_ID } from "@/components/wallpaper";
import { CompanionSprite } from "./CompanionSprite";
import type { ShopPreview } from "@/content/shop/items";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-[var(--radius-control)] border border-border bg-surface-raised">
      {children}
    </div>
  );
}

function IconSetPreview({ src }: { src: string }) {
  return (
    <Frame>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Icon set sheet"
        className="max-h-full max-w-full object-contain p-1.5"
        style={{ imageRendering: "pixelated" }}
      />
    </Frame>
  );
}

function CompanionPreview({ name }: { name: string }) {
  return (
    <Frame>
      <CompanionSprite name={name} anim="idle" size={72} />
    </Frame>
  );
}

function WallpaperPreview({ wallpaperId }: { wallpaperId: string }) {
  const theme = useStore().state.profile.theme;
  const def = WALLPAPERS_BY_ID[wallpaperId];
  return (
    <Frame>
      {def?.kind === "svg" && def.Component ? (
        <div className="pointer-events-none absolute inset-0">
          <def.Component theme={theme} reducedMotion />
        </div>
      ) : (
        <span className="font-mono text-[10px] text-muted-foreground">{wallpaperId}</span>
      )}
    </Frame>
  );
}

const SKIN_STYLE: Record<string, React.CSSProperties> = {
  neobrutalism: { border: "2px solid var(--foreground)", boxShadow: "3px 3px 0 var(--foreground)", borderRadius: 0 },
  swiss: { border: "1px solid var(--foreground)", boxShadow: "none", borderRadius: 0 },
  glassmorphism: {
    border: "1px solid color-mix(in srgb, var(--foreground) 20%, transparent)",
    boxShadow: "0 8px 30px rgba(0,0,0,.25)",
    borderRadius: 14,
    backdropFilter: "blur(6px)",
    background: "color-mix(in srgb, var(--surface) 60%, transparent)",
  },
};

function SkinPreview({ skin }: { skin: string }) {
  return (
    <Frame>
      <div
        className="grid h-[58%] w-[68%] place-items-center bg-surface text-[10px] font-semibold text-foreground"
        style={SKIN_STYLE[skin] ?? SKIN_STYLE.swiss}
      >
        Aa
      </div>
    </Frame>
  );
}

export function ShopPreviewCard({ preview }: { preview: ShopPreview }) {
  switch (preview.kind) {
    case "iconSheet":
      return <IconSetPreview src={preview.src} />;
    case "companion":
      return <CompanionPreview name={preview.name} />;
    case "wallpaper":
      return <WallpaperPreview wallpaperId={preview.wallpaperId} />;
    case "skin":
      return <SkinPreview skin={preview.skin} />;
  }
}
