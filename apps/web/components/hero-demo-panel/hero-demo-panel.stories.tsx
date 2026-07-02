import type { Meta, StoryObj } from "@storybook/react"
import { HeroDemoPanel } from "./index"

// The full animated hero — a 15-phase timeout loop cycling through six
// scenes. Animation-driven: there are no controls; the loop starts on mount
// (or holds at the reveal under prefers-reduced-motion).
const meta = {
  title: "Landing/HeroDemoPanel",
  component: HeroDemoPanel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HeroDemoPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
