export type FavpollCardSize = "full" | "demo" | "embed"
export type PollStep = "choose" | "pledge" | "pledged"

export type PollResultItem = {
  label: string
  amount: string      // formatted display string e.g. "£210"
  widthPercent: number
}

/**
 * Protagonist as passed to the card — mirrors the Supabase `protagonists` row
 * plus an optional `initials` override (useful for couples e.g. "AJ").
 */
export type CardProtagonist = {
  name: string
  photo_url?: string | null
  date_label?: string | null
  initials?: string
}

/**
 * Poll data aligned to the Supabase shape:
 *   event_polls.id, event_polls.personal_reveal
 *   → topics.title
 *   → topic_items.id + topic_items.label
 *
 * UI-only state fields (selectedItemId, results) are appended here
 * because FavpollCard is a display-only component that receives fully
 * resolved data from its parent.
 */
export type PollData = {
  id: string
  personal_reveal: string | null
  topic: {
    title: string
    topic_items: { id: string; label: string }[]
  } | null
  /** Selected item ID during choose / pledge steps */
  selectedItemId?: string | null
  /** Results shown in the pledged step */
  results?: PollResultItem[]
}

/**
 * Charity as passed to the card — mirrors the Supabase `charities` row
 * (only the fields the card needs).
 */
export type CardCharity = {
  id: string
  name: string
  logo_url?: string | null
  registered_number?: string | null
}

export type FavpollCardProps = {
  size?: FavpollCardSize
  protagonist: CardProtagonist
  /** Maps to event.occasion_label */
  eyebrow?: string
  charities: CardCharity[]
  /** charity id → formatted amount string shown next to each charity row */
  charityAmounts?: Record<string, string>
  poll: PollData
  step?: PollStep
  showSteps?: boolean
  onStepChange?: (step: PollStep) => void
  showSharedFund?: boolean
}
