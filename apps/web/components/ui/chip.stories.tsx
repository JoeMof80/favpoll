import type { Meta, StoryObj } from "@storybook/react"
import { Chip } from "./chip"

const meta = {
  title: "UI/Chip",
  component: Chip,
  parameters: { layout: "centered" },
  argTypes: {
    selected: { control: "boolean" },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof Chip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Memorial" },
}

export const Selected: Story = {
  args: { children: "Memorial", selected: true },
}

export const Disabled: Story = {
  args: { children: "Memorial", disabled: true },
}

export const OccasionChips: Story = {
  render: () => {
    const occasions = ["Memorial", "Birthday", "Retirement", "Engagement", "Wedding", "Graduation"]
    return (
      <div className="flex flex-wrap gap-1.5">
        {occasions.map((label, i) => (
          <Chip key={label} selected={i === 0}>
            {label}
          </Chip>
        ))}
      </div>
    )
  },
}

export const TopicChips: Story = {
  render: () => {
    const topics = ["Colour", "Season", "Ice cream", "Film", "Biscuit", "Book"]
    return (
      <div className="flex flex-wrap gap-2">
        {topics.map((label, i) => (
          <Chip key={label} selected={i === 2}>
            {label}
          </Chip>
        ))}
      </div>
    )
  },
}
