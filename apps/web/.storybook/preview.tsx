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
    // The framework provides next/link and the App Router hooks through a
    // context it only mounts when told the app uses the App Router. Without
    // this, any story reaching next/link throws "invariant expected app
    // router to be mounted" — which is how FavpollListCard and PledgeDialog
    // came to pass under vitest and fail in a static build (#1101).
    nextjs: { appDirectory: true },
    layout: "centered",
    a11y: {
      test: "todo",
    },
  },
}

export default preview
