import type { Meta, StoryObj } from "@storybook/react"
import { LiveFavpollsCarousel } from "./live-favpolls-carousel"
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

const PEOPLE: [string, string, string, number][] = [
  ["Belinda Hartley", "memorial", "Colour", 1005],
  ["Poppy Nolan", "celebration", "Biscuit", 240],
  ["Ros Whitfield", "celebration", "Season", 415],
  ["Alex & Jordan", "celebration", "Film", 180],
  ["Dave Okafor", "celebration", "Crisps", 95],
  ["James Osei", "celebration", "Decade", 320],
]

const favpolls: FavpollSummaryCardFavpoll[] = PEOPLE.map(
  ([name, category, topic, raised], i) => ({
    id: `favpoll-${i + 1}`,
    occasion_type: null,
    category,
    opening_line: "",
    closes_at: inThirtyDays,
    closed_at: null,
    total_raised: raised,
    protagonist: { name },
    charities: [{ charity: makeCharity(`ch-${i + 1}`, "Marie Curie") }],
    poll: { topic: { title: topic } },
  })
)

const meta = {
  title: "Landing/LiveFavpollsCarousel",
  component: LiveFavpollsCarousel,
  parameters: { layout: "padded" },
} satisfies Meta<typeof LiveFavpollsCarousel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { favpolls },
}

export const Single: Story = {
  args: { favpolls: favpolls.slice(0, 1) },
}
