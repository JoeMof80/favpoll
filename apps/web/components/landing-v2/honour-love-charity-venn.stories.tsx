import type { Meta, StoryObj } from "@storybook/react"
import HonourLoveCharityVenn from "./honour-love-charity-venn"

const meta: Meta<typeof HonourLoveCharityVenn> = {
  title: "Landing/HonourLoveCharityVenn",
  component: HonourLoveCharityVenn,
  parameters: { layout: "centered" },
}

export default meta
type Story = StoryObj<typeof HonourLoveCharityVenn>

export const Default: Story = {
  render: () => (
    <div className="w-[440px] rounded-xl bg-muted p-8">
      <HonourLoveCharityVenn />
    </div>
  ),
}

export const Narrow: Story = {
  render: () => (
    <div className="w-[280px] rounded-xl bg-muted p-6">
      <HonourLoveCharityVenn />
    </div>
  ),
}
