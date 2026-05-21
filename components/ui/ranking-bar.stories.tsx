import type { Meta, StoryObj } from "@storybook/react"
import { RankingBar } from "./ranking-bar"

const meta = {
  title: "UI/RankingBar",
  component: RankingBar,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RankingBar>

export default meta
type Story = StoryObj<typeof meta>

export const Leader: Story = {
  args: {
    label: "Purple",
    amount: "£350",
    widthPercent: 78,
    barStyle: { background: "#534AB7" },
  },
}

export const NonLeader: Story = {
  args: {
    label: "Blue",
    amount: "£220",
    widthPercent: 51,
    barStyle: { background: "#AFA9EC" },
  },
}

export const Empty: Story = {
  args: {
    label: "Yellow",
    amount: "£0",
    widthPercent: 0,
  },
}

export const FullRankings = {
  render: () => (
    <ol className="w-80 space-y-2.5">
      {[
        { label: "Purple", amount: "£350", width: 78, leader: true },
        { label: "Blue",   amount: "£220", width: 51, leader: false },
        { label: "Green",  amount: "£120", width: 28, leader: false },
        { label: "Red",    amount: "£60",  width: 14, leader: false },
      ].map((item) => (
        <li key={item.label}>
          <RankingBar
            label={item.label}
            amount={item.amount}
            widthPercent={item.width}
            barStyle={{ background: item.leader ? "#534AB7" : "#AFA9EC" }}
          />
        </li>
      ))}
    </ol>
  ),
}
