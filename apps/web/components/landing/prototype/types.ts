// PROTOTYPE — shared data shape passed to every landing variant (see NOTES.md).
import type { FavpollSummaryCardFavpoll } from "@/components/favpoll-summary-card"

export type RecordItem = {
  id: string
  label: string
  all_time_pledged: number
  all_time_count: number
  topics: { title: string } | null
}

export type LandingData = {
  favpolls: FavpollSummaryCardFavpoll[]
  recordItems: RecordItem[]
  showRecord: boolean
  recordMax: number
  charities: { id: string; name: string }[]
}
