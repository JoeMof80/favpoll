import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { HowItWorksThreeBeat } from "./how-it-works-three-beat"

const meta = {
  title: "Landing/HowItWorksThreeBeat",
  component: HowItWorksThreeBeat,
  parameters: { layout: "padded" },
} satisfies Meta<typeof HowItWorksThreeBeat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
