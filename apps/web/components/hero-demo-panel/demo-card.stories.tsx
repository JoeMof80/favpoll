import type { Meta, StoryObj } from "@storybook/react"
import { DemoCard } from "./demo-card"
import { SCENES } from "./scenes"

// Static phase snapshots of the animated hero demo. prefersReducedMotion is
// forced on so typewriter and bar-climb effects render fully settled.
const scene = SCENES[0]
const DECOY_WIDTHS = [85, 62, 48, 33, 19]
const decoyWidths = scene.results.map((_, i) => DECOY_WIDTHS[i] ?? 12)
const realWidths = scene.results.map((r) => r.widthPercent)

const meta = {
  title: "Landing/DemoCard",
  component: DemoCard,
  parameters: { layout: "centered" },
  args: {
    scene,
    prefersReducedMotion: true,
  },
  decorators: [
    (Story) => (
      <div className="flex h-[560px] w-105 flex-col">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DemoCard>

export default meta
type Story = StoryObj<typeof meta>

export const Locked: Story = {
  args: { phase: "arriving", barWidths: decoyWidths },
}

export const PickerOpen: Story = {
  args: { phase: "picking", barWidths: decoyWidths },
}

export const AmountStep: Story = {
  args: { phase: "amount-picked", barWidths: decoyWidths },
}

export const Confirmed: Story = {
  args: { phase: "confirmed", barWidths: decoyWidths },
}

export const Reveal: Story = {
  args: { phase: "reveal", barWidths: realWidths },
}
