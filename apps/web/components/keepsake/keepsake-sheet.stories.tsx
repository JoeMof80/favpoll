import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { KeepsakeSheet } from "./keepsake-sheet"
import type { KeepsakeData } from "./keepsake-document"

// The keepsake: the A4 sheet an organiser keeps or prints after a favpoll
// has closed. The variant switch is the same shape as the live display's
// presenter override — a memorial opens quiet, a fundraiser opens loud —
// and the organiser can flip it, because the register is a guess about the
// day and they were there.
//
// Only a REACHED goal prints. An unmet goal on a finished sheet reads as a
// shortfall, so `goalAmount` is left null unless the story is about that.

const standings = [
  { favouriteId: "i1", label: "Blue", amount: 240 },
  { favouriteId: "i2", label: "Green", amount: 185 },
  { favouriteId: "i3", label: "Yellow", amount: 90 },
  { favouriteId: "i4", label: "Red", amount: 55 },
  { favouriteId: "i5", label: "Purple", amount: 30 },
]

const base: KeepsakeData = {
  prefix: "In memory of",
  name: "Alice Pemberton",
  context: "1943 – 2026",
  topicTitle: "Colour",
  reveal: "Hers was Blue. Her bathroom was full of dolphin pictures.",
  totalRaised: 600,
  goalAmount: null,
  charityNames: ["Ocean Trust"],
  closedDate: "2026-10-14",
  standings,
  rankHistory: null,
  guestNames: ["Priya", "Tom", "Margaret H"],
}

// A4 at full size overflows the story frame, so every story scales from the
// top-left — the same `origin-*`/`scale-*` the real caller passes.
const meta = {
  title: "Keepsake/KeepsakeSheet",
  component: KeepsakeSheet,
  parameters: { layout: "fullscreen" },
  args: { className: "origin-top-left scale-50" },
} satisfies Meta<typeof KeepsakeSheet>

export default meta
type Story = StoryObj<typeof meta>

export const TributeLandscape: Story = {
  name: "Tribute, landscape (the classic certificate shape)",
  args: { data: base, variant: "tribute", orientation: "landscape" },
}

export const TributePortrait: Story = {
  name: "Tribute, portrait",
  args: { data: base, variant: "tribute", orientation: "portrait" },
}

// The fundraiser keeps ten favourites rather than five: the crowded race
// is its character.
export const Fundraiser: Story = {
  name: "Fundraiser, with a goal that was reached",
  args: {
    data: {
      ...base,
      prefix: "In support of",
      name: "Warm Plates This Winter",
      context: "Winter 2026 appeal",
      totalRaised: 1250,
      goalAmount: 1000,
      reveal: null,
    },
    variant: "fundraiser",
    orientation: "landscape",
  },
}

export const WithoutANote: Story = {
  name: "No personal note was written",
  args: { data: { ...base, reveal: null }, variant: "tribute" },
}

export const ThreeCharities: Story = {
  name: "Three charities share the proceeds",
  args: {
    data: {
      ...base,
      charityNames: ["Ocean Trust", "Marie Curie", "Shelter"],
    },
    variant: "tribute",
  },
}
