"use client";

/* ============================================================================
   YouTube player that remembers where you stopped. Uses the IFrame Player API
   (loaded once) so it can read currentTime; saves position every few seconds
   and on unmount, resumes from the saved point. Falls back to a plain nocookie
   iframe if the API can't load.
   ========================================================================== */
import { useEffect, useRef, useState } from "react";
import { embedUrl } from "@/lib/video";
import { getProgress, setProgress } from "@/lib/video/progress";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;
function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.YT?.Player) return Promise.resolve();
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve();
      };
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      s.onerror = () => reject(new Error("yt api failed"));
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

export function YouTubePlayer({ videoId, onWatched }: { videoId: string; onWatched?: () => void }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let saveTimer: ReturnType<typeof setInterval> | undefined;

    const save = () => {
      try {
        const p = playerRef.current;
        if (p?.getCurrentTime) {
          const t = p.getCurrentTime();
          setProgress(videoId, t);
          const dur = p.getDuration?.() ?? 0;
          if (dur > 0 && t / dur > 0.9) onWatched?.();
        }
      } catch {
        /* player torn down */
      }
    };

    loadApi()
      .then(() => {
        if (cancelled || !hostRef.current) return;
        playerRef.current = new window.YT.Player(hostRef.current, {
          videoId,
          playerVars: {
            start: Math.floor(getProgress(videoId)),
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: () => {
              saveTimer = setInterval(save, 5000);
            },
          },
        });
      })
      .catch(() => {
        if (!cancelled) setFallback(true);
      });

    return () => {
      cancelled = true;
      if (saveTimer) clearInterval(saveTimer);
      save();
      try {
        playerRef.current?.destroy?.();
      } catch {
        /* ignore */
      }
    };
  }, [videoId, onWatched]);

  if (fallback) {
    const start = Math.floor(getProgress(videoId));
    return (
      <iframe
        src={`${embedUrl(videoId, { autoplay: true })}&start=${start}`}
        title="video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }
  // YT.Player replaces this div with an iframe
  return <div ref={hostRef} className="h-full w-full" />;
}
