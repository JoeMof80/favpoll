import type { Meta, StoryObj } from "@storybook/react"
import { DisplayScreen } from "./index"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import type { TopicItem } from "@favpoll/types"

function parseGBP(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0
}

function makeItems(scene: (typeof SCENES)[0], topicId: string): TopicItem[] {
  const pledgeByLabel = Object.fromEntries(
    scene.results.map((r) => [
      r.label,
      {
        all_time_pledged: parseGBP(r.amount),
        all_time_count: Math.max(1, Math.round(parseGBP(r.amount) / 15)),
      },
    ])
  )
  return scene.poll.topic.topic_items.map((item, i) => ({
    id: `${topicId}-item-${i}`,
    topic_id: topicId,
    label: item.label,
    all_time_pledged: pledgeByLabel[item.label]?.all_time_pledged ?? 0,
    all_time_count: pledgeByLabel[item.label]?.all_time_count ?? 0,
    is_canonical: true,
    source: "seed" as const,
    markets: ["en-GB"],
    event_count: 1,
    total_pledge_count: pledgeByLabel[item.label]?.all_time_count ?? 0,
    created_at: "2024-01-01T00:00:00Z",
  }))
}

const MEMORIAL_POLL = {
  id: "poll-memorial",
  personal_reveal: SCENES[0].poll.personal_reveal,
  topic: { id: "topic-colour", title: SCENES[0].poll.topic.title },
  items: makeItems(SCENES[0], "topic-colour"),
}

const BIRTHDAY_POLL = {
  id: "poll-birthday",
  personal_reveal: SCENES[1].poll.personal_reveal,
  topic: { id: "topic-ice-cream", title: SCENES[1].poll.topic.title },
  items: makeItems(SCENES[1], "topic-ice-cream"),
}

const RETIREMENT_POLL = {
  id: "poll-retirement",
  personal_reveal: SCENES[2].poll.personal_reveal,
  topic: { id: "topic-season", title: SCENES[2].poll.topic.title },
  items: makeItems(SCENES[2], "topic-season"),
}

const GRADUATION_POLL = {
  id: "poll-graduation",
  personal_reveal: SCENES[5].poll.personal_reveal,
  topic: { id: "topic-film", title: SCENES[5].poll.topic.title },
  items: makeItems(SCENES[5], "topic-film"),
}

const meta = {
  title: "DisplayScreen/DisplayScreen",
  component: DisplayScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DisplayScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  args: {
    eventId: "demo-memorial",
    protagonistName: SCENES[0].protagonist.name,
    dateLabel: "1943–2024",
    openingLine: "In memory of",
    description:
      "Belinda was a school librarian for forty years at St Catherine's. She is remembered for her warmth, her impossible memory for every pupil's name, and her lifelong love of purple.",
    occasion: "memorial",
    charityName: SCENES[0].charities[0].name,
    poll: MEMORIAL_POLL,
    initialTotalRaised: 1005,
    pollId: "poll-memorial",
    eventUrl: "https://favpoll.com/events/demo-memorial",
  },
}

export const Birthday: Story = {
  args: {
    eventId: "demo-birthday",
    protagonistName: SCENES[1].protagonist.name,
    dateLabel: "30th May 2026",
    openingLine: "Birthday",
    description: null,
    occasion: "birthday",
    charityName: SCENES[1].charities[0].name,
    poll: BIRTHDAY_POLL,
    initialTotalRaised: 705,
    pollId: "poll-birthday",
    eventUrl: "https://favpoll.com/events/demo-birthday",
  },
}

export const Retirement: Story = {
  args: {
    eventId: "demo-retirement",
    protagonistName: SCENES[2].protagonist.name,
    dateLabel: null,
    openingLine: "After a lifetime of good work",
    description:
      "Ros spent thirty-one years teaching secondary science. She never once took a sick day.",
    occasion: "retirement",
    charityName: SCENES[2].charities[0].name,
    poll: RETIREMENT_POLL,
    initialTotalRaised: 700,
    pollId: "poll-retirement",
    eventUrl: "https://favpoll.com/events/demo-retirement",
  },
}

export const Graduation: Story = {
  args: {
    eventId: "demo-graduation",
    protagonistName: SCENES[5].protagonist.name,
    dateLabel: "13th June 2026",
    openingLine: "Congratulations",
    description:
      "James graduated last week with a first in mechanical engineering. He's already accepted a job offer.",
    occasion: "graduation",
    charityName: "The Prince's Trust",
    poll: GRADUATION_POLL,
    initialTotalRaised: 1730,
    pollId: "poll-graduation",
    eventUrl: "https://favpoll.com/events/demo-graduation",
  },
}
