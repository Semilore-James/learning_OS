/* ============================================================================
   Public progress page (build step 21). No auth. Reads a fixed, non-sensitive
   JSON summary through the public.shared_progress() RPC, which only returns
   data for profiles that opted in (share_public = true). If the handle is not
   public or does not exist, the RPC returns null and this 404s.
   ========================================================================== */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/server";
import { TOPICS_BY_ID } from "@/content/curriculum";

export const dynamic = "force-dynamic";

interface Shared {
  handle: string;
  displayName: string;
  xpTotal: number;
  nodesComplete: number;
  topicsComplete: string[];
  casesComplete: number;
  gamesCleared: number;
  activeDays: number;
  lastActive: string | null;
}

async function load(handle: string): Promise<Shared | null> {
  try {
    const sb = createPublicClient();
    const { data, error } = await sb.rpc("shared_progress", { p_handle: handle });
    if (error || !data) return null;
    return data as unknown as Shared;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const s = await load(handle);
  if (!s) return { title: "Not found · DA // LEARNING OS" };
  return {
    title: `${s.displayName} · DA // LEARNING OS`,
    description: `${s.displayName} has earned ${s.xpTotal} XP across ${s.nodesComplete} lessons.`,
  };
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      style={{
        border: "2px solid #1c2333",
        background: "#0d1220",
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: 26, fontWeight: 800, color: "#e8ecf4" }}>{value}</div>
      <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6b7690" }}>
        {label}
      </div>
    </div>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const s = await load(handle);
  if (!s) notFound();

  const topics = s.topicsComplete
    .map((id) => TOPICS_BY_ID[id]?.label.replace(/\n/g, " ") ?? id)
    .filter(Boolean);

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#080b14",
        color: "#e8ecf4",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif",
        display: "flex",
        justifyContent: "center",
        padding: "48px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div style={{ fontFamily: "ui-monospace, monospace", fontSize: 12, color: "#5b8dee", fontWeight: 700 }}>
          DA // LEARNING OS
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 2px" }}>{s.displayName}</h1>
        <div style={{ fontSize: 13, color: "#6b7690" }}>
          @{s.handle}
          {s.lastActive ? ` · last active ${s.lastActive}` : ""}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 12,
            margin: "24px 0",
          }}
        >
          <Stat label="XP earned" value={s.xpTotal.toLocaleString()} />
          <Stat label="Lessons complete" value={s.nodesComplete} />
          <Stat label="Case files solved" value={s.casesComplete} />
          <Stat label="Games cleared" value={s.gamesCleared} />
          <Stat label="Active days" value={s.activeDays} />
          <Stat label="Tracks finished" value={topics.length} />
        </div>

        {topics.length > 0 && (
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6b7690", marginBottom: 8 }}>
              Completed tracks
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {topics.map((t) => (
                <span
                  key={t}
                  style={{
                    border: "2px solid #1c2333",
                    background: "#0d1220",
                    padding: "5px 10px",
                    fontSize: 12,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: 40, fontSize: 12, color: "#4b5468" }}>
          Learn data analysis the same way at{" "}
          <Link href="/" style={{ color: "#5b8dee" }}>
            DA // LEARNING OS
          </Link>
          .
        </div>
      </div>
    </main>
  );
}
