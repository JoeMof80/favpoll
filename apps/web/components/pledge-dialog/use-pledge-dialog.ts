"use client"

import { useEffect, useMemo, useState } from "react"
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
  /** Resolves to the new favourite's id so the picker can auto-pick it */
  onAddItem?: (label: string) => Promise<string | void>
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
  // --- step 1: the favourite picker (settled 2026-09-16 after a
  // tap-advance audition): chips TOGGLE — multi-select stays visible and
  // self-evident — and the footer's primary commits: "Next →" with a
  // selection, "Give anyway →" with none (the no-favourite gift absorbed
  // into the primary, so the can't-decide guest sees their exit
  // immediately). What the rework kept: no draft chips in the search bar,
  // no standing add gate (creatable combobox — "+ Add ‘X’" auto-selects
  // its chip), and step 2's per-line remove. No draft ids: toggles commit
  // directly.
  const [step, setStep] = useState<PledgeDialogStep>(1)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  // ADD IS ITS OWN SCREEN (founder, 2026-09-16, option C): the picker is
  // pure select; a quiet list-end row opens this focused sub-view (same
  // overlay, swapped content — never nested), which carries the
  // consequence copy a one-tap affordance never could ("the organiser
  // will see this"). The search seeds the add text for continuity.
  const [pickerView, setPickerView] = useState<"select" | "add">("select")
  const [addText, setAddText] = useState("")
  const [addingItem, setAddingItem] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  // Optimistic rows for guest-added favourites (the wizard's
  // extraCharities pattern): the add action returns the id, the row is
  // picked immediately, and router.refresh reconciles the real row.
  // Without this, computePledgeAllocations would silently DROP the new
  // favourite until the refresh landed.
  const [addedItems, setAddedItems] = useState<Favourite[]>([])

  const mergedPoll: FavpollPollWithItems = useMemo(() => {
    const base = pollWithItems.topics.favourites
    const extras = addedItems.filter((a) => !base.some((f) => f.id === a.id))
    if (extras.length === 0) return pollWithItems
    return {
      ...pollWithItems,
      topics: {
        ...pollWithItems.topics,
        favourites: [...base, ...extras],
      },
    }
  }, [pollWithItems, addedItems])

  const sortedItems: Favourite[] = [...mergedPoll.topics.favourites].sort(
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
  // canAdd drives the list-end "Add your own" entry row.
  const canAdd = !!(!mergedPoll.topics.is_finite && onAddItem)

  function enterAddView() {
    setAddText(search.trim())
    setAddError(null)
    setPickerView("add")
  }

  function exitAddView() {
    setAddText("")
    setAddError(null)
    setPickerView("select")
  }

  function toggleFavourite(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
    setAddError(null)
  }

  function removeFavourite(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  async function handleAdd() {
    if (!onAddItem || !addText.trim()) return
    const label = addText.trim()
    // DUPLICATE = SELECT, NOT ERROR (founder, 2026-09-18): adding a
    // favourite that already exists just picks its chip — same intent,
    // better outcome, no constraint error to read. Mirrors the wizard's
    // topic duplicate guard.
    const existing = mergedPoll.topics.favourites.find(
      (f) => f.label.toLowerCase() === label.toLowerCase()
    )
    if (existing) {
      setSelectedIds((prev) =>
        prev.includes(existing.id) ? prev : [...prev, existing.id]
      )
      setSearch("")
      exitAddView()
      return
    }
    setAddingItem(true)
    setAddError(null)
    try {
      const id = await onAddItem(label)
      if (id) {
        setAddedItems((prev) =>
          prev.some((x) => x.id === id)
            ? prev
            : [
                ...prev,
                {
                  id,
                  topic_id: mergedPoll.topic_id,
                  label,
                  all_time_pledged: 0,
                  all_time_count: 0,
                  is_canonical: false,
                  source: "guest",
                } as Favourite,
              ]
        )
        // Auto-select the new chip and return to the picker: search
        // cleared so the chip is in view, selected.
        setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
      }
      setSearch("")
      exitAddView()
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
    pollWithItems: mergedPoll,
    pot,
    userPotAllocation,
    pollSelections: { [mergedPoll.id]: selectedIds },
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
  // ("pledge its worth"), the shared pot is topUpAmount riding on top,
  // and the slider between them REBALANCES the current sum without
  // changing it. No mapping layer: these are the rail's native parts.
  const numericPledge = parseFloat(pledge.pledgeAmount)
  // £1 minimum when a favourite is picked — £0.50 for "Tokyo" makes no
  // sense. Without a pick the pledge goes to the shared pot and any
  // amount > 0 is valid.
  const minAmount = 1
  const isPledgeValid = !isNaN(numericPledge) && numericPledge >= minAmount
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

  // Advance to the pay step once the PaymentIntent exists
  useEffect(() => {
    if (pledge.pledgeClientSecret && step === 3) {
      setStep(4)
    }
  }, [pledge.pledgeClientSecret, step])

  // --- per-favourite breakdown (with ids — step 2's lines carry remove) ---
  function getFavouriteBreakdown() {
    if (selectedIds.length === 0) return []
    const items = mergedPoll.topics.favourites
    if (!isPledgeValid) {
      return selectedIds.map((id) => {
        const item = items.find((f) => f.id === id)
        return { id, label: item?.label ?? id, amount: 0 }
      })
    }
    return computePledgeAllocations(selectedIds, items, numericPledge).map(
      (a) => {
        const item = items.find((f) => f.id === a.favouriteId)
        return {
          id: a.favouriteId,
          label: item?.label ?? a.favouriteId,
          amount: a.amount,
        }
      }
    )
  }

  // --- navigation ---
  // 1 Pick → 2 Amount → 3 Guest book → 4 Review & pay
  async function handleNext() {
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      // Amount step advances to the guest book step
      setStep(3)
      return
    }
    if (step === 3) {
      // Guest book step prices the intent (or confirms fund)
      if (pledge.useSharedFund) {
        await pledge.handleFundConfirm()
        // onPledgeSuccess closes the dialog via the caller
      } else {
        // Price the intent; the effect above advances to step 4
        await pledge.handleOwnConfirm()
      }
    }
  }

  function handleBack() {
    if (step === 4) {
      pledge.setPledgeClientSecret(null)
      pledge.setSubmitting(false)
      setStep(3)
    } else if (step === 3) {
      setStep(2)
    } else if (step === 2) {
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
    setSelectedIds([])
    setSearch("")
    setAddError(null)
    setPickerView("select")
    setAddText("")
    pledge.updatePledgeAmount("")
    pledge.setTopUpAmount("")
  }

  return {
    // step
    step,
    // step 1
    selectedIds,
    toggleFavourite,
    removeFavourite,
    pickerView,
    enterAddView,
    exitAddView,
    addText,
    setAddText,
    search,
    setSearch: (v: string) => {
      setSearch(v)
      setAddError(null)
    },
    sortedItems,
    filteredItems,
    canAdd,
    addingItem,
    addError,
    handleAdd,
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
    // navigation
    handleNext,
    handleBack,
    handleClose,
  }
}
