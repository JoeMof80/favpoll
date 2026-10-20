import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { InsertCard } from "./insert-card"
import type { PackData } from "./pack-card"

// The insert card from the print pack: the small card an organiser slips
// into an order of service or leaves on a table, carrying the QR that
// opens the favpoll.
//
// `qrUrl` is deliberately the SHORT form (/p/<code>) rather than the
// shareable /favpolls/<uuid> — it is machine-facing, and the two differ on
// purpose (see app/p/[code]/page.tsx).

const base: PackData = {
  prefix: "In memory of",
  name: "Alice Pemberton",
  isCause: false,
  topicTitle: "Colour",
  hasNote: true,
  charityNames: ["Ocean Trust"],
  qrUrl: "https://favpoll.com/p/a1b2c3",
}

const meta = {
  title: "PrintPack/InsertCard",
  component: InsertCard,
  parameters: { layout: "centered" },
} satisfies Meta<typeof InsertCard>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  name: "A memorial, one charity",
  args: { data: base },
}

export const WithoutANote: Story = {
  name: "No personal note, so step three does not promise one",
  args: { data: { ...base, hasNote: false } },
}

export const ThreeCharities: Story = {
  name: "Three charities (the maximum a favpoll may name)",
  args: {
    data: {
      ...base,
      charityNames: ["Ocean Trust", "Marie Curie", "Shelter"],
    },
  },
}

export const Cause: Story = {
  name: "A cause, which has no protagonist",
  args: {
    data: {
      ...base,
      prefix: "In support of",
      name: "Warm Plates This Winter",
      isCause: true,
      topicTitle: "Comfort food",
    },
  },
}

// A long name is the case the step-down type ramp exists for.
export const LongName: Story = {
  name: "A name long enough to step the type down",
  args: {
    data: { ...base, name: "The Hartley Family Remembrance Fund" },
  },
}
