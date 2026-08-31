"use client";

/* ============================================================================
   Shop — cosmetic unlocks bought with coins (docs/coin-economy.md). Coins are
   earned from chapters read, nodes and cases completed, game clears and streak
   days. Nothing here touches learning; XP is never spendable.

   v1 categories: desktop companions + icon sets. Wallpapers and design skins
   stay free (see content/shop/items.ts). Each card previews itself live and
   offers Buy / Equip / a locked button with the achievement requirement.
   ========================================================================== */
import { useMemo, useState } from "react";
import { useStore, select } from "@/lib/store";
import { canPurchase, ownsItem, weeklyFeatured } from "@/lib/shop";
import { levelFromXp } from "@/lib/gamification";
import {
  CATEGORY_LABEL,
  CATEGORY_ORDER,
  RARITY_LABEL,
  RARITY_ORDER,
  itemsInCategory,
  type AchievementGate,
  type ShopCategory,
  type ShopItem,
} from "@/content/shop/items";
import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion";
import { ShopPreviewCard } from "./previews";
import type { AppState } from "@/lib/store/types";

const RARITY_CLASS: Record<string, string> = {
  common: "text-muted-foreground",
  uncommon: "text-[color:var(--brand-cyan,#3aa0c9)]",
  rare: "text-primary",
  epic: "text-brand-violet",
  legendary: "text-brand-amber",
};

/** left accent bar colour per rarity — the card's identity, Fortnite-style */
const RARITY_BAR: Record<string, string> = {
  common: "var(--muted-foreground)",
  uncommon: "var(--brand-cyan, #3aa0c9)",
  rare: "var(--primary)",
  epic: "var(--brand-violet)",
  legendary: "var(--brand-amber)",
};

/** "Reach level 5 · you're 3" — teases the gate with live progress */
function gateLabel(state: AppState, gate: AchievementGate): string {
  const m = /^(level|streak)-(\d+)$/.exec(gate.key);
  if (!m) return gate.label;
  const have =
    m[1] === "level" ? levelFromXp(state.xpTotal) : select.streak(state).longest;
  return `${gate.label} · you're at ${have}`;
}

function ItemCard({ item }: { item: ShopItem }) {
  const { state, dispatch } = useStore();
  const owned = ownsItem(state, item);
  const check = canPurchase(state, item);
  const isEquipped = !!item.slot && state.equipped[item.slot] === item.asset.key;

  let action: React.ReactNode;
  if (!owned) {
    const gated = !!item.achievementGate && check.reason === item.achievementGate.label;
    action = (
      <button
        type="button"
        disabled={!check.ok}
        onClick={() => dispatch({ type: "purchaseItem", itemId: item.id })}
        className={cn(
          "chrome-flat chrome-press w-full px-3 py-1.5 text-[11px] font-bold",
          check.ok
            ? "bg-primary text-primary-foreground"
            : "bg-surface-raised text-muted-foreground",
        )}
        title={check.reason}
      >
        {gated
          ? `Locked · ${gateLabel(state, item.achievementGate!)}`
          : `Buy · ${item.price.toLocaleString()} coins`}
      </button>
    );
  } else {
    action = (
      <button
        type="button"
        onClick={() =>
          dispatch({ type: "equip", slot: item.slot!, itemId: isEquipped ? null : item.id })
        }
        className={cn(
          "chrome-flat chrome-press w-full px-3 py-1.5 text-[11px] font-bold",
          isEquipped ? "bg-surface-raised text-foreground" : "bg-primary text-primary-foreground",
        )}
      >
        {isEquipped ? "Equipped · remove" : "Equip"}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "chrome-panel relative flex flex-col gap-2 overflow-hidden p-3 pl-3.5",
        isEquipped && "outline outline-1 outline-primary",
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: RARITY_BAR[item.rarity] }}
      />
      <ShopPreviewCard preview={item.preview} />
      <div className="flex items-start justify-between gap-2">
        <span className="font-display text-[13px] font-bold leading-tight text-foreground">
          {item.name}
        </span>
        <span
          className={cn(
            "shrink-0 font-mono text-[8px] uppercase tracking-widest",
            RARITY_CLASS[item.rarity],
          )}
        >
          {owned ? "Owned" : RARITY_LABEL[item.rarity]}
        </span>
      </div>
      <p className="text-[11px] leading-snug text-muted-foreground">{item.blurb}</p>
      <div className="mt-auto pt-1">{action}</div>
    </div>
  );
}

export function ShopWindow() {
  const { state } = useStore();
  const coins = select.coinBalance(state);
  const [tab, setTab] = useState<ShopCategory>(CATEGORY_ORDER[0]);
  const featured = useMemo(() => weeklyFeatured(), []);
  const ownedCount = state.unlocks.length;

  const rows = useMemo(() => {
    const byRarity = new Map<ShopItem["rarity"], ShopItem[]>();
    for (const it of itemsInCategory(tab)) {
      const bucket = byRarity.get(it.rarity) ?? [];
      bucket.push(it);
      byRarity.set(it.rarity, bucket);
    }
    return [...byRarity.entries()].sort((a, b) => RARITY_ORDER[a[0]] - RARITY_ORDER[b[0]]);
  }, [tab]);

  return (
    <div className="flex h-full flex-col overflow-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-surface p-4">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Shop</h2>
          <p className="text-[11px] text-muted-foreground">
            Cosmetic only. Everything that affects learning stays free.
          </p>
        </div>
        <div className="text-right">
          <div className="chrome-flat bg-surface-raised px-3 py-1.5 text-sm font-bold text-brand-amber">
            <CountUp value={coins} /> coins
          </div>
          {ownedCount > 0 && (
            <div className="mt-1 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              {ownedCount} owned
            </div>
          )}
        </div>
      </div>

      {/* weekly featured */}
      <div className="border-b border-border p-4">
        <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          Featured this week
        </span>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {featured.map((it) => (
            <ItemCard key={`feat-${it.id}`} item={it} />
          ))}
        </div>
      </div>

      {/* category tabs */}
      <div className="flex gap-1 border-b border-border p-3">
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setTab(c)}
            className={cn(
              "chrome-press px-2.5 py-1 text-[11px] font-semibold",
              tab === c
                ? "chrome-flat bg-surface-raised text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-5 p-4">
        {rows.map(([rarity, items]) => (
          <section key={rarity} className="flex flex-col gap-2">
            <span
              className={cn(
                "font-mono text-[9px] uppercase tracking-widest",
                RARITY_CLASS[rarity],
              )}
            >
              {RARITY_LABEL[rarity]}
            </span>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <ItemCard key={it.id} item={it} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
