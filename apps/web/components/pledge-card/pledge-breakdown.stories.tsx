import type { Meta, StoryObj } from "@storybook/react"
import { PledgeBreakdown } from "./pledge-breakdown"

const meta = {
  title: "Pledge/PledgeBreakdown",
  component: PledgeBreakdown,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PledgeBreakdown>

export default meta
type Story = StoryObj<typeof meta>

export const SingleCharity: Story = {
  args: {
    lines: [
      { label: "Age UK", amount: 9.70 },
      { label: "Platform fee (5%)", amount: 0.30 },
    ],
    total: { label: "Total charge", amount: 10.00 },
  },
}

export const ThreeCharities: Story = {
  args: {
    lines: [
      { label: "Age UK",              amount: 6.33 },
      { label: "Macmillan",           amount: 6.33 },
      { label: "RNLI",                amount: 6.34 },
      { label: "Platform fee (5%)",   amount: 1.00 },
    ],
    total: { label: "Total charge", amount: 20.00 },
  },
}

export const WithHiddenLine: Story = {
  args: {
    lines: [
      { label: "Age UK",            amount: 19.00 },
      { label: "Platform fee (5%)", amount: 1.00 },
      { label: "Hidden note",       amount: 0,    hidden: true },
    ],
    total: { label: "Total charge", amount: 20.00 },
  },
}
