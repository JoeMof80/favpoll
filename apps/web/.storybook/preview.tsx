import type { Preview } from "@storybook/nextjs-vite"
import "../app/globals.css"

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      // Storybook backgrounds need literal values — these mirror the design
      // tokens: warm canvas (legacy gray-50), --background, --primary.
      default: "light",
      values: [
        { name: "light", value: "#F1EFE8" },
        { name: "white", value: "#ffffff" },
        { name: "dark", value: "#534AB7" },
      ],
    },
    layout: "centered",
    a11y: {
      test: "todo",
    },
  },
}

export default preview
