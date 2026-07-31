import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  createPledge,
  createGuestPledge,
  guestPreflightState,
  topUpFund,
  topUpFundAsGuest,
  pledgeFromFund,
} from "@/app/favpolls/[id]/actions"
import { computePledgeAllocations } from "@/lib/pledge-allocations"
import type {
  FavpollPollWithItems,
  FavpollPot,
  PotAllocation,
} from "@favpoll/types"
import {
  FUND_GREEN,
  FUND_AMBER,
  FUND_RED,
  formatCharityLabel,
  tipOptionsFor,
  defaultTipFor,
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
  onPledgeSuccess?: (guestToken?: string) => void
  /** false = default the contribution to None (memorial favpolls —
   *  the quietest ask for the most sensitive register). When true the
   *  suggestion scales with the pledge (see tipOptionsFor). */
  suggestTip?: boolean
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
  suggestTip = true,
}: UsePledgeOptions) {
  const router = useRouter()

  const charityLabel = formatCharityLabel(charityNames)
  const available = pot ? pot.total_deposited - pot.total_allocated : 0
  const hasFund = pot !== null && available > 0 && !!clerkUserId

  const [pledgeAmount, setPledgeAmount] = useState("")
  // Guest-wall identity: guests may type a name (blank = "Someone");
  // isAnonymous hides the name from the wall only — organisers always
  // see names, which the UI discloses at the point of choice.
  const [displayName, setDisplayName] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  // null = untouched: the suggestion tracks the pledge tier. Once the
  // guest taps a chip their choice is never overridden by tier changes.
  const [touchedTip, setTouchedTip] = useState<number | null>(null)
  const [topUpAmount, setTopUpAmount] = useState("")
  const [guestEmail, setGuestEmail] = useState("")
  const [useSharedFund, setUseSharedFund] = useState(false)
  const [pledgeClientSecret, setPledgeClientSecret] = useState<string | null>(
    null
  )
  // The PaymentIntent behind pledgeClientSecret — passed to the pledge
  // actions, which verify it against Stripe before recording anything.
  const [pledgePaymentIntentId, setPledgePaymentIntentId] = useState<
    string | null
  >(null)
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
  // No platform fee — 100% of the pledge goes to charity (decided 2026-07).
  // The optional contribution rides the same charge but is favpoll's, not
  // the charity's: it lives in tip_amount, never total_amount.
  const tipAmount =
    touchedTip !== null ? touchedTip : suggestTip ? defaultTipFor(ownBase) : 0
  // If a touched tip isn't one of the current tier's chips (e.g. £3 chosen
  // at £20, then the pledge bumped to £50 whose tier is None/£2/£5/£10),
  // surface it as an extra chip so the charged amount is never invisible.
  const baseTipOptions = tipOptionsFor(ownBase)
  const tipOptions = baseTipOptions.includes(tipAmount)
    ? baseTipOptions
    : [...baseTipOptions, tipAmount].sort((a, b) => a - b)
  const ownTip = ownBase > 0 ? tipAmount : 0
  const ownCharge = Math.round((ownBase + ownTopUp + ownTip) * 100) / 100

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
          // ONE charity line covering pledge + fund: shared-fund money
          // reaches the charity too — drawn by guests it helps, and any
          // residual goes to the charity at settlement (founder policy,
          // 2026-07-31). A separate "contribution" line read as if the
          // fund money went elsewhere.
          lines: [
            {
              label: `To ${charityLabel}`,
              amount: Math.round((numericPledge + ownTopUp) * 100) / 100,
            },
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

  async function savePledge(
    guestEmailParam?: string
  ): Promise<string | undefined> {
    const selections = pollSelections[pollWithItems.id] ?? []
    // The actions verify this PaymentIntent against Stripe before recording;
    // an empty id is rejected server-side.
    const paymentIntentId = pledgePaymentIntentId ?? ""
    if (clerkUserId) {
      await createPledge({
        favpollPollId: pollWithItems.id,
        potAllocationId: userPotAllocation?.id ?? null,
        totalAmount: numericPledge,
        tipAmount: ownTip,
        isAnonymous,
        allocations: computePledgeAllocations(
          selections,
          pollWithItems.topics.favourites,
          numericPledge
        ),
        paymentIntentId,
      })
      return undefined
    } else {
      const email = guestEmailParam ?? guestEmail
      const token = await createGuestPledge({
        favpollPollId: pollWithItems.id,
        guestEmail: email,
        totalAmount: numericPledge,
        tipAmount: ownTip,
        displayName: displayName || null,
        isAnonymous,
        allocations: computePledgeAllocations(
          selections,
          pollWithItems.topics.favourites,
          numericPledge
        ),
        paymentIntentId,
      })
      return token
    }
  }

  async function handleOwnConfirm() {
    // Guard on baseCanConfirm (not canOwnConfirm) so this works from PledgeDialog
    // where guest email is captured in step 3, not step 2.
    // canOwnConfirm's email gate is enforced at the UI level by pledge-card.
    if (!baseCanConfirm) return
    setError(null)
    setSubmitting(true)
    try {
      // The route computes the charge server-side from these parts and
      // stamps them into PI metadata — savePledge is verified against them.
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favpollPollId: pollWithItems.id,
          favpollId,
          pledgeAmount: ownBase,
          tipAmount: ownTip,
          topUpAmount: ownTopUp,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to create payment")
      setPendingTopUp(isTopUpValid)
      setPledgePaymentIntentId(data.paymentIntentId ?? null)
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
        totalAmount: numericPledge,
        isAnonymous,
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

  // Ran by CheckoutForm BEFORE Stripe charges: the duplicate-email check
  // must reject before money moves — createGuestPledge's own check fires
  // after the charge, which stranded a guest on a frozen "Processing…"
  // with their card already debited (found on-device, 2026-07-26).
  async function pledgePreflight(email?: string): Promise<{
    message: string
    signInEmail?: string
    authMode?: "sign-in" | "sign-up"
  } | null> {
    if (clerkUserId) return null
    const addr = (email ?? guestEmail).trim()
    if (!addr) return null
    const { hasAccount, hasActivePledge } = await guestPreflightState(
      pollWithItems.id,
      addr
    )
    // Account first: it answers both cases, and a guest pledge under an
    // account email would orphan the pledge from their history.
    if (hasAccount) {
      return {
        message:
          "This email has a favpoll account. Sign in to pledge — it keeps your pledges together in your account.",
        signInEmail: addr,
        authMode: "sign-in",
      }
    }
    if (hasActivePledge) {
      // The invitation, not a refusal: an account lets pledges stack
      // (signed-in pledges have no per-poll limit) and signup claims
      // the existing guest pledge by verified-email match.
      return {
        message:
          "You've already pledged on this poll as a guest. Create an account (or sign in) with this email to add another pledge — or use the withdrawal link in your email to change it.",
        signInEmail: addr,
        authMode: "sign-up",
      }
    }
    return null
  }

  async function handlePledgePaymentSuccess(email?: string) {
    try {
      const guestToken = await savePledge(email ?? guestEmail)
      // The top-up rode the same PaymentIntent as the pledge — the action
      // verifies its topup_amount metadata before crediting the fund.
      // Guests credit anonymously: topUpFund requires auth and would
      // throw AFTER their card was charged.
      if (pendingTopUp) {
        const topUp = clerkUserId ? topUpFund : topUpFundAsGuest
        await topUp(favpollId, numericTopUp, pledgePaymentIntentId ?? "")
      }
      // Only now unmount the checkout — nulling the secret before saving
      // emptied the dialog and orphaned its submitting flag when the save
      // failed (the iOS freeze).
      setPledgeClientSecret(null)
      setPledgePaymentIntentId(null)
      setPendingTopUp(false)
      onPledgeSuccess?.(guestToken)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pledge")
      // Re-throw so CheckoutForm (still mounted) shows the message inline
      // and re-enables its buttons. Retrying cannot double-charge: the
      // PaymentIntent has already succeeded and Stripe rejects a re-confirm.
      throw err
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
    tipAmount,
    setTipAmount: setTouchedTip,
    tipOptions,
    displayName,
    setDisplayName,
    isAnonymous,
    setIsAnonymous,
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
    pledgePreflight,
  }
}
