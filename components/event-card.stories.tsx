import type { Meta, StoryObj } from "@storybook/react"
import { EventCard } from "./event-card"

const baseEvent = {
  id: "1",
  occasion: "memorial",
  description: "A beloved mother, teacher, and friend who spent her life bringing people together.",
  closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  total_raised: 750,
  protagonist: { name: "Belinda Johnson" },
  charities: [{ charity: { name: "Age UK" } }],
  polls: [
    {
      personal_framing: "Belinda had a colour she returned to all her life — what's yours?",
      topic: { title: "Colour" },
    },
  ],
}

const meta = {
  title: "Components/EventCard",
  component: EventCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <ul className="w-72">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof EventCard>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  args: { event: baseEvent },
}

export const Birthday: Story = {
  args: {
    event: {
      ...baseEvent,
      id: "2",
      occasion: "birthday",
      description: null,
      total_raised: 480,
      protagonist: { name: "Poppy Clarke" },
      charities: [{ charity: { name: "Comic Relief" } }],
      polls: [
        {
          personal_framing: "Tell us your favourite ice cream to find out Poppy's.",
          topic: { title: "Ice cream" },
        },
      ],
    },
  },
}

export const Retirement: Story = {
  args: {
    event: {
      ...baseEvent,
      id: "3",
      occasion: "retirement",
      description: "After 35 years building the engineering team, David is finally putting down his laptop.",
      total_raised: 1250,
      protagonist: { name: "David Clarke" },
      charities: [{ charity: { name: "Macmillan" } }, { charity: { name: "Dogs Trust" } }],
      polls: [
        {
          personal_framing: "Margaret had a season she always loved most — which is yours?",
          topic: { title: "Season" },
        },
      ],
    },
  },
}

export const HighAmount: Story = {
  args: {
    event: {
      ...baseEvent,
      total_raised: 12500,
      charities: [
        { charity: { name: "Age UK" } },
        { charity: { name: "Macmillan" } },
        { charity: { name: "RNLI" } },
      ],
    },
  },
}

export const NoPollData: Story = {
  args: {
    event: {
      ...baseEvent,
      polls: [],
    },
  },
}

export const ClosingSoon: Story = {
  args: {
    event: {
      ...baseEvent,
      closes_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
}
