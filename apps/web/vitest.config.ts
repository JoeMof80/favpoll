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

// Aliases shared by all test projects
const sharedAliases = [
  // Must come before the "@" catch-all so specific paths win
  {
    find: "@/app/favpolls/new/actions",
    replacement: resolve(dirname, ".storybook/__mocks__/actions.ts"),
  },
  {
    find: "@favpoll/types",
    replacement: resolve(dirname, "../../packages/types/index.ts"),
  },
  { find: "@", replacement: resolve(dirname, ".") },
]

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: sharedAliases,
  },
  test: {
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
        resolve: {
          alias: [
            // Stub server-only modules for the browser environment
            {
              find: "@/lib/actions/favpoll-poll-favourites",
              replacement: resolve(
                dirname,
                ".storybook/__mocks__/favpoll-poll-favourites.ts"
              ),
            },
            ...sharedAliases,
          ],
        },
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
