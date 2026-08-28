export {
  embedUrl,
  watchUrl,
  formatDuration,
  type VideoMeta,
  type Difficulty,
} from "./types";

import raw from "@/content/videos.json";
import type { VideoMeta } from "./types";
import { TOPICS_BY_ID } from "@/content/curriculum";
import { subNodesFor } from "@/lib/curriculumLayout";

/** the curated catalog, from content/videos.json (imported from Semilore's
 *  spreadsheet). The YouTube Data API is never called at runtime — only the
 *  iframe embed, which is free. */
export const VIDEOS: VideoMeta[] = raw as VideoMeta[];

/** which topic a skill tag belongs to (tag may be a topic id or a sub-node id) */
export function topicOfTag(tag: string): string | null {
  if (TOPICS_BY_ID[tag]) return tag;
  for (const t of Object.values(TOPICS_BY_ID)) {
    if (subNodesFor(t).some((s) => s.id === tag)) return t.id;
  }
  return null;
}

/** videos whose tags match this curriculum node (topic or sub-node) */
export function videosForNode(nodeId: string): VideoMeta[] {
  const topic = topicOfTag(nodeId);
  return VIDEOS.filter((v) => v.skillTags.includes(nodeId) || (topic && v.skillTags.includes(topic)));
}
