import type { Meta, StoryObj } from "@storybook/react"
import { WizardNav } from "./wizard-nav"

const meta = {
  title: "Wizard/WizardNav",
  component: WizardNav,
  parameters: { layout: "padded" },
  args: {
    onBack: () => {},
    onNext: () => {},
    onFinish: () => {},
  },
} satisfies Meta<typeof WizardNav>

export default meta
type Story = StoryObj<typeof meta>

export const FirstStep: Story = {
  args: { isFirst: true, isLast: false, nextDisabled: false },
}

export const MiddleStep: Story = {
  args: { isFirst: false, isLast: false, nextDisabled: false },
}

export const LastStep: Story = {
  args: { isFirst: false, isLast: true, nextDisabled: false },
}

export const NextBlocked: Story = {
  args: { isFirst: true, isLast: false, nextDisabled: true },
}
