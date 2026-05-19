import type { Meta, StoryObj } from "@storybook/react"
import { SectionEyebrow } from "./section-eyebrow"

const meta = {
  title: "UI/SectionEyebrow",
  component: SectionEyebrow,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SectionEyebrow>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Live events" },
}

export const WithHeading: Story = {
  render: () => (
    <div>
      <SectionEyebrow className="mb-2">Live events</SectionEyebrow>
      <h2 className="text-[26px] font-medium tracking-tight text-foreground">
        Happening right now
      </h2>
    </div>
  ),
}

export const Variations: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <SectionEyebrow>Live events</SectionEyebrow>
      <SectionEyebrow>In memory of someone you loved</SectionEyebrow>
      <SectionEyebrow>After a lifetime of good work</SectionEyebrow>
      <SectionEyebrow>The yes that changes everything</SectionEyebrow>
    </div>
  ),
}
