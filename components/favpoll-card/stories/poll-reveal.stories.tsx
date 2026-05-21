import type { Meta, StoryObj } from '@storybook/react'
import { PollReveal } from '../poll-reveal'

const meta = {
  title: 'FavpollCard/PollReveal',
  component: PollReveal,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PollReveal>

export default meta
type Story = StoryObj<typeof meta>

export const WithReveal: Story = {
  args: {
    personalReveal: 'Mine was purple. I wore it to every occasion that mattered.',
    protagonistFirstName: 'Belinda',
    role: 'status',
    'aria-live': 'polite',
  },
}

export const Empty: Story = {
  args: {
    personalReveal: null,
  },
  decorators: [
    (Story) => (
      <div>
        <Story />
        <p className="mt-2 text-[12px] text-[#888780]">
          (renders nothing when personalReveal is null)
        </p>
      </div>
    ),
  ],
}
