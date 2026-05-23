import React from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { FavpollCard } from "../favpoll-card"
import { SCENES, SCENE_EYEBROWS } from "@/components/hero-demo-panel/scenes"
import type { FavpollCardProps, PollStep } from "../types"

function sceneToProps(index: number): FavpollCardProps {
  const scene = SCENES[index]
  const eyebrow = SCENE_EYEBROWS[index]

  return {
    protagonist: {
      name: scene.protagonist.name,
      photo_url: scene.protagonist.photo_url,
    },
    eyebrow,
    charities: scene.charities.map((c) => ({
      id: c.id,
      name: c.name,
      logo_url: c.logo_url,
      registered_number: c.registered_number,
    })),
    poll: {
      id: scene.poll.id,
      personal_reveal: scene.poll.personal_reveal,
      topic: {
        title: scene.poll.topic.title,
        topic_items: scene.poll.topic.topic_items,
      },
      selectedItemId: scene.poll.topic.topic_items[scene.selectedIndex]?.id,
      results: scene.results,
    },
  }
}

const meta = {
  title: "FavpollCard/FavpollCard",
  component: FavpollCard,
  parameters: { layout: "centered" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FavpollCard>

export default meta
type Story = StoryObj<typeof meta>

export const Memorial: Story = {
  args: {
    ...sceneToProps(0),
    step: "pledged",
    size: "full",
  },
}

export const Birthday: Story = {
  args: {
    ...sceneToProps(1),
    step: "choose",
    size: "full",
  },
}

export const Retirement: Story = {
  args: {
    ...sceneToProps(2),
    step: "pledge",
    size: "full",
  },
}

export const Engagement: Story = {
  args: {
    ...sceneToProps(3),
    step: "pledged",
    size: "full",
  },
}

export const NoReveal: Story = {
  args: {
    ...sceneToProps(0),
    step: "pledged",
    size: "full",
    poll: {
      ...sceneToProps(0).poll,
      personal_reveal: null,
    },
  },
}

export const DemoSize: Story = {
  args: {
    ...sceneToProps(0),
    size: "demo",
    showSteps: true,
  },
  render: (args) => {
    const [step, setStep] = React.useState<PollStep>("choose")
    return <FavpollCard {...args} step={step} onStepChange={setStep} />
  },
}

export const EmbedSize: Story = {
  args: {
    ...sceneToProps(0),
    step: "pledged",
    size: "embed",
  },
}
