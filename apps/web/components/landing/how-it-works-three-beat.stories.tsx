import type { Meta, StoryObj } from "@storybook/react"
import { HowItWorksThreeBeat } from "./how-it-works-three-beat"

const meta = {
  title: "Landing/HowItWorksThreeBeat",
  component: HowItWorksThreeBeat,
  parameters: { layout: "padded" },
} satisfies Meta<typeof HowItWorksThreeBeat>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
