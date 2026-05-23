import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"

const meta = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "select",
      options: ["default", "xs", "sm", "lg", "icon"],
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { children: "Create an event" },
}

export const Ghost: Story = {
  args: { children: "See live events →", variant: "ghost" },
}

export const Outline: Story = {
  args: { children: "Edit event", variant: "outline" },
}

export const Destructive: Story = {
  args: { children: "Delete event", variant: "destructive" },
}

export const Link: Story = {
  args: { children: "Change my pledge", variant: "link" },
}

export const Small: Story = {
  args: { children: "Sign in", size: "sm" },
}

export const Large: Story = {
  args: { children: "Create an event", size: "lg" },
}

export const Disabled: Story = {
  args: { children: "Pledge favourites", disabled: true },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}
