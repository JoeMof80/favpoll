import React, { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { EventHero } from "./event-hero"
import { SCENES, SCENE_EYEBROWS } from "@/components/hero-demo-panel/scenes"
import { OCCASION_PLACEHOLDERS } from "@/lib/occasions"
import type { Event, Protagonist, OccasionType } from "@favpoll/types"

// ─── Mock data ────────────────────────────────────────────────────────────────

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

function makeViewProps(sceneIndex: number): {
  event: Event
  protagonist: Protagonist
} {
  const scene = SCENES[sceneIndex]
  const occasion = OCCASIONS[sceneIndex]

  const protagonist: Protagonist = {
    id: `p-${sceneIndex}`,
    name: scene.protagonist.name,
    context: DATE_LABELS[sceneIndex],
    about: BIOS[sceneIndex],
    photo_url: null,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
  }

  const event: Event = {
    id: `e-${sceneIndex}`,
    protagonist_id: protagonist.id,
    occasion,
    opening_line: SCENE_EYEBROWS[sceneIndex],
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

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
  title: "EventHero/EventHero",
  component: EventHero,
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
  args: { mode: "view", ...makeViewProps(0) },
}

export const Birthday: Story = {
  args: { mode: "view", ...makeViewProps(1) },
}

export const Retirement: Story = {
  args: { mode: "view", ...makeViewProps(2) },
}

export const Engagement: Story = {
  args: { mode: "view", ...makeViewProps(3) },
}

export const LeavingDo: Story = {
  args: { mode: "view", ...makeViewProps(4) },
}

export const Graduation: Story = {
  args: { mode: "view", ...makeViewProps(5) },
}

export const WithPhoto: Story = {
  args: {
    mode: "view",
    ...makeViewProps(0),
    protagonist: {
      ...makeViewProps(0).protagonist,
      photo_url:
        "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&h=200&fit=crop",
    },
  },
}

// ─── Edit mode story ──────────────────────────────────────────────────────────

export const EditMode = {
  name: "Edit mode (interactive)",
  render: () => {
    const placeholders = OCCASION_PLACEHOLDERS["memorial"] ?? {
      name: "Name",
      about: "Bio",
      reveal: "",
    }
    const [openingLine, setOpeningLine] = useState("In memory of")
    const [protagonistName, setProtagonistName] = useState("")
    const [protagonistAbout, setProtagonistAbout] = useState("")
    const [dateLabel, setDateLabel] = useState("")
    return (
      <EventHero
        mode="edit"
        occasion="memorial"
        openingLine={openingLine}
        protagonistName={protagonistName}
        protagonistAbout={protagonistAbout}
        dateLabel={dateLabel}
        initialPhotoUrl={null}
        placeholders={placeholders}
        onOpeningLineChange={setOpeningLine}
        onProtagonistNameChange={setProtagonistName}
        onProtagonistAboutChange={setProtagonistAbout}
        onDateLabelChange={setDateLabel}
        onPhotoUrlChange={() => {}}
      />
    )
  },
}
