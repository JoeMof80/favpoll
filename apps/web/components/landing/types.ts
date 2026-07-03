// Shared shapes for the landing page sections.
export type RecordItem = {
  id: string
  label: string
  all_time_pledged: number
  all_time_count: number
  topics: { title: string } | null
}
