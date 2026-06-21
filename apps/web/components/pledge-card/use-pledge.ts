import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createPledge,
  createGuestPledge,
  topUpFund,
  pledgeFromFund,
} from "@/app/favpolls/[id]/actions"
import { computePledgeAllocations } from "@/components/pledge-panel"
import type {
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import {
  GBP,
  FUND_GREEN,
  FUND_AMBER,
  FUND_RED,
  formatCharityLabel,
} from "./utils"
import type { BreakdownLine } from "./pledge-breakdown"

export type UsePledgeOptions = {
  favpollId: string
  clerkUserId: string | null
  charityNames: string[]
  pollWithItems: FavpollPollWithItems
  pot: FavpollPot | null
  userPotAllocation: PotAllocation | null
  pollSelections: Record<string, string[]>
  onPledgeAmountChange: (amount: string) => void
  onPledgeSuccess?: () => void
}

export function usePledge({
  favpollId,
  clerkUserId,
  charityNames,
  pollWithItems,
  pot,
  userPotAllocation,
  pollSelections,
  onPledgeAmountChange,
  onPledgeSuccess,
}: UsePledgeOptions) {
  const router = useRouter()

  const charityLabel = formatCharityLabel(charityNames)
  const available = pot ? pot.total_deposited - pot.total_allocated : 0
  const hasFund = pot !== null && available > 0 && !!clerkUserId

  const [pledgeAmount, setPledgeAmount] = useState("")
  const [topUpAmount, setTopUpAmount] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [useSharedFund, setUseSharedFund] = useState(false)
  const [pledgeClientSecret, setPledgeClientSecret] = useState<string | null>(
    null
  )
  const [pendingTopUp, setPendingTopUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updatePledgeAmount(v: string) {
    setPledgeAmount(v)
    onPledgeAmountChange(v)
  }

  function toggleFund() {
    setUseSharedFund((v) => !v)
    setError(null)
  }

  const numericPledge = parseFloat(pledgeAmount)
  const numericTopUp = parseFloat(topUpAmount)
  const isPledgeValid = !isNaN(numericPledge) && numericPledge > 0
  const isTopUpValid = !isNaN(numericTopUp) && numericTopUp > 0
  const fundOverAvailable = isPledgeValid && numericPledge > available

  const ownBase = isPledgeValid ? numericPledge : 0
  const ownTopUp = isTopUpValid ? numericTopUp : 0
  const ownCharge =
    ownBase + ownTopUp > 0
      ? Math.round((ownBase + ownTopUp) * 1.03 * 100) / 100
      : 0
  const ownFee = Math.round((ownCharge - (ownBase + ownTopUp)) * 100) / 100

  const fundBarPct =
    isPledgeValid && available > 0 ? numericPledge / available : 0
  const fundBarColor =
    fundBarPct <= 0.8 ? FUND_GREEN : fundBarPct <= 1.0 ? FUND_AMBER : FUND_RED

  const isGuestEmailValid = !clerkUserId
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)
    : true

  const hasAnySelection = (pollSelections[pollWithItems.id]?.length ?? 0) > 0
  const baseCanConfirm = isPledgeValid && hasAnySelection && !submitting
  const canOwnConfirm =
    baseCanConfirm && (!clerkUserId ? isGuestEmailValid : true)
  const canFundConfirm = baseCanConfirm && !fundOverAvailable

  const ownBreakdown: {
    lines: BreakdownLine[]
    total: { label: string; amount: number }
  } | null =
    !useSharedFund && isPledgeValid
      ? {
          lines: [
            { label: `To ${charityLabel}`, amount: numericPledge },
            {
              label: "Shared fund contribution",
              amount: numericTopUp,
              hidden: !isTopUpValid,
            },
            { label: "Platform fee (3%)", amount: ownFee },
          ],
          total: { label: "Total charged", amount: ownCharge },
        }
      : null

  const fundBreakdown: {
    lines: BreakdownLine[]
    total: { label: string; amount: number }
  } | null =
    useSharedFund && isPledgeValid && !fundOverAvailable
      ? {
          lines: [
            { label: `To ${charityLabel}`, amount: numericPledge },
            { label: "Deducted from shared fund", amount: numericPledge },
          ],
          total: { label: "Charged to you", amount: 0 },
        }
      : null

  async function savePledge(guestEmailParam?: string) {
    const selections = pollSelections[pollWithItems.id] ?? []
    if (clerkUserId) {
      await createPledge({
        favpollPollId: pollWithItems.id,
        potAllocationId: userPotAllocation?.id ?? null,
        totalAmount: numericPledge,
        allocations: computePledgeAllocations(
          selections,
          pollWithItems.topics.favourites,
          numericPledge
        ),
      })
    } else {
      const email = guestEmailParam ?? guestEmail
      await createGuestPledge({
        favpollPollId: pollWithItems.id,
        guestEmail: email,
        totalAmount: numericPledge,
        allocations: computePledgeAllocations(
          selections,
          pollWithItems.topics.favourites,
          numericPledge
        ),
      })
    }
  }

  async function handleOwnConfirm() {
    if (!canOwnConfirm) return
    setError(null)
    setSubmitting(true)
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: ownCharge }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create payment")
      setPendingTopUp(isTopUpValid)
      setPledgeClientSecret(data.clientSecret)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setSubmitting(false)
    }
  }

  async function handleFundConfirm() {
    if (!canFundConfirm || !pot) return
    setError(null)
    setSubmitting(true)
    try {
      await pledgeFromFund({
        favpollPollId: pollWithItems.id,
        potId: pot.id,
        potCurrentAllocated: pot.total_allocated,
        totalAmount: numericPledge,
        allocations: computePledgeAllocations(
          pollSelections[pollWithItems.id] ?? [],
          pollWithItems.topics.favourites,
          numericPledge
        ),
      })
      onPledgeSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePledgePaymentSuccess(email?: string) {
    setPledgeClientSecret(null)
    try {
      await savePledge(email ?? guestEmail)
      if (pendingTopUp) await topUpFund(favpollId, numericTopUp)
      setPendingTopUp(false)
      onPledgeSuccess?.()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pledge")
    } finally {
      setSubmitting(false)
    }
  }

  return {
    // state
    pledgeAmount,
    topUpAmount,
    guestEmail,
    useSharedFund,
    pledgeClientSecret,
    error,
    submitting,
    // setters
    updatePledgeAmount,
    setTopUpAmount,
    setGuestEmail,
    toggleFund,
    setPledgeClientSecret,
    setSubmitting,
    // derived
    available,
    hasFund,
    numericPledge,
    isPledgeValid,
    isTopUpValid,
    fundOverAvailable,
    ownCharge,
    fundBarPct,
    fundBarColor,
    isGuestEmailValid,
    canOwnConfirm,
    canFundConfirm,
    charityLabel,
    ownBreakdown,
    fundBreakdown,
    // handlers
    handleOwnConfirm,
    handleFundConfirm,
    handlePledgePaymentSuccess,
  }
}
