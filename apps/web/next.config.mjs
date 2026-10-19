import { fileURLToPath } from "node:url"

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Pin the workspace root: with any pnpm-workspace.yaml or lockfile in a
  // parent directory (a stray one in $HOME did it, 2026-08-16), Next infers
  // the wrong root, warns on every dev start, and can mis-trace files.
  turbopack: {
    root: fileURLToPath(new URL("../..", import.meta.url)),
  },
  experimental: {
    // 3 GB cap on Turbopack's native memory: this machine has 8 GB total,
    // and unbounded Turbopack has hung the kernel (watchdog resets,
    // 2026-08-16). Better a slower/failing compile than a dead machine.
    turbopackMemoryLimit: 3 * 1024 * 1024 * 1024,
  },
  // Dev only: allow the ngrok/pinggy tunnel origins to reach the dev
  // server's /_next resources and HMR websocket. Next 16.2 blocks
  // cross-origin dev requests by default, which spammed the console with
  // failed webpack-hmr connections when the app was viewed through the
  // tunnel. Wildcards cover the rotating tunnel subdomain (e.g.
  // <random>.a.pinggy.link). No effect on production.
  allowedDevOrigins: ["*.pinggy.link", "*.a.pinggy.link", "*.ngrok-free.app"],
  // THE DEMO CHARITIES' MARKS ARE STAGING-ONLY (founder, 2026-10-19): the
  // hero scenes carry Marie Curie's, WWF's, Mind's, GOSH's and St Luke's
  // own marks, none of whom has agreed to anything with favpoll yet, so
  // production shows the initial tile instead. VERCEL_ENV is the
  // platform's own build-time signal; local dev and previews leave it
  // unset or "preview", so they show the marks.
  env: {
    NEXT_PUBLIC_DEMO_MARKS:
      process.env.VERCEL_ENV === "production" ? "off" : "on",
  },
  async redirects() {
    return [
      // The record's URL matched its name in July 2026; keep old links alive
      {
        source: "/rankings",
        destination: "/record",
        permanent: true,
      },
      // Register pages went singular (2026-08-31); keep old links alive.
      { source: "/memorials", destination: "/memorial", permanent: true },
      { source: "/celebrations", destination: "/celebration", permanent: true },
      { source: "/fundraisers", destination: "/fundraiser", permanent: true },
    ]
  },
}

export default nextConfig
