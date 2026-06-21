import type { Meta, StoryObj } from "@storybook/react"
import { FavpollListCard } from "./favpoll-list-card"

const COLOUR_ITEMS = [
  { id: "item-1", label: "Purple" },
  { id: "item-2", label: "Blue" },
  { id: "item-3", label: "Green" },
  { id: "item-4", label: "Red" },
  { id: "item-5", label: "Yellow" },
]

const ICE_CREAM_ITEMS = [
  { id: "item-1", label: "Chocolate" },
  { id: "item-2", label: "Vanilla" },
  { id: "item-3", label: "Strawberry" },
  { id: "item-4", label: "Mint choc chip" },
]

const baseEvent = {
  id: "1",
  register: "remembering",
  occasion_type: "Memorial",
  opening_line: "In memory of",
  description:
    "A beloved mother, teacher, and friend who spent her life bringing people together.",
  closes_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  total_raised: 750,
  protagonist: { name: "Belinda Johnson" },
  charities: [
    {
      charity: {
        id: "c1",
        name: "Age UK",
        logo_url: null,
        registered_number: "1128267",
        description: null,
        created_at: "",
      },
    },
  ],
  poll: {
    id: "poll-1",
    topic_id: "topic-1",
    topic: { title: "Colour", is_finite: true, favourites: COLOUR_ITEMS },
  },
}

const meta = {
  title: "Components/FavpollListCard",
  component: FavpollListCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <ul className="w-80">
        <Story />
      </ul>
    ),
  ],
} satisfies Meta<typeof FavpollListCard>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  args: { favpoll: baseEvent },
}

export const Birthday: Story = {
  args: {
    favpoll: {
      ...baseEvent,
      id: "2",
      opening_line: "Birthday",
      description: null,
      total_raised: 480,
      protagonist: { name: "Poppy Clarke" },
      charities: [
        {
          charity: {
            id: "c2",
            name: "Comic Relief",
            logo_url: null,
            registered_number: null,
            description: null,
            created_at: "",
          },
        },
      ],
      poll: {
        id: "poll-2",
        topic_id: "topic-2",
        topic: {
          title: "Ice cream",
          is_finite: true,
          favourites: ICE_CREAM_ITEMS,
        },
      },
    },
  },
}

export const Retirement: Story = {
  args: {
    favpoll: {
      ...baseEvent,
      id: "3",
      opening_line: "After a lifetime of good work",
      description:
        "After 35 years building the engineering team, David is finally putting down his laptop.",
      total_raised: 1250,
      protagonist: { name: "David Clarke" },
      charities: [
        {
          charity: {
            id: "c3",
            name: "Macmillan",
            logo_url: null,
            registered_number: null,
            description: null,
            created_at: "",
          },
        },
        {
          charity: {
            id: "c4",
            name: "Dogs Trust",
            logo_url: null,
            registered_number: null,
            description: null,
            created_at: "",
          },
        },
      ],
    },
  },
}

export const NoPoll: Story = {
  args: {
    favpoll: { ...baseEvent, poll: null },
  },
}

export const ClosingSoon: Story = {
  args: {
    favpoll: {
      ...baseEvent,
      closes_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  },
}
