import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WizardStepRail } from "./wizard-step-rail"

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
  },
}

export const NearlyDone: Story = {
  args: {
    currentStep: "details",
    summary: {
      event: "Memorial",
      charity: "Marie Curie + 1 more",
      topic: "Colour · 8 favourites",
      info: "Mary Whitfield · Headmistress, retired",
      story: "A headmistress for forty-one years…",
      details: "£250 goal · closes 14 Sept · Link only",
    },
    extra: {
      info: "In loving memory of our headmistress",
      story: "Reveal · \u201CPurple. Always purple.\u201D",
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
  },
}
