"use client";

/* ============================================================================
   Live shop-card previews, one per category.
   ========================================================================== */
import { iconSetSampleIds, renderIcon } from "@/lib/shop/iconSets";
import { CompanionSprite } from "./CompanionSprite";
import type { ShopPreview } from "@/content/shop/items";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative grid aspect-[16/10] w-full place-items-center overflow-hidden rounded-[var(--radius-control)] border border-border bg-surface-raised">
      {children}
    </div>
  );
}

function IconSetPreview({ setKey }: { setKey: string }) {
  const ids = iconSetSampleIds(setKey);
  return (
    <Frame>
      <div className="flex flex-wrap items-center justify-center gap-2 p-3 text-foreground">
        {ids.map((id) => (
          <span key={id} className="grid size-6 place-items-center">
            {renderIcon(id, setKey, 22)}
          </span>
        ))}
      </div>
    </Frame>
  );
}

function CompanionPreview({ name }: { name: string }) {
  return (
    <Frame>
      <CompanionSprite name={name} anim="idle" size={64} />
    </Frame>
  );
}

export function ShopPreviewCard({ preview }: { preview: ShopPreview }) {
  switch (preview.kind) {
    case "iconSet":
      return <IconSetPreview setKey={preview.setKey} />;
    case "companion":
      return <CompanionPreview name={preview.name} />;
  }
}
