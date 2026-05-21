import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { FavpollCard } from '../favpoll-card'
import { SCENES, SCENE_EYEBROWS } from '@/components/hero-demo-panel/scenes'
import type { FavpollCardProps, PollStep, PollResultItem } from '../types'

function sceneToProps(index: number): FavpollCardProps {
  const scene = SCENES[index]
  const eyebrow = SCENE_EYEBROWS[index]

  const results: PollResultItem[] = scene.barLabels.map((label, i) => ({
    label,
    amount: scene.barAmounts[i],
    widthPercent: scene.barWidths[i],
  }))

  const protagonistFirstName = scene.protagonistName.split(/\s+/)[0]

  return {
    protagonistName: scene.protagonistName,
    protagonistInitials: scene.protagonistInitials,
    eyebrow,
    charities: [{ name: scene.charity, amountRaised: scene.total }],
    poll: {
      topicTitle: scene.topicTitle,
      framing: scene.question,
      options: scene.options,
      selectedOptionLabel: scene.options[scene.selectedIndex]?.label,
      personalReveal: scene.revealText,
      protagonistFirstName,
      results,
    },
  }
}

const meta = {
  title: 'FavpollCard/FavpollCard',
  component: FavpollCard,
  parameters: { layout: 'centered' },
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
    step: 'pledged',
    size: 'full',
  },
}

export const Birthday: Story = {
  args: {
    ...sceneToProps(1),
    step: 'choose',
    size: 'full',
  },
}

export const Retirement: Story = {
  args: {
    ...sceneToProps(2),
    step: 'pledge',
    size: 'full',
  },
}

export const Engagement: Story = {
  args: {
    ...sceneToProps(3),
    step: 'pledged',
    size: 'full',
  },
}

export const NoReveal: Story = {
  args: {
    ...sceneToProps(0),
    step: 'pledged',
    size: 'full',
    poll: {
      ...sceneToProps(0).poll,
      personalReveal: null,
    },
  },
}

export const DemoSize: Story = {
  args: {
    ...sceneToProps(0),
    size: 'demo',
    showSteps: true,
  },
  render: (args) => {
    const [step, setStep] = React.useState<PollStep>('choose')
    return <FavpollCard {...args} step={step} onStepChange={setStep} />
  },
}

export const EmbedSize: Story = {
  args: {
    ...sceneToProps(0),
    step: 'pledged',
    size: 'embed',
  },
}
