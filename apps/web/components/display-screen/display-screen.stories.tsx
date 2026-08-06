import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { DisplayScreen } from "./index"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import { sceneFavourites as makeItems } from "@/components/hero-demo-panel/scene-favourites"

const MEMORIAL_POLL = {
  id: "poll-memorial",
  personal_reveal: SCENES[0].poll.personal_reveal,
  topic: { id: "topic-colour", title: SCENES[0].poll.topic.title },
  items: makeItems(SCENES[0], "topic-colour"),
}

const BIRTHDAY_POLL = {
  id: "poll-birthday",
  personal_reveal: SCENES[1].poll.personal_reveal,
  topic: { id: "topic-ice-cream", title: SCENES[1].poll.topic.title },
  items: makeItems(SCENES[1], "topic-ice-cream"),
}

const FUNDRAISER_POLL = {
  id: "poll-fundraiser",
  personal_reveal: SCENES[2].poll.personal_reveal,
  topic: { id: "topic-dance", title: SCENES[2].poll.topic.title },
  items: makeItems(SCENES[2], "topic-dance"),
}

const meta = {
  title: "DisplayScreen/DisplayScreen",
  component: DisplayScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof DisplayScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  args: {
    protagonistName: SCENES[0].protagonist!.name,
    dateLabel: "1943–2024",
    openingLine: "In memory of",
    occasionType: "Memorial",
    charityName: SCENES[0].charities[0].name,
    poll: MEMORIAL_POLL,
    initialTotalRaised: 1005,
    favpollUrl: "https://favpoll.com/favpolls/demo-memorial",
    qrUrl: "https://favpoll.com/p/a1b2c3d4e5f6",
  },
}

export const WithGoal: Story = {
  args: {
    ...Memorial.args,
    goalAmount: 1500,
  },
}

export const Birthday: Story = {
  args: {
    protagonistName: SCENES[1].protagonist!.name,
    dateLabel: "30th May 2026",
    openingLine: "Birthday",
    occasionType: "Birthday",
    charityName: SCENES[1].charities[0].name,
    poll: BIRTHDAY_POLL,
    initialTotalRaised: 705,
    favpollUrl: "https://favpoll.com/favpolls/demo-birthday",
    qrUrl: "https://favpoll.com/p/b2c3d4e5f6a1",
  },
}

export const Fundraiser: Story = {
  args: {
    protagonistName: SCENES[2].protagonist!.name,
    dateLabel: "London Marathon · 26.2 miles",
    openingLine: "Sponsored event",
    occasionType: "Sponsored event",
    charityName: SCENES[2].charities[0].name,
    poll: FUNDRAISER_POLL,
    initialTotalRaised: 810,
    favpollUrl: "https://favpoll.com/favpolls/demo-fundraiser",
    qrUrl: "https://favpoll.com/p/c3d4e5f6a1b2",
  },
}
