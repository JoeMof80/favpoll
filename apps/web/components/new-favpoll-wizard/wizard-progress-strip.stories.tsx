import type { Meta, StoryObj } from "@storybook/react"
import { WizardProgressStrip } from "./wizard-progress-strip"

const meta = {
  title: "Wizard/WizardProgressStrip",
  component: WizardProgressStrip,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WizardProgressStrip>

export default meta
type Story = StoryObj<typeof meta>

export const OnHonour: Story = {
  args: { currentStep: "honour" },
}

export const OnCharity: Story = {
  args: { currentStep: "charity" },
}

export const OnLove: Story = {
  args: { currentStep: "love" },
}
