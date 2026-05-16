"use client"

import { ClosingDate } from "./closing-date"
import { CharityPicker } from "./charity-picker"
import { SharedFund } from "./shared-fund"
import { PrivacyToggle } from "./privacy-toggle"
import type { Charity } from "@/types"

type Props = {
  charityIds: string[]
  charitySearch: string
  charities: Charity[]
  closesAt: string
  isPrivate: boolean
  potAmount: string
  extensionCount?: number
  hardCloseAt?: string | null
  eventId?: string
  onCharityToggle: (id: string) => void
  onCharitySearchChange: (v: string) => void
  onClosesAtChange: (v: string) => void
  onIsPrivateChange: (v: boolean) => void
  onPotAmountChange: (v: string) => void
}

export function CanvasSidebar({
  charityIds,
  charitySearch,
  charities,
  closesAt,
  isPrivate,
  potAmount,
  extensionCount,
  hardCloseAt,
  eventId,
  onCharityToggle,
  onCharitySearchChange,
  onClosesAtChange,
  onIsPrivateChange,
  onPotAmountChange,
}: Props) {
  return (
    <div className="sticky top-28 space-y-5 self-start">
      <ClosingDate
        closesAt={closesAt}
        onClosesAtChange={onClosesAtChange}
        extensionCount={extensionCount}
        hardCloseAt={hardCloseAt}
        eventId={eventId}
      />
      <CharityPicker
        charities={charities}
        charityIds={charityIds}
        charitySearch={charitySearch}
        onToggle={onCharityToggle}
        onSearchChange={onCharitySearchChange}
      />
      <SharedFund potAmount={potAmount} onChange={onPotAmountChange} />
      <PrivacyToggle isPrivate={isPrivate} onChange={onIsPrivateChange} />
    </div>
  )
}
