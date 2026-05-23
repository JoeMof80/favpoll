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
    protagonist: {
      name: 'Belinda Hartley',
      photo_url: 'https://i.pravatar.cc/150?img=47',
      date_label: '1942–2024',
    },
    eyebrow: 'Memorial',
  },
}

export const InitialsOnly: Story = {
  args: {
    protagonist: {
      name: 'Belinda Hartley',
      date_label: '1942–2024',
    },
    eyebrow: 'Memorial',
  },
}

export const Couple: Story = {
  args: {
    protagonist: {
      name: 'Alex & Jordan',
      initials: 'AJ',
    },
    eyebrow: 'Engagement',
  },
}
