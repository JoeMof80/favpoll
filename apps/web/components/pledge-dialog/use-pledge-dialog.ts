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

export type PledgeDialogStep = 1 | 2 | 3 | 4

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

  // --- step 2: total-then-split state (founder redesign, 2026-07-31) ---
  // The guest enters ONE total, defaulting entirely to their favourite;
  // step 3 moves whole pounds into the shared fund. usePledge keeps
  // its original semantics (pledgeAmount = the charity portion,
  // topUpAmount = the fund portion) so the verified payment rail and the
  // legacy pledge card are untouched — this is a pure mapping layer.
  const [totalInput, setTotalInput] = useState("")
  const [fundPart, setFundPart] = useState(0)

  // --- steps 2–4: pledge state via usePledge ---
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

  // The split step exists only on the card path with a favourite to split
  // FROM — a no-pick pledge has nothing on the favourite side, and the
  // fund path never splits. Recomputed, so Back from the review lands on
  // the same steps the guest walked forward through.
  const hasSplitStep = !pledge.useSharedFund && selectedIds.length > 0

  // Advance to the review once the PaymentIntent exists — from step 2
  // (split skipped) or step 3.
  useEffect(() => {
    if (pledge.pledgeClientSecret && (step === 2 || step === 3)) {
      setStep(4)
    }
  }, [pledge.pledgeClientSecret, step])

  // --- per-favourite breakdown ---
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
  // no allocations, and skips the split step (nothing to split from).
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
        return
      }
      if (hasSplitStep) {
        setStep(3)
        return
      }
      // Split skipped — price the intent now; the effect above advances
      await pledge.handleOwnConfirm()
      return
    }
    if (step === 3) {
      await pledge.handleOwnConfirm()
    }
  }

  function handleBack() {
    if (step === 4) {
      pledge.setPledgeClientSecret(null)
      pledge.setSubmitting(false)
      setStep(hasSplitStep ? 3 : 2)
    } else if (step === 3) {
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
    setTotalInput("")
    setFundPart(0)
  }

  return {
    // step
    step,
    hasSplitStep,
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
    // steps 2–4 (delegate to usePledge)
    ...pledge,
    // total-then-split mapping (overrides ride below the spread)
    totalInput,
    fundPart,
    handleTotalChange,
    stepFund,
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
