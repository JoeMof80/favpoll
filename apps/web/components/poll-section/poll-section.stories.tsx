import type { Meta, StoryObj } from "@storybook/react"
import { PollSection } from "./index"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import type { FavpollPollWithItems } from "@favpoll/types"
import type { Favourite } from "@favpoll/types"

// ─── Mock data helpers ────────────────────────────────────────────────────────

function parseGBP(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0
}

/**
 * Build a mock FavpollPollWithItems from a scene index.
 * Items with pledging data come from results; all scene options are included
 * so PledgePanel has a full list to select from.
 */
function makePoll(sceneIndex: number): FavpollPollWithItems {
  const scene = SCENES[sceneIndex]
  const topicId = `topic-${sceneIndex}`
  const pollId = `poll-${sceneIndex}`

  // Merge pledging data into the full options list
  const pledgeByLabel = Object.fromEntries(
    scene.results.map((r) => [
      r.label,
      {
        all_time_pledged: parseGBP(r.amount),
        all_time_count: Math.max(1, Math.round(parseGBP(r.amount) / 15)),
      },
    ])
  )

  const favourites: Favourite[] = scene.poll.topic.favourites.map((opt, i) => ({
    id: `item-${sceneIndex}-${i}`,
    topic_id: topicId,
    label: opt.label,
    all_time_pledged: pledgeByLabel[opt.label]?.all_time_pledged ?? 0,
    all_time_count: pledgeByLabel[opt.label]?.all_time_count ?? 0,
    is_canonical: true,
    source: "seed" as const,
    markets: ["en-GB"],
    event_count: 1,
    total_pledge_count: pledgeByLabel[opt.label]?.all_time_count ?? 0,
    created_at: "2024-01-01T00:00:00Z",
  }))

  return {
    id: pollId,
    favpoll_id: "event-demo",
    topic_id: topicId,
    personal_reveal: scene.poll.personal_reveal,
    created_at: "2024-01-01T00:00:00Z",
    topics: {
      id: topicId,
      title: scene.poll.topic.title,
      description: null,
      is_finite: true,
      is_active: true,
      created_by: null,
      created_at: "2024-01-01T00:00:00Z",
      favourites,
    },
  }
}

const MEMORIAL_POLL = makePoll(0) // Belinda · Colour
const BIRTHDAY_POLL = makePoll(1) // Poppy · Ice cream
const RETIREMENT_POLL = makePoll(2) // Ros · Season

// ─── Meta ────────────────────────────────────────────────────────────────────

const meta = {
  title: "PollSection/PollSection",
  component: PollSection,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl">
        <Story />
      </div>
    ),
  ],
  args: {
    clerkUserId: null,
    isClosed: false,
    hasPledged: false,
    pledgeJustConfirmed: false,
    protagonistName: SCENES[0].protagonist.name,
    poll: MEMORIAL_POLL,
    isOrganiser: false,
    eventId: "event-demo",
  },
} satisfies Meta<typeof PollSection>

export default meta
type Story = StoryObj<typeof meta>

// ─── Pledge view (choose step) ───────────────────────────────────────────────

export const PledgeView: Story = {
  name: "Pledge view — Colour (Memorial)",
  args: {
    poll: MEMORIAL_POLL,
    protagonistName: SCENES[0].protagonist.name,
    hasPledged: false,
  },
}

export const PledgeViewBirthday: Story = {
  name: "Pledge view — Ice cream (Birthday)",
  args: {
    poll: BIRTHDAY_POLL,
    protagonistName: SCENES[1].protagonist.name,
    hasPledged: false,
  },
}

// ─── Results view (pledged — reveal shown) ───────────────────────────────────

export const ResultsWithReveal: Story = {
  name: "Results view — reveal shown (Memorial)",
  args: {
    poll: MEMORIAL_POLL,
    protagonistName: SCENES[0].protagonist.name,
    hasPledged: true,
  },
}

export const ResultsWithRevealRetirement: Story = {
  name: "Results view — reveal shown (Retirement)",
  args: {
    poll: RETIREMENT_POLL,
    protagonistName: SCENES[2].protagonist.name,
    hasPledged: true,
  },
}

// ─── Closed poll ─────────────────────────────────────────────────────────────

export const Closed: Story = {
  name: "Closed poll",
  args: {
    poll: MEMORIAL_POLL,
    protagonistName: SCENES[0].protagonist.name,
    isClosed: true,
    hasPledged: false,
  },
}
