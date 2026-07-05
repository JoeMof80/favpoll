import type { Meta, StoryObj } from "@storybook/react"
import { BumpChart } from "./bump-chart"
import { deriveRankHistory, type PledgeEvent } from "@/lib/rank-history"

const labels = {
  a: "Blue",
  b: "Purple",
  c: "Green",
  d: "Amber",
  e: "Red",
}

// A story where Purple climbs from the back to take the lead.
function climbEvents(): PledgeEvent[] {
  const t = (m: number) => new Date(2026, 0, 1, 10, m).toISOString()
  const e = (min: number, fav: string, amount: number): PledgeEvent => ({
    createdAt: t(min),
    allocations: [{ favouriteId: fav, amount }],
  })
  return [
    e(0, "a", 20),
    e(1, "c", 15),
    e(2, "e", 10),
    e(3, "b", 5),
    e(4, "d", 8),
    e(5, "b", 12),
    e(6, "b", 20),
    e(7, "c", 6),
    e(8, "b", 15),
    e(9, "a", 4),
    e(10, "b", 10),
  ]
}

const meta = {
  title: "Components/BumpChart",
  component: BumpChart,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="max-w-2xl rounded-lg border border-border bg-card p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BumpChart>

export default meta
type Story = StoryObj<typeof meta>

export const PurpleClimbs: Story = {
  args: { history: deriveRankHistory(climbEvents(), labels) },
}

export const TooFewSteps: Story = {
  name: "Below minimum (renders nothing)",
  args: {
    history: deriveRankHistory(
      [
        {
          createdAt: "2026-01-01T10:00:00Z",
          allocations: [{ favouriteId: "a", amount: 10 }],
        },
      ],
      labels
    ),
  },
}
