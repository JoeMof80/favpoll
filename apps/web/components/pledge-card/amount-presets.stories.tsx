import type { Meta, StoryObj } from "@storybook/react"
import { AmountPresets } from "./amount-presets"

const meta = {
  title: "Pledge/AmountPresets",
  component: AmountPresets,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AmountPresets>

export default meta
type Story = StoryObj<typeof meta>

export const NoneSelected: Story = {
  args: {
    amounts: [5, 10, 20, 50],
    value: "",
    onChange: () => {},
  },
}

export const TenSelected: Story = {
  args: {
    amounts: [5, 10, 20, 50],
    value: "10",
    onChange: () => {},
  },
}

export const FiftySelected: Story = {
  args: {
    amounts: [5, 10, 20, 50],
    value: "50",
    onChange: () => {},
  },
}
