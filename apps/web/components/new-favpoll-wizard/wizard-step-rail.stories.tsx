import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { WizardStepRail } from "./wizard-step-rail"
import { getWizardCopy } from "@/lib/wizard-copy"

const meta = {
  title: "Wizard/WizardStepRail",
  component: WizardStepRail,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ width: 320, minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WizardStepRail>

export default meta
type Story = StoryObj<typeof meta>

const copy = getWizardCopy()

export const OnType: Story = {
  args: { currentStep: "type", copy },
}

export const OnCharity: Story = {
  args: { currentStep: "charity", copy },
}

export const OnTopic: Story = {
  args: { currentStep: "topic", copy },
}
