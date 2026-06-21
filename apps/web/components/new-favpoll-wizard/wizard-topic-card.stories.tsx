import type { Meta, StoryObj } from "@storybook/react"
import { WizardTopicCard } from "./wizard-topic-card"
import type { Favourite } from "@favpoll/types"

const ITEMS: Favourite[] = [
  {
    id: "i1",
    label: "Red",
    display_order: 1,
    is_canonical: true,
    topic_id: "t1",
    created_at: "",
    markets: ["en-GB"],
    source: "seed",
    all_time_pledged: 0,
    all_time_count: 0,
    favpoll_count: 0,
    total_pledge_count: 0,
  },
  {
    id: "i2",
    label: "Blue",
    display_order: 2,
    is_canonical: true,
    topic_id: "t1",
    created_at: "",
    markets: ["en-GB"],
    source: "seed",
    all_time_pledged: 0,
    all_time_count: 0,
    favpoll_count: 0,
    total_pledge_count: 0,
  },
  {
    id: "i3",
    label: "Green",
    display_order: 3,
    is_canonical: true,
    topic_id: "t1",
    created_at: "",
    markets: ["en-GB"],
    source: "seed",
    all_time_pledged: 0,
    all_time_count: 0,
    favpoll_count: 0,
    total_pledge_count: 0,
  },
]

const BASE_TOPIC = {
  topicId: "t1",
  title: "Colour",
  isCustom: false as const,
  items: [],
  customLabels: [],
}

const meta = {
  title: "Wizard/WizardTopicCard",
  component: WizardTopicCard,
  parameters: { layout: "padded" },
  args: {
    onEdit: () => {},
    onRemove: () => {},
    onOpenItemsDialog: () => {},
  },
} satisfies Meta<typeof WizardTopicCard>

export default meta
type Story = StoryObj<typeof meta>

export const ExistingTopic: Story = {
  args: {
    topic: BASE_TOPIC,
    sortedExistingItems: ITEMS,
    customLabels: [],
    showItemsSection: true,
  },
}

export const ExistingTopicWithCustom: Story = {
  args: {
    topic: { ...BASE_TOPIC, customLabels: ["Violet"] },
    sortedExistingItems: ITEMS,
    customLabels: ["Violet"],
    showItemsSection: true,
  },
}

export const CustomTopic: Story = {
  args: {
    topic: {
      topicId: "",
      title: "Best memory",
      isCustom: true as const,
      items: [],
      customLabels: ["Beach trip", "First day"],
    },
    sortedExistingItems: [],
    customLabels: ["Beach trip", "First day"],
    showItemsSection: true,
  },
}

export const CustomTopicNeedsMore: Story = {
  args: {
    topic: {
      topicId: "",
      title: "Best memory",
      isCustom: true as const,
      items: [],
      customLabels: ["Beach trip"],
    },
    sortedExistingItems: [],
    customLabels: ["Beach trip"],
    showItemsSection: true,
  },
}
