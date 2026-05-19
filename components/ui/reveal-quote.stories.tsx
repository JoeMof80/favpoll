import type { Meta, StoryObj } from "@storybook/react"
import { RevealQuote } from "./reveal-quote"

const meta = {
  title: "UI/RevealQuote",
  component: RevealQuote,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RevealQuote>

export default meta
type Story = StoryObj<typeof meta>

export const Short: Story = {
  args: {
    text: "Mine was purple. I wore it to every occasion that mattered.",
  },
}

export const Long: Story = {
  args: {
    text: "Autumn. It always felt like the world was making itself beautiful one last time — the light going golden, the air finally cool. I never got tired of it.",
  },
}

export const FirstPerson: Story = {
  args: {
    text: "Perfect. It played when they weren't even trying to be romantic — and that was the point.",
  },
}

export const ThirdPerson: Story = {
  args: {
    text: "Tom's was Spirited Away. He said it reminded him why things worth doing take time.",
  },
}

export const WithAriaLabel: Story = {
  args: {
    text: "Mine was purple. I wore it to every occasion that mattered.",
    "aria-label": "Belinda's reveal",
    "aria-live": "polite",
    role: "status",
  },
}
