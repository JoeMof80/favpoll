import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import { resolve } from "path"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"
import { playwright } from "@vitest/browser-playwright"
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url))

import { baseAliases, storyAliases } from "./.storybook/aliases"

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: baseAliases,
  },
  test: {
    // 5s (vitest's default) is too tight for a 117-file suite running in
    // parallel. The test that kept flaking — pledge-card "renders the Pledge
    // favourites button" — is entirely SYNCHRONOUS: render, query, assert,
    // nothing awaited. So a timeout there never meant the component was
    // waiting on something; it meant a jsdom render was starved of CPU while
    // the other files ran. Raising the global ceiling fixes the whole class
    // rather than the one test that happened to lose the race most often.
    testTimeout: 15000,
    projects: [
      {
        extends: true,
        test: {
          environment: "jsdom",
          globals: true,
          setupFiles: ["./tests/setup.ts"],
          include: [
            "**/__tests__/**/*.test.{ts,tsx}",
            "tests/**/*.test.{ts,tsx}",
          ],
          exclude: ["node_modules", ".next", "e2e"],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        // The same map .storybook/main.ts uses, so a story cannot pass here
        // and fail in a static build.
        resolve: { alias: storyAliases },
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
        },
      },
    ],
  },
})
