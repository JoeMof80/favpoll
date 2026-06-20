import type { Meta, StoryObj } from "@storybook/react"
import { PledgeDialog } from "./index"
import type {
  FavpollPollWithItems,
  FavpollPot,
  Favourite,
} from "@favpoll/types"

function makeFavourite(id: string, label: string): Favourite {
  return {
    id,
    topic_id: "topic-1",
    label,
    all_time_pledged: 0,
    all_time_count: 0,
    is_canonical: true,
    source: "seed",
    markets: ["en-GB"],
    event_count: 0,
    total_pledge_count: 0,
    created_at: "2024-01-01T00:00:00Z",
  }
}

const poll: FavpollPollWithItems = {
  id: "poll-1",
  favpoll_id: "event-1",
  topic_id: "topic-1",
  personal_reveal: null,
  created_at: "2024-01-01T00:00:00Z",
  topics: {
    id: "topic-1",
    title: "Film",
    description: null,
    is_finite: false,
    is_active: true,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    favourites: [
      makeFavourite("f1", "The Godfather"),
      makeFavourite("f2", "Inception"),
      makeFavourite("f3", "Parasite"),
      makeFavourite("f4", "The Dark Knight"),
      makeFavourite("f5", "Amélie"),
    ],
  },
}

const pot: FavpollPot = {
  id: "pot-1",
  favpoll_id: "event-1",
  created_by: "user-1",
  total_deposited: 100,
  total_allocated: 20,
  created_at: "2024-01-01T00:00:00Z",
}

const meta = {
  title: "Pledge/PledgeDialog",
  component: PledgeDialog,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PledgeDialog>

export default meta
type Story = StoryObj<typeof meta>

export const SignedIn: Story = {
  args: {
    eventId: "event-1",
    clerkUserId: "user-1",
    charityNames: ["Oxfam"],
    pollWithItems: poll,
    pot: null,
    userPotAllocation: null,
    onPledgeSuccess: () => alert("Pledge succeeded!"),
  },
}

export const WithSharedFund: Story = {
  args: {
    ...SignedIn.args,
    pot,
  },
}

export const TwoCharities: Story = {
  args: {
    ...SignedIn.args,
    charityNames: ["Oxfam", "RNLI"],
  },
}

export const Guest: Story = {
  args: {
    ...SignedIn.args,
    clerkUserId: null,
  },
}

export const InfinitePoll: Story = {
  args: {
    ...SignedIn.args,
    onAddItem: async (label: string) => {
      await new Promise((r) => setTimeout(r, 500))
      alert(`Added: ${label}`)
    },
  },
}
