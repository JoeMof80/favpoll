import type { Meta, StoryObj } from "@storybook/react"
import { AmountInput } from "./amount-input"

const meta = {
  title: "Pledge/AmountInput",
  component: AmountInput,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AmountInput>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
  args: {
    id: "amount",
    value: "",
    onChange: () => {},
  },
}

export const WithValue: Story = {
  args: {
    id: "amount",
    value: "10",
    onChange: () => {},
  },
}

export const LargeAmount: Story = {
  args: {
    id: "amount",
    value: "100",
    onChange: () => {},
  },
}
