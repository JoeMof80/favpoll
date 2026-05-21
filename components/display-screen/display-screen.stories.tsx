import type { Meta, StoryObj } from '@storybook/react'
import { DisplayScreen } from './index'
import { SCENES } from '@/components/hero-demo-panel/scenes'
import type { TopicItem } from '@/types'

function parseGBP(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0
}

function makeItems(scene: (typeof SCENES)[0], topicId: string): TopicItem[] {
  return scene.barLabels.map((label, i) => {
    const pledged = parseGBP(scene.barAmounts[i])
    return {
      id: `${topicId}-item-${i}`,
      topic_id: topicId,
      label,
      all_time_pledged: pledged,
      all_time_count: Math.max(1, Math.round(pledged / 15)),
      is_canonical: true,
      source: 'seed' as const,
      event_count: 1,
      total_pledge_count: Math.max(1, Math.round(pledged / 15)),
      created_at: '2024-01-01T00:00:00Z',
    }
  })
}

const MEMORIAL_POLL = {
  id: 'poll-memorial',
  personal_reveal: SCENES[0].revealText,
  topic: { id: 'topic-colour', title: SCENES[0].topicTitle },
  items: makeItems(SCENES[0], 'topic-colour'),
}

const BIRTHDAY_POLL = {
  id: 'poll-birthday',
  personal_reveal: SCENES[1].revealText,
  topic: { id: 'topic-ice-cream', title: SCENES[1].topicTitle },
  items: makeItems(SCENES[1], 'topic-ice-cream'),
}

const RETIREMENT_POLL = {
  id: 'poll-retirement',
  personal_reveal: SCENES[2].revealText,
  topic: { id: 'topic-season', title: SCENES[2].topicTitle },
  items: makeItems(SCENES[2], 'topic-season'),
}

const GRADUATION_POLL = {
  id: 'poll-graduation',
  personal_reveal: SCENES[5].revealText,
  topic: { id: 'topic-film', title: SCENES[5].topicTitle },
  items: makeItems(SCENES[5], 'topic-film'),
}

const meta = {
  title: 'DisplayScreen/DisplayScreen',
  component: DisplayScreen,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DisplayScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  args: {
    eventId: 'demo-memorial',
    protagonistName: SCENES[0].protagonistName,
    dateLabel: '1943–2024',
    occasionLabel: 'In memory of',
    description:
      "Belinda was a school librarian for forty years at St Catherine's. She is remembered for her warmth, her impossible memory for every pupil's name, and her lifelong love of purple.",
    occasion: 'memorial',
    charityName: SCENES[0].charity,
    polls: [MEMORIAL_POLL],
    initialTotalRaised: 1005,
    pollIds: ['poll-memorial'],
    eventUrl: 'https://favpoll.com/events/demo-memorial',
  },
}

export const Birthday: Story = {
  args: {
    eventId: 'demo-birthday',
    protagonistName: SCENES[1].protagonistName,
    dateLabel: '30th May 2026',
    occasionLabel: 'Birthday',
    description: null,
    occasion: 'birthday',
    charityName: SCENES[1].charity,
    polls: [BIRTHDAY_POLL],
    initialTotalRaised: 705,
    pollIds: ['poll-birthday'],
    eventUrl: 'https://favpoll.com/events/demo-birthday',
  },
}

export const Retirement: Story = {
  args: {
    eventId: 'demo-retirement',
    protagonistName: SCENES[2].protagonistName,
    dateLabel: null,
    occasionLabel: 'After a lifetime of good work',
    description:
      'Ros spent thirty-one years teaching secondary science. She never once took a sick day.',
    occasion: 'retirement',
    charityName: SCENES[2].charity,
    polls: [RETIREMENT_POLL],
    initialTotalRaised: 700,
    pollIds: ['poll-retirement'],
    eventUrl: 'https://favpoll.com/events/demo-retirement',
  },
}

export const MultiPoll: Story = {
  args: {
    eventId: 'demo-multi',
    protagonistName: 'James Okafor',
    dateLabel: '13th June 2026',
    occasionLabel: 'Congratulations',
    description:
      "James graduated last week with a first in mechanical engineering. He's already accepted a job offer.",
    occasion: 'graduation',
    charityName: "The Prince's Trust",
    polls: [GRADUATION_POLL, RETIREMENT_POLL],
    initialTotalRaised: 1730,
    pollIds: ['poll-graduation', 'poll-retirement'],
    eventUrl: 'https://favpoll.com/events/demo-multi',
  },
}
