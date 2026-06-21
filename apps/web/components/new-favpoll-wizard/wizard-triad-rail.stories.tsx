import type { Meta, StoryObj } from "@storybook/react"
import { WizardTriadRail } from "./wizard-triad-rail"
import { getWizardCopy } from "@/lib/wizard-copy"

const meta = {
  title: "Wizard/WizardTriadRail",
  component: WizardTriadRail,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div style={{ width: 320, minHeight: "100vh" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof WizardTriadRail>

export default meta
type Story = StoryObj<typeof meta>

const copy = getWizardCopy("someone")

export const OnHonour: Story = {
  args: { currentStep: "honour", copy },
}

export const OnCharity: Story = {
  args: { currentStep: "charity", copy },
}

export const OnLove: Story = {
  args: { currentStep: "love", copy },
}
