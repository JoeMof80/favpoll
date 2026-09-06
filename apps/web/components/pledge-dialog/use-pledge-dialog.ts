"use client"

import { useEffect, useState } from "react"
import { usePledge } from "@/components/pledge-card/use-pledge"
import { computePledgeAllocations } from "@/lib/pledge-allocations"
import type {
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
  Favourite,
} from "@favpoll/types"

export type PledgeDialogStep = 1 | 2 | 3

export type UsePledgeDialogOptions = {
  favpollId: string
  clerkUserId: string | null
  charityNames: string[]
  pollWithItems: FavpollPollWithItems
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  onPledgeSuccess?: (guestToken?: string) => void
  onAddItem?: (label: string) => Promise<void>
  /** false defaults the contribution to None (memorials) */
  suggestTip?: boolean
}

export function usePledgeDialog({
  favpollId,
  clerkUserId,
  charityNames,
  pollWithItems,
  pot,
  userPotAllocation,
  onPledgeSuccess,
  onAddItem,
  suggestTip,
}: UsePledgeDialogOptions) {
  // --- step 1: picker draft state ---
  const [step, setStep] = useState<PledgeDialogStep>(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [draftIds, setDraftIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  const sortedItems: Favourite[] = [...pollWithItems.topics.favourites].sort(
    (a, b) => a.label.localeCompare(b.label)
  )
  const lowerSearch = search.toLowerCase().trim()
  const filteredItems = lowerSearch
    ? sortedItems.filter((item) =>
        item.label.toLowerCase().includes(lowerSearch)
      )
    : sortedItems
  // Whether adding is possible AT ALL — an open topic, and a handler, which
  // the page withholds when the organiser has turned guest additions off.
  // showCreate is this plus "and the search found nothing", so canAdd is what
  // the persistent hint keys on.
  const canAdd = !!(!pollWithItems.topics.is_finite && onAddItem)
  const showCreate = !!(canAdd && lowerSearch && filteredItems.length === 0)

  function toggleDraft(id: string) {
    setDraftIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleAdd() {
    if (!onAddItem || !search.trim()) return
    setAddingItem(true)
    setAddError(null)
    try {
      await onAddItem(search.trim())
      setSearch("")
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add")
    } finally {
      setAddingItem(false)
    }
  }

  // --- steps 2–3: pledge state via usePledge ---
  const pledge = usePledge({
    favpollId,
    clerkUserId,
    charityNames,
    pollWithItems,
    pot,
    userPotAllocation,
    pollSelections: { [pollWithItems.id]: selectedIds },
    onPledgeAmountChange: () => {},
    onPledgeSuccess,
    suggestTip,
    // Picking is optional in the dialog (founder, 2026-08-17) — a guest
    // may give with no favourite attached, so the confirm gate must not
    // require a selection here. The legacy card keeps its own gate.
    allowEmptySelection: true,
  })

  // --- step 2: TWO-PART entry (founder mock, 2026-09-06 — supersedes
  // total-then-split). The favourites figure IS usePledge's pledgeAmount
  // ("pledge its worth"), the shared fund is topUpAmount riding on top,
  // and the slider between them REBALANCES the current sum without
  // changing it. No mapping layer: these are the rail's native parts.
  const numericPledge = parseFloat(pledge.pledgeAmount)
  const isPledgeValid = !isNaN(numericPledge) && numericPledge > 0
  const numericFund = parseFloat(pledge.topUpAmount)
  const fundPart = !isNaN(numericFund) && numericFund > 0 ? numericFund : 0

  function handleFavChange(v: string) {
    pledge.updatePledgeAmount(v)
  }

  function handleFundChange(v: string) {
    pledge.setTopUpAmount(v)
  }

  // Slider grammar: value = the favourites' share of the current sum.
  // Clamped so a picked favourite keeps at least £1 of worth.
  function setFavShare(pounds: number) {
    const fav = isPledgeValid ? numericPledge : 0
    const total = Math.round((fav + fundPart) * 100) / 100
    const floor = selectedIds.length > 0 ? Math.min(1, total) : 0
    const f = Math.max(floor, Math.min(pounds, total))
    const fund = Math.round((total - f) * 100) / 100
    pledge.updatePledgeAmount(f > 0 ? String(f) : "")
    pledge.setTopUpAmount(fund > 0 ? String(fund) : "")
  }

  // Drawing FROM the fund and paying INTO it are exclusive — entering
  // fund mode zeroes the fund part.
  function toggleFundAndResetSplit() {
    if (fundPart > 0) pledge.setTopUpAmount("")
    pledge.toggleFund()
  }

  // Advance to the review once the PaymentIntent exists
  useEffect(() => {
    if (pledge.pledgeClientSecret && step === 2) {
      setStep(3)
    }
  }, [pledge.pledgeClientSecret, step])

  // --- per-favourite breakdown ---
  function getFavouriteBreakdown() {
    if (selectedIds.length === 0) return []
    if (!isPledgeValid) {
      return selectedIds.map((id) => {
        const item = pollWithItems.topics.favourites.find((f) => f.id === id)
        return { label: item?.label ?? id, amount: 0 }
      })
    }
    return computePledgeAllocations(
      selectedIds,
      pollWithItems.topics.favourites,
      numericPledge
    ).map((a) => {
      const item = pollWithItems.topics.favourites.find(
        (f) => f.id === a.favouriteId
      )
      return { label: item?.label ?? a.favouriteId, amount: a.amount }
    })
  }

  // --- per-charity breakdown (collapsible secondary) ---
  function getCharityBreakdown() {
    if (!isPledgeValid || charityNames.length < 2) return []
    const perCharity =
      Math.round((numericPledge / charityNames.length) * 100) / 100
    return charityNames.map((name) => ({ label: name, amount: perCharity }))
  }

  // --- navigation ---
  // PICKING IS OPTIONAL (founder, 2026-08-17). This required at least one
  // favourite, so a guest who could not decide was stuck on step 1 with a
  // dead Next button and no way out but to close the dialog. Giving without
  // backing anything is already a shape the product has — "a gift with no
  // favourite attached" is how the shared fund describes it — and the money
  // reaches the charity either way. A no-pick pledge lands with a total and
  // no allocations (and sees no slider — nothing to rebalance).
  const canAdvanceStep1 = true

  async function handleNext() {
    if (step === 1) {
      setSelectedIds(draftIds)
      setStep(2)
      return
    }
    if (step === 2) {
      if (pledge.useSharedFund) {
        await pledge.handleFundConfirm()
        // onPledgeSuccess closes the dialog via the caller
      } else {
        // Price the intent; the effect above advances to the review
        await pledge.handleOwnConfirm()
      }
    }
  }

  function handleBack() {
    if (step === 3) {
      pledge.setPledgeClientSecret(null)
      pledge.setSubmitting(false)
      setStep(2)
    } else if (step === 2) {
      setDraftIds(selectedIds)
      setStep(1)
    }
  }

  // Tip chips live on the review page (founder, 2026-09-06): a chip tap
  // re-prices the PaymentIntent server-side. Chips and Pay are disabled
  // while refreshingIntent is true.
  function updateTip(v: number) {
    pledge.setTipAmount(v)
    void pledge.refreshIntentWithTip(v)
  }

  function handleClose() {
    setStep(1)
    setDraftIds([])
    setSearch("")
    setAddError(null)
    pledge.updatePledgeAmount("")
    pledge.setTopUpAmount("")
  }

  return {
    // step
    step,
    // step 1
    draftIds,
    toggleDraft,
    search,
    setSearch: (v: string) => {
      setSearch(v)
      setAddError(null)
    },
    sortedItems,
    filteredItems,
    canAdd,
    showCreate,
    addingItem,
    addError,
    handleAdd,
    canAdvanceStep1,
    // steps 2–3 (delegate to usePledge)
    ...pledge,
    // two-part entry (overrides ride below the spread)
    fundPart,
    handleFavChange,
    handleFundChange,
    setFavShare,
    toggleFund: toggleFundAndResetSplit,
    updateTip,
    // breakdowns
    favouriteBreakdown: getFavouriteBreakdown(),
    charityBreakdown: getCharityBreakdown(),
    // navigation
    handleNext,
    handleBack,
    handleClose,
  }
}
