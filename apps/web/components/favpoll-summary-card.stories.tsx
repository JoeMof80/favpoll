import type { Meta, StoryObj } from "@storybook/react"
import { FavpollSummaryCard } from "./favpoll-summary-card"
import type { FavpollSummaryCardFavpoll } from "./favpoll-summary-card"
import type { Charity } from "@favpoll/types"

function makeCharity(id: string, name: string): Charity {
  return {
    id,
    name,
    description: null,
    logo_url: null,
    registered_number: "207994",
    is_active: true,
    market: "en-GB",
    created_at: "2024-01-01T00:00:00Z",
  } as Charity
}

const inThirtyDays = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
).toISOString()

const favpoll: FavpollSummaryCardFavpoll = {
  id: "favpoll-1",
  occasion_type: "Memorial",
  category: "memorial",
  opening_line: "In memory of",
  closes_at: inThirtyDays,
  closed_at: null,
  total_raised: 1005,
  protagonist: { name: "Belinda Hartley" },
  charities: [{ charity: makeCharity("ch-1", "Marie Curie") }],
  poll: { topic: { title: "Colour" } },
}

const meta = {
  title: "Landing/FavpollSummaryCard",
  component: FavpollSummaryCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-[306px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FavpollSummaryCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { favpoll },
}

export const Exemplar: Story = {
  args: { favpoll: { ...favpoll, is_exemplar: true } },
}

export const NoCharities: Story = {
  args: { favpoll: { ...favpoll, charities: [], total_raised: 0 } },
}

export const NoTopic: Story = {
  args: { favpoll: { ...favpoll, poll: null } },
}
