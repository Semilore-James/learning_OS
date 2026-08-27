import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder. Without it, Turbopack walks up and
  // finds a stray package-lock.json in the home directory and warns.
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
