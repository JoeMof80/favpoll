export type User = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type Charity = {
  id: string
  name: string
  description: string | null
  logo_url: string | null
  registered_number: string | null
  created_at: string
}

export type Topic = {
  id: string
  title: string
  description: string | null
  is_finite: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
}

export type TopicItem = {
  id: string
  topic_id: string
  label: string
  all_time_pledged: number
  all_time_count: number
  is_master: boolean
  source: 'seed' | 'organiser' | 'guest'
  event_count: number
  total_pledge_count: number
  created_at: string
  // Present when fetched via event_poll_items (infinite topics in event context)
  event_poll_item_id?: string
}

export type Person = {
  id: string
  name: string
  date_label: string | null
  bio: string | null
  photo_url: string | null
  created_by: string | null
  created_at: string
}

export type OccasionType =
  | 'memorial'
  | 'tribute'
  | 'birthday'
  | 'retirement'
  | 'wedding'
  | 'anniversary'
  | 'leaving'
  | 'graduation'
  | 'christening'
  | 'achievement'
  | 'recovery'
  | 'award'
  | 'promotion'
  | 'celebration'
  | 'other'

export type Event = {
  id: string
  person_id: string
  occasion: OccasionType
  occasion_label: string | null
  created_by: string
  closes_at: string
  original_closes_at: string | null
  hard_close_at: string | null
  extension_count: number
  closed_at: string | null
  total_raised: number
  is_private: boolean
  description: string | null
  created_at: string
}

export type EventPoll = {
  id: string
  event_id: string
  topic_id: string
  personal_framing: string | null
  personal_quote: string | null
  created_at: string
}

export type Pledge = {
  id: string
  event_poll_id: string
  clerk_user_id: string | null
  guest_email: string | null
  guest_token: string | null
  pot_allocation_id: string | null
  total_amount: number
  fee: number
  withdrawn_at: string | null
  created_at: string
}

export type PledgeAllocation = {
  id: string
  pledge_id: string
  topic_item_id: string
  amount: number
}

export type EventPot = {
  id: string
  event_id: string
  created_by: string
  total_deposited: number
  total_allocated: number
  created_at: string
}

export type PotAllocation = {
  id: string
  pot_id: string
  allocated_to: string
  amount: number
  created_at: string
}

export type EventInvite = {
  id: string
  event_id: string
  email: string
  created_at: string
}

export type EventPollItem = {
  id: string
  event_poll_id: string
  topic_item_id: string
  is_guest_added: boolean
  added_by: string | null
  created_at: string
}

export type Category = {
  id: string
  label: string
  description: string | null
  created_at: string
}

export type TopicCategory = {
  topic_id: string
  category_id: string
}

// Joined types for UI
export type EventWithDetails = Event & {
  persons: Person
  event_charities: { charities: Charity }[]
}

export type EventPollWithItems = EventPoll & {
  topics: Topic & { topic_items: TopicItem[] }
}

export type PledgeWithAllocations = Pledge & {
  pledge_allocations: PledgeAllocation[]
}

// Canvas types — shared between EventCanvas sub-components and server pages
export type TopicPlaceholders = Record<string, { framing: string; quote: string }>

export type TopicWithMeta = Topic & {
  topic_items: TopicItem[]
  category_ids: string[]
  placeholders?: TopicPlaceholders
}

export type CanvasPoll = {
  key: string
  id?: string
  topicId: string
  topicIsCustom: boolean
  customTopicTitle: string
  customTopicItems: string[]
  framing: string
  quote: string
  prioritizedItemIds: string[]
  prioritizedCustomLabels: string[]
  curatedCustomLabels: string[]
  pickingTopic: boolean
}

export type CanvasSubmitData = {
  personName: string
  personBio?: string | null
  dateLabel: string | null
  photoUrl?: string | null
  occasion: string
  occasionLabel: string | null
  description: string | null
  charityIds: string[]
  closesAt: string
  isPrivate: boolean
  potAmount: number | null
  polls: {
    id?: string
    topicId: string | null
    topicIsCustom: boolean
    customTopicTitle: string
    customTopicItems: string[]
    framing: string | null
    quote: string | null
    infiniteItems: { prioritizedItemIds: string[]; masterItemIds: string[]; customLabels: string[] } | null
  }[]
}

export type CanvasInitialData = {
  personName?: string
  personBio?: string
  dateLabel?: string
  occasion?: string
  occasionLabel?: string
  description?: string
  charityIds?: string[]
  closesAt?: string
  isPrivate?: boolean
  potAmount?: string
  polls?: CanvasPoll[]
  photoUrl?: string | null
}
