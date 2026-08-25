import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WizardProgressStrip } from "./wizard-progress-strip"

const meta = {
  title: "Wizard/WizardProgressStrip",
  component: WizardProgressStrip,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WizardProgressStrip>

export default meta
type Story = StoryObj<typeof meta>

export const OnEvent: Story = {
  args: { currentStep: "event" },
}

export const OnCharity: Story = {
  args: { currentStep: "charity" },
}

export const OnTopic: Story = {
  args: { currentStep: "topic" },
}
