import type { Meta, StoryObj } from "@storybook/react"
import { Chip } from "./chip"

const meta = {
  title: "UI/Chip",
  component: Chip,
  parameters: { layout: "centered" },
  argTypes: {
    selected: { control: "boolean" },
    readOnly: { control: "boolean" },
    disabled: { control: "boolean" },
    size: { control: "radio", options: ["sm", "md", "lg"] },
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

export const ReadOnly: Story = {
  args: { children: "Memorial", readOnly: true },
}

export const SmallSize: Story = {
  args: { children: "Memorial", size: "sm" },
}

export const LargeSize: Story = {
  args: { children: "Memorial", size: "lg" },
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-xs text-muted-foreground">sm</span>
        <Chip size="sm">Default</Chip>
        <Chip size="sm" selected>
          Selected
        </Chip>
        <Chip size="sm" readOnly>
          Read-only
        </Chip>
        <Chip size="sm" disabled>
          Disabled
        </Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-xs text-muted-foreground">md</span>
        <Chip size="md">Default</Chip>
        <Chip size="md" selected>
          Selected
        </Chip>
        <Chip size="md" readOnly>
          Read-only
        </Chip>
        <Chip size="md" disabled>
          Disabled
        </Chip>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-20 text-xs text-muted-foreground">lg</span>
        <Chip size="lg">Default</Chip>
        <Chip size="lg" selected>
          Selected
        </Chip>
        <Chip size="lg" readOnly>
          Read-only
        </Chip>
        <Chip size="lg" disabled>
          Disabled
        </Chip>
      </div>
    </div>
  ),
}

export const OccasionChips: Story = {
  render: () => {
    const occasions = [
      "Memorial",
      "Birthday",
      "Retirement",
      "Engagement",
      "Wedding",
      "Graduation",
    ]
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

export const Removable: Story = {
  render: () => {
    const labels = ["Oat So Simple", "Lucky Charms", "Shreddies"]
    return (
      <div className="flex flex-wrap gap-1.5">
        {labels.map((label) => (
          <Chip key={label} size="lg" onRemove={() => {}}>
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
