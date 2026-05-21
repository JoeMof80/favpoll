import type { Meta, StoryObj } from '@storybook/react'
import { FavpollHeader } from '../favpoll-header'
import { FavpollCardProvider } from '../favpoll-card-context'

const meta = {
  title: 'FavpollCard/FavpollHeader',
  component: FavpollHeader,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <FavpollCardProvider value={{ size: 'full' }}>
        <div className="w-80 bg-white p-4">
          <Story />
        </div>
      </FavpollCardProvider>
    ),
  ],
} satisfies Meta<typeof FavpollHeader>

export default meta
type Story = StoryObj<typeof meta>

export const WithPhoto: Story = {
  args: {
    protagonistAvatarSrc: 'https://i.pravatar.cc/150?img=47',
    protagonistName: 'Belinda Hartley',
    eyebrow: 'Memorial',
    dateLabel: '1942–2024',
  },
}

export const InitialsOnly: Story = {
  args: {
    protagonistName: 'Belinda Hartley',
    eyebrow: 'Memorial',
    dateLabel: '1942–2024',
  },
}

export const Couple: Story = {
  args: {
    protagonistName: 'Alex & Jordan',
    protagonistInitials: 'AJ',
    eyebrow: 'Engagement',
    dateLabel: 'Engaged 14th February 2025',
  },
}
