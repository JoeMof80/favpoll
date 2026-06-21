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
  args: { children: "Live favpolls" },
}

export const WithHeading = {
  render: () => (
    <div>
      <SectionEyebrow className="mb-2">Live favpolls</SectionEyebrow>
      <h2 className="text-[26px] font-medium tracking-tight text-foreground">
        Happening right now
      </h2>
    </div>
  ),
}

export const Muted: Story = {
  args: { children: "Poll closed", variant: "muted" },
}

export const BothVariants = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-xs text-muted-foreground">brand (default)</p>
        <SectionEyebrow>Live favpolls</SectionEyebrow>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">muted</p>
        <SectionEyebrow variant="muted">Poll closed</SectionEyebrow>
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">
          muted + font-semibold
        </p>
        <SectionEyebrow variant="muted" className="font-semibold">
          Charity
        </SectionEyebrow>
      </div>
    </div>
  ),
}
