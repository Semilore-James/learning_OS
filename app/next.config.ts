import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. Without it, Turbopack walks up and
  // finds a stray package-lock.json in the home directory and warns.
  turbopack: {
    root: path.join(__dirname),
  },

  // Reverse-proxy PostHog through our own origin so adblockers don't drop
  // analytics. Client is configured with api_host "/ingest".
  async rewrites() {
    return [
      { source: "/ingest/static/:path*", destination: "https://us-assets.i.posthog.com/static/:path*" },
      { source: "/ingest/:path*", destination: "https://us.i.posthog.com/:path*" },
    ];
  },
  // PostHog needs to send the trailing-slash-free path through
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
