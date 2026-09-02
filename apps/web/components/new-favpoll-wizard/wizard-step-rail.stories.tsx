import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import type { Charity } from "@favpoll/types"
import { WizardStepRail } from "./wizard-step-rail"

// Option B fixtures (founder, 2026-09-02): the rail carries charity
// avatar chips and the protagonist photo thumb alongside factual
// one-line summaries.
const CHARITIES: Charity[] = [
  {
    id: "c1",
    name: "Marie Curie",
    description: null,
    logo_url: null,
    registered_number: "207994",
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "c2",
    name: "Shelter",
    description: null,
    logo_url: null,
    registered_number: "263710",
    created_at: "2026-01-01T00:00:00Z",
  },
]

const PHOTO =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><rect width="20" height="20" fill="#8b7ac2" rx="4"/><circle cx="10" cy="8" r="3.4" fill="#fff"/><path d="M3 19a7 7 0 0 1 14 0z" fill="#fff"/></svg>'
  )

const meta: Meta<typeof WizardStepRail> = {
  title: "Wizard/WizardStepRail",
  component: WizardStepRail,
  decorators: [
    (Story) => (
      <div className="h-[640px] w-80">
        <Story />
      </div>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof WizardStepRail>

const EMPTY = {
  event: "",
  charity: "",
  topic: "",
  info: "",
  story: "",
  details: "",
}
const NONE = {
  event: false,
  charity: false,
  topic: false,
  info: false,
  story: false,
  details: false,
}

export const FirstStep: Story = {
  args: { currentStep: "event", summary: EMPTY, done: NONE },
}

export const MidFlow: Story = {
  args: {
    currentStep: "info",
    summary: {
      ...EMPTY,
      event: "Memorial",
      charity: "Marie Curie",
      topic: "Colour · 8 favourites",
      details: "Link only",
    },
    done: { ...NONE, event: true, charity: true, topic: true },
    charities: CHARITIES.slice(0, 1),
  },
}

export const NearlyDone: Story = {
  args: {
    currentStep: "details",
    summary: {
      event: "Memorial",
      charity: "Marie Curie + 1 more",
      topic: "Colour · 8 favourites",
      info: "Mary Whitfield",
      story: "41 words",
      details: "£250 goal · closes 14 Sept · Link only",
    },
    done: {
      ...NONE,
      event: true,
      charity: true,
      topic: true,
      info: true,
      story: true,
      details: true,
    },
    charities: CHARITIES,
    photoUrl: PHOTO,
  },
}
