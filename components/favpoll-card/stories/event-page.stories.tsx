import type { Meta, StoryObj } from "@storybook/react"
import { EventHero } from "@/components/event-hero"
import { PollSection } from "@/components/poll-section"
import { FavpollCharityRow } from "../favpoll-charity-row"
import { SCENES, SCENE_EYEBROWS } from "@/components/hero-demo-panel/scenes"
import type { Event, Protagonist, EventPollWithItems, TopicItem, OccasionType } from "@/types"

// ─── Static character data for the 6 demo scenes ─────────────────────────────

const OCCASIONS: OccasionType[] = [
  "memorial",
  "birthday",
  "retirement",
  "engagement",
  "leaving",
  "graduation",
]

const DATE_LABELS: (string | null)[] = [
  "1943–2024",
  "30th May 2026",
  null,
  null,
  null,
  "13th June 2026",
]

const BIOS: (string | null)[] = [
  "Belinda was a school librarian for forty years at St Catherine's. She is remembered for her warmth, her impossible memory for every pupil's name, and her lifelong love of purple.",
  "Poppy turns 30 today. She has celebrated every birthday with the people she loves most — today, with ice cream, is no exception.",
  "Ros spent thirty-one years teaching secondary science. She never once took a sick day, and she's spent the last two years planning exactly what to do with all the time.",
  "Alex and Jordan got engaged last October, on a hike in the Peak District, in the rain. The giant panda answer will not surprise anyone who knows them.",
  "Dave has been here twelve years. He knows where everything is, remembered every coffee order without being asked, and organised the charity biscuit tin every year without being thanked.",
  "James graduated last week with a first in mechanical engineering. He's already accepted a job offer. His housemates are not surprised.",
]

// ─── Data builders ────────────────────────────────────────────────────────────

function parseGBP(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0
}

function makeHeroProps(sceneIndex: number): { event: Event; protagonist: Protagonist } {
  const scene = SCENES[sceneIndex]
  const protagonist: Protagonist = {
    id: `p-ep-${sceneIndex}`,
    name: scene.protagonist.name,
    date_label: DATE_LABELS[sceneIndex],
    about: BIOS[sceneIndex],
    photo_url: null,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
  }
  const event: Event = {
    id: `e-ep-${sceneIndex}`,
    protagonist_id: protagonist.id,
    occasion: OCCASIONS[sceneIndex],
    occasion_label: SCENE_EYEBROWS[sceneIndex],
    market: "en-GB",
    created_by: "user-1",
    closes_at: "2026-12-31T00:00:00Z",
    original_closes_at: null,
    hard_close_at: null,
    extension_count: 0,
    closed_at: null,
    total_raised: 0,
    is_private: false,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
  }
  return { event, protagonist }
}

function makePoll(sceneIndex: number): EventPollWithItems {
  const scene = SCENES[sceneIndex]
  const topicId = `topic-ep-${sceneIndex}`
  const pledgeByLabel = Object.fromEntries(
    scene.results.map((r) => [
      r.label,
      {
        all_time_pledged: parseGBP(r.amount),
        all_time_count: Math.max(1, Math.round(parseGBP(r.amount) / 15)),
      },
    ])
  )
  const topic_items: TopicItem[] = scene.poll.topic.topic_items.map((opt, i) => ({
    id: `item-ep-${sceneIndex}-${i}`,
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
    id: `poll-ep-${sceneIndex}`,
    event_id: "event-demo",
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
      topic_items,
    },
  }
}

// ─── Story layout ─────────────────────────────────────────────────────────────

type PageArgs = { sceneIndex: number }

function EventPageLayout({ sceneIndex }: PageArgs) {
  const scene = SCENES[sceneIndex]
  const { event, protagonist } = makeHeroProps(sceneIndex)
  const poll = makePoll(sceneIndex)

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <EventHero event={event} protagonist={protagonist} />

      <PollSection
        poll={poll}
        clerkUserId={null}
        pledgeAmount="10"
        isClosed={false}
        hasPledged={false}
        protagonistName={scene.protagonist.name}
        onSelectionsChange={() => {}}
      />

      <div className="mt-10 border-t border-[#D3D1C7] pt-6">
        <FavpollCharityRow
          charity={{
            id: scene.charities[0].id,
            name: scene.charities[0].name,
            logo_url: scene.charities[0].logo_url,
            registered_number: scene.charities[0].registered_number,
          }}
          amountRaised={scene.total}
        />
      </div>
    </div>
  )
}

const meta = {
  title: "FavpollCard/EventPage",
  component: EventPageLayout,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof EventPageLayout>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = { args: { sceneIndex: 0 } }
export const Birthday: Story = { args: { sceneIndex: 1 } }
export const Retirement: Story = { args: { sceneIndex: 2 } }
export const Engagement: Story = { args: { sceneIndex: 3 } }
export const LeavingDo: Story = { args: { sceneIndex: 4 } }
export const Graduation: Story = { args: { sceneIndex: 5 } }
