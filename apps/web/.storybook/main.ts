import path from "path"
import { fileURLToPath } from "url"
import type { StorybookConfig } from "@storybook/nextjs-vite"
import { storyAliases } from "./aliases"

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
    // Ours first: a string alias matches in order, and the framework ships
    // its own next/navigation, which throws without an App Router context.
    // See .storybook/aliases.ts for why each entry is there.
    const framework = config.resolve?.alias
    const inherited = Array.isArray(framework)
      ? framework
      : Object.entries(framework ?? {}).map(([find, replacement]) => ({
          find,
          replacement: replacement as string,
        }))
    config.resolve = {
      ...config.resolve,
      alias: [...storyAliases, ...inherited],
    }
    return config
  },
}
export default config
