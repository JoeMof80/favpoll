import type { Meta, StoryObj } from "@storybook/react"
import HonourCharityLoveVenn from "./honour-charity-love-venn"

const meta: Meta<typeof HonourCharityLoveVenn> = {
  title: "Landing/HonourCharityLoveVenn",
  component: HonourCharityLoveVenn,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof HonourCharityLoveVenn>

export const Default: Story = {
  render: () => (
    <div className="w-[440px] rounded-xl bg-muted p-8">
      <HonourCharityLoveVenn />
    </div>
  ),
}

export const Narrow: Story = {
  render: () => (
    <div className="w-[280px] rounded-xl bg-muted p-6">
      <HonourCharityLoveVenn />
    </div>
  ),
}
