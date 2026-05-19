import type { Meta, StoryObj } from "@storybook/react"
import { OccasionTag } from "./occasion-tag"

const meta = {
  title: "UI/OccasionTag",
  component: OccasionTag,
  parameters: { layout: "centered" },
  argTypes: {
    label: { control: "text" },
  },
} satisfies Meta<typeof OccasionTag>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  args: { label: "In memory of" },
}

export const Birthday: Story = {
  args: { label: "Birthday" },
}

export const Retirement: Story = {
  args: { label: "Retirement" },
}

export const Wedding: Story = {
  args: { label: "Wedding" },
}

export const Engagement: Story = {
  args: { label: "Engagement" },
}

export const Graduation: Story = {
  args: { label: "Graduation" },
}

export const AllOccasions: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {[
        "In memory of",
        "Birthday",
        "Retirement",
        "Wedding",
        "Engagement",
        "Anniversary",
        "Leaving do",
        "Graduation",
        "Christening",
        "Achievement",
      ].map((label) => (
        <OccasionTag key={label} label={label} />
      ))}
    </div>
  ),
}
