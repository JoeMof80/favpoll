import path from "path"
import { fileURLToPath } from "url"
import type { StorybookConfig } from "@storybook/nextjs-vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  viteFinal: async (config) => {
    config.resolve = {
      ...config.resolve,
      alias: {
        ...(config.resolve?.alias ?? {}),
        // Prevent Clerk server-side modules from being bundled in the browser
        // environment. uploadPersonPhoto is edit-mode only; stories use view mode.
        "@/app/favpolls/new/actions": path.resolve(
          __dirname,
          "./__mocks__/actions.ts"
        ),
        "@/app/favpolls/[id]/actions": path.resolve(
          __dirname,
          "./__mocks__/event-actions.ts"
        ),
        // Prevent real Supabase/Stripe clients from running in Storybook (no env vars in CI)
        "@/lib/supabase/client": path.resolve(
          __dirname,
          "../__mocks__/supabase-client.ts"
        ),
        "@stripe/stripe-js": path.resolve(__dirname, "../__mocks__/stripe.ts"),
        // next/navigation requires App Router context not available in Storybook browser tests
        "next/navigation": path.resolve(__dirname, "./__mocks__/next-navigation.ts"),
        "@/components/new-event-button": path.resolve(
          __dirname,
          "./__mocks__/new-event-button.tsx"
        ),
      },
    }
    return config
  },
}
export default config
