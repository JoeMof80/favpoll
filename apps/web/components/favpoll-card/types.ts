export type FavpollCardSize = "lg" | "md" | "sm"

export type PollResultItem = {
  label: string
  amount: string // formatted display string e.g. "£210"
  widthPercent: number
}

/**
 * Protagonist as passed to the card — mirrors the Supabase `protagonists` row
 * plus an optional `initials` override (useful for couples e.g. "AJ").
 */
export type CardProtagonist = {
  name: string
  photo_url?: string | null
  context?: string | null
  initials?: string
}
