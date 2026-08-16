import { fileURLToPath } from "node:url"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root: with any pnpm-workspace.yaml or lockfile in a
  // parent directory (a stray one in $HOME did it, 2026-08-16), Next infers
  // the wrong root, warns on every dev start, and can mis-trace files.
  turbopack: {
    root: fileURLToPath(new URL("../..", import.meta.url)),
  },
  // Dev only: allow the ngrok/pinggy tunnel origins to reach the dev
  // server's /_next resources and HMR websocket. Next 16.2 blocks
  // cross-origin dev requests by default, which spammed the console with
  // failed webpack-hmr connections when the app was viewed through the
  // tunnel. Wildcards cover the rotating tunnel subdomain (e.g.
  // <random>.a.pinggy.link). No effect on production.
  allowedDevOrigins: ["*.pinggy.link", "*.a.pinggy.link", "*.ngrok-free.app"],
  async redirects() {
    return [
      // The record's URL matched its name in July 2026; keep old links alive
      {
        source: "/rankings",
        destination: "/record",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
