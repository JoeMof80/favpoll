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
      default: "light",
      values: [
        { name: "light", value: "#F1EFE8" },
        { name: "white", value: "#ffffff" },
        { name: "dark",  value: "#534AB7" },
      ],
    },
    layout: "centered",
    a11y: {
      test: "todo",
    },
  },
}

export default preview
