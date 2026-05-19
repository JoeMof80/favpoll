import type { Meta, StoryObj } from "@storybook/react"
import { Input } from "./input"

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { placeholder: "Belinda Johnson" },
}

export const WithValue: Story = {
  args: { defaultValue: "Sarah Mitchell" },
}

export const Email: Story = {
  args: { type: "email", placeholder: "your@email.com" },
}

export const Invalid: Story = {
  args: { "aria-invalid": true, defaultValue: "not-an-email" },
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "Read only" },
}
