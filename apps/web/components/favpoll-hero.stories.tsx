import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { FavpollHero } from "./favpoll-hero"
import { SCENES, SCENE_EYEBROWS } from "@/components/hero-demo-panel/scenes"
import type { Favpoll, Protagonist, Register } from "@favpoll/types"

// ─── Mock data ────────────────────────────────────────────────────────────────

const REGISTERS: Register[] = [
  "remembering",
  "celebrating_one",
  "celebrating_one",
  "celebrating_many",
  "celebrating_one",
  "celebrating_one",
]

const OCCASION_TYPES: (string | null)[] = [
  "Memorial",
  "Birthday",
  "Retirement",
  "Engagement",
  "Leaving do",
  "Graduation",
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

function makeViewProps(sceneIndex: number): {
  event: Favpoll
  protagonist: Protagonist
} {
  const scene = SCENES[sceneIndex]

  const protagonist: Protagonist = {
    id: `p-${sceneIndex}`,
    name: scene.protagonist.name,
    context: DATE_LABELS[sceneIndex],
    about: BIOS[sceneIndex],
    photo_url: null,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
  }

  const event: Favpoll = {
    id: `e-${sceneIndex}`,
    protagonist_id: protagonist.id,
    subject: "someone",
    cause_label: null,
    occasion_type: OCCASION_TYPES[sceneIndex],
    opening_line: SCENE_EYEBROWS[sceneIndex],
    market: "en-GB",
    created_by: "user-1",
    closes_at: "2026-12-31T00:00:00Z",
    original_closes_at: null,
    hard_close_at: null,
    extension_count: 0,
    closed_at: null,
    total_raised: 0,
    is_plural: null,
    is_private: false,
    description: null,
    created_at: "2024-01-01T00:00:00Z",
  }

  return { event, protagonist }
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: "FavpollHero/FavpollHero",
  component: FavpollHero,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-2xl py-8">
        <Story />
      </div>
    ),
  ],
  // EventHero uses a discriminated union prop — Meta<typeof EventHero> produces
  // 'never' for args in StoryObj. Use Meta without the generic to avoid that.
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

// ─── View mode stories ────────────────────────────────────────────────────────

export const Memorial: Story = {
  args: { ...makeViewProps(0) },
}

export const Birthday: Story = {
  args: { ...makeViewProps(1) },
}

export const Retirement: Story = {
  args: { ...makeViewProps(2) },
}

export const Engagement: Story = {
  args: { ...makeViewProps(3) },
}

export const LeavingDo: Story = {
  args: { ...makeViewProps(4) },
}

export const Graduation: Story = {
  args: { ...makeViewProps(5) },
}

export const WithPhoto: Story = {
  args: {
    ...makeViewProps(0),
    protagonist: {
      ...makeViewProps(0).protagonist,
      photo_url:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop",
    },
  },
}
