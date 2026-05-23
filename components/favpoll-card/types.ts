export type FavpollCardSize = "full" | "demo" | "embed"
export type PollStep = "choose" | "pledge" | "pledged"

export type PollResultItem = {
  label: string
  amount: string
  widthPercent: number
}
export type CharityData = { name: string; amountRaised?: string }

export type PollData = {
  topicTitle: string
  topic_items: { label: string }[]
  selectedOptionLabel?: string
  personalReveal?: string | null
  results?: PollResultItem[]
  protagonistFirstName?: string
}

export type FavpollCardProps = {
  size?: FavpollCardSize
  protagonistName: string
  protagonistInitials?: string
  protagonistAvatarSrc?: string
  eyebrow?: string
  dateLabel?: string
  charities: CharityData[]
  poll: PollData
  step?: PollStep
  showSteps?: boolean
  onStepChange?: (step: PollStep) => void
  showSharedFund?: boolean
}
