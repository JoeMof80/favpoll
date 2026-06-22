import { defineConfig, devices } from "@playwright/test"

// Load .env.local for local development (Node 20.6+); CI env vars come from GitHub secrets
try {
  process.loadEnvFile(".env.local")
} catch {
  // No .env.local present — expected in CI
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Fail the build on CI if test.only is accidentally committed
  forbidOnly: !!process.env.CI,
  // Retry twice on CI to absorb transient Stripe/network flakiness
  retries: process.env.CI ? 2 : 0,
  // Serialise in CI so Stripe rate limits and shared staging state don't conflict
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    // ── Auth setup ────────────────────────────────────────────────────────────
    // Runs once before organiser tests; creates e2e/.auth/user.json.
    // Skips gracefully when E2E_TEST_EMAIL / E2E_TEST_PASSWORD are absent.
    {
      name: "setup:auth",
      testMatch: "**/auth.setup.ts",
    },

    // ── Guest flows (no auth) ─────────────────────────────────────────────────
    // Tests the pledge → reveal flow as an unauthenticated guest.
    {
      name: "guest",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/reveal-after-pledge.spec.ts",
    },

    // ── Organiser flows (auth required) ──────────────────────────────────────
    // Tests the wizard → publish flow as a signed-in organiser.
    // Depends on setup:auth creating the storage state.
    {
      name: "organiser",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup:auth"],
      testMatch: "**/wizard-publish.spec.ts",
    },
  ],

  globalSetup: "./e2e/global-setup.ts",

  // Start a local dev server only when no explicit base URL is given.
  // In CI, PLAYWRIGHT_BASE_URL points at staging.
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
