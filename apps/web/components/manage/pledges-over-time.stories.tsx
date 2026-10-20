import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { PledgesOverTime, pledgeTimeline } from "./pledges-over-time"

// The manage page's dashboard chart: what the favpoll has raised, running
// total, one point per day a pledge landed.
//
// The args go through `pledgeTimeline` rather than being hand-written
// points, because that is how the page builds them — from pledge rows —
// and a story that skipped it could drift from the real shape.

const day = (n: number) =>
  new Date(Date.UTC(2026, 9, n)).toISOString().slice(0, 19) + "Z"

const pledges = (amounts: [number, number][]) =>
  amounts.map(([d, total_amount]) => ({ created_at: day(d), total_amount }))

const meta = {
  title: "Manage/PledgesOverTime",
  component: PledgesOverTime,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[600px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PledgesOverTime>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  name: "A fortnight of pledges",
  args: {
    points: pledgeTimeline(
      pledges([
        [1, 20],
        [2, 35],
        [4, 10],
        [5, 60],
        [8, 25],
        [9, 15],
        [11, 80],
        [14, 30],
      ])
    ),
  },
}

export const OneDay: Story = {
  name: "One day, several pledges",
  args: {
    points: pledgeTimeline(
      pledges([
        [1, 20],
        [1, 15],
        [1, 45],
      ])
    ),
  },
}

// The component returns null rather than an empty chart, so this story
// renders nothing on purpose — it is the state a favpoll sits in between
// publishing and its first pledge.
export const NoPledgesYet: Story = {
  name: "No pledges yet (renders nothing)",
  args: { points: [] },
}

// A pledge with no amount recorded counts as zero rather than breaking the
// running total — `total_amount` is nullable on the row.
export const WithAnAmountlessPledge: Story = {
  name: "A pledge with no amount recorded",
  args: {
    points: pledgeTimeline([
      { created_at: day(1), total_amount: 40 },
      { created_at: day(2), total_amount: null },
      { created_at: day(3), total_amount: 25 },
    ]),
  },
}
