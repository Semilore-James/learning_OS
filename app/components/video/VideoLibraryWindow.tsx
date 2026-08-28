"use client";

/* ============================================================================
   Video Library (build step 15 / PRD 7). Curated YouTube videos from
   content/videos.json (Semilore's spreadsheet). Filter by topic and watched
   status, play in-window via the nocookie iframe embed, mark watched (+30 XP,
   heatmap), or open in YouTube. No YouTube API call at runtime.
   ========================================================================== */
import { useMemo, useState } from "react";
import { Check, ExternalLink, Play } from "lucide-react";
import { VIDEOS, embedUrl, watchUrl } from "@/lib/video";
import { TOPICS } from "@/content/curriculum";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const TOPIC_OPTS = TOPICS.filter((t) => !t.special).map((t) => ({
  id: t.id,
  label: t.label.replace(/\n/g, " "),
}));

export function VideoLibraryWindow() {
  const { state, dispatch } = useStore();
  const [topics, setTopics] = useState<Set<string>>(new Set());
  const [status, setStatus] = useState<"all" | "unwatched" | "watched">("all");
  const [playing, setPlaying] = useState<string | null>(null);

  const list = useMemo(() => {
    return VIDEOS.filter((v) => {
      const watched = !!state.videoWatches[v.id];
      if (status === "watched" && !watched) return false;
      if (status === "unwatched" && watched) return false;
      if (topics.size > 0 && !v.skillTags.some((t) => topics.has(t))) return false;
      return true;
    });
  }, [topics, status, state.videoWatches]);

  const watchedCount = Object.keys(state.videoWatches).length;

  return (
    <div className="flex h-full">
      {/* filters */}
      <div className="flex w-44 min-w-44 flex-col gap-4 overflow-auto border-r border-border bg-surface p-3">
        <div>
          <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Topic</span>
          <div className="flex flex-col gap-1">
            {TOPIC_OPTS.map((t) => (
              <label key={t.id} className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
                <input
                  type="checkbox"
                  checked={topics.has(t.id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setTopics((prev) => {
                      const n = new Set(prev);
                      if (checked) n.add(t.id);
                      else n.delete(t.id);
                      return n;
                    });
                  }}
                />
                {t.label}
              </label>
            ))}
          </div>
        </div>
        <div>
          <span className="mb-1.5 block font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Status</span>
          <div className="flex flex-col gap-1">
            {(["all", "unwatched", "watched"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={cn("text-left text-xs capitalize", status === s ? "text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* list */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-border px-4 py-2 font-mono text-[10px] text-muted-foreground">
          watched {watchedCount} / {VIDEOS.length}
        </div>
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto p-4">
          {list.length === 0 && <p className="text-sm text-muted-foreground">No videos match those filters.</p>}
          {list.map((v) => {
            const watched = !!state.videoWatches[v.id];
            const isPlaying = playing === v.id;
            return (
              <div
                key={v.id}
                className={cn("chrome-flat flex flex-col gap-2 bg-surface-raised p-3", isPlaying && "outline outline-1 outline-primary")}
              >
                {isPlaying ? (
                  <div className="aspect-video w-full overflow-hidden" style={{ borderRadius: "var(--radius-control)" }}>
                    <iframe
                      src={embedUrl(v.id, { autoplay: true })}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{v.title}</div>
                    <div className="mt-0.5 flex items-center gap-2 font-mono text-[9px] text-muted-foreground">
                      <span>{v.channel}</span>
                      {v.difficulty && <span className="chrome-flat bg-background px-1.5 py-0.5">{v.difficulty}</span>}
                    </div>
                  </div>
                  {watched && <Check className="size-4 shrink-0 text-brand-green" />}
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Button size="xs" onClick={() => setPlaying(isPlaying ? null : v.id)}>
                    <Play className="size-3" /> {isPlaying ? "Close" : "Play in app"}
                  </Button>
                  <Button size="xs" variant="outline" asChild>
                    <a href={watchUrl(v.id)} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-3" /> YouTube
                    </a>
                  </Button>
                  {!watched && (
                    <Button size="xs" variant="secondary" onClick={() => dispatch({ type: "markVideoWatched", videoId: v.id, note: null })}>
                      Mark watched (+30 XP)
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
