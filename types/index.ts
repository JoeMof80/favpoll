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
  birth_year: number | null
  death_year: number | null
  photo_url: string | null
  created_by: string | null
  created_at: string
}

export type OccasionType = 'memorial' | 'birthday' | 'retirement' | 'wedding' | 'other'

export type Event = {
  id: string
  person_id: string
  occasion: OccasionType
  charity_id: string
  created_by: string
  closes_at: string
  is_private: boolean
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
  clerk_user_id: string
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
  charities: Charity
}

export type EventPollWithItems = EventPoll & {
  topics: Topic & { topic_items: TopicItem[] }
}

export type PledgeWithAllocations = Pledge & {
  pledge_allocations: PledgeAllocation[]
}
