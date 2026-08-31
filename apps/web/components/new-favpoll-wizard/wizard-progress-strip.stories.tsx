import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WizardProgressStrip } from "./wizard-progress-strip"

const meta = {
  title: "Wizard/WizardProgressStrip",
  component: WizardProgressStrip,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WizardProgressStrip>

export default meta
type Story = StoryObj<typeof meta>

const NONE_DONE = {
  event: false,
  charity: false,
  topic: false,
  info: false,
  story: false,
  details: false,
}

export const OnEvent: Story = {
  args: { currentStep: "event", done: NONE_DONE },
}

export const OnCharity: Story = {
  args: {
    currentStep: "charity",
    done: { ...NONE_DONE, event: true },
  },
}

export const OnTopic: Story = {
  args: {
    currentStep: "topic",
    done: { ...NONE_DONE, event: true, charity: true },
  },
}
