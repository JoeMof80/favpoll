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
  const showCreate = !!(
    !pollWithItems.topics.is_finite &&
    onAddItem &&
    lowerSearch &&
    filteredItems.length === 0
  )

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

  // --- step 2: total-then-split state (founder redesign, 2026-07-31) ---
  // The guest enters ONE total, defaulting entirely to their favourite;
  // a stepper moves whole pounds into the shared fund. usePledge keeps
  // its original semantics (pledgeAmount = the charity portion,
  // topUpAmount = the fund portion) so the verified payment rail and the
  // legacy pledge card are untouched — this is a pure mapping layer.
  const [totalInput, setTotalInput] = useState("")
  const [fundPart, setFundPart] = useState(0)

  // --- step 2/3: pledge state via usePledge ---
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
  })

  // Push a (total, fund) pair down into usePledge's parts. The fund is
  // clamped so the favourite always keeps at least £1 of worth, and
  // collapses to 0 when the total empties or shrinks beneath it.
  function applySplit(total: string, fund: number) {
    const t = parseFloat(total)
    const valid = !isNaN(t) && t > 0
    const f = valid ? Math.max(0, Math.min(fund, Math.floor(t - 1))) : 0
    setTotalInput(total)
    setFundPart(f)
    pledge.updatePledgeAmount(
      valid ? String(Math.round((t - f) * 100) / 100) : total
    )
    pledge.setTopUpAmount(f > 0 ? String(f) : "")
  }

  function handleTotalChange(v: string) {
    applySplit(v, fundPart)
  }

  function stepFund(delta: number) {
    applySplit(totalInput, fundPart + delta)
  }

  // Drawing FROM the fund and paying INTO it are exclusive — entering
  // fund mode zeroes the split. Guarded so a toggle with no split never
  // rewrites amounts set through the legacy updatePledgeAmount path.
  function toggleFundAndResetSplit() {
    if (fundPart > 0) applySplit(totalInput, 0)
    pledge.toggleFund()
  }

  // Auto-advance to step 3 when PI is created
  useEffect(() => {
    if (pledge.pledgeClientSecret && step === 2) {
      setStep(3)
    }
  }, [pledge.pledgeClientSecret, step])

  // --- per-favourite breakdown (step 2 primary view) ---
  const numericPledge = parseFloat(pledge.pledgeAmount)
  const isPledgeValid = !isNaN(numericPledge) && numericPledge > 0

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

  // --- per-charity breakdown (step 2 secondary, collapsible) ---
  function getCharityBreakdown() {
    if (!isPledgeValid || charityNames.length < 2) return []
    const perCharity =
      Math.round((numericPledge / charityNames.length) * 100) / 100
    return charityNames.map((name) => ({ label: name, amount: perCharity }))
  }

  // --- navigation ---
  const canAdvanceStep1 = draftIds.length > 0

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
        await pledge.handleOwnConfirm()
        // useEffect above advances to step 3 when clientSecret is set
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

  function handleClose() {
    setStep(1)
    setDraftIds([])
    setSearch("")
    setAddError(null)
    setTotalInput("")
    setFundPart(0)
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
    showCreate,
    addingItem,
    addError,
    handleAdd,
    canAdvanceStep1,
    // step 2/3 (delegate to usePledge)
    ...pledge,
    // total-then-split mapping (overrides ride below the spread)
    totalInput,
    fundPart,
    handleTotalChange,
    stepFund,
    toggleFund: toggleFundAndResetSplit,
    // breakdowns
    favouriteBreakdown: getFavouriteBreakdown(),
    charityBreakdown: getCharityBreakdown(),
    // navigation
    handleNext,
    handleBack,
    handleClose,
  }
}
