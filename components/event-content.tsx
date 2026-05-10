'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Countdown } from '@/components/countdown'
import { EventHero } from '@/components/event-hero'
import { CharityBanner } from '@/components/charity-banner'
import { PotBanner } from '@/components/pot-banner'
import { PollSection } from '@/components/poll-section'
import { StripeCheckout } from '@/components/stripe-checkout'
import { createPledge, topUpFund, addGuestItem } from '@/app/events/[id]/actions'
import { computePledgeAllocations } from '@/components/pledge-panel'
import type {
  EventWithDetails,
  EventPollWithItems,
  EventPot,
  PotAllocation,
} from '@/types'

type Props = {
  event: EventWithDetails
  pollsWithItems: EventPollWithItems[]
  pot: EventPot | null
  userPotAllocation: PotAllocation | null
  existingPledgesByPollId: string[]
  totalRaised: number
  isClosed: boolean
  clerkUserId: string | null
}

export function EventContent({
  event,
  pollsWithItems,
  pot,
  userPotAllocation,
  existingPledgesByPollId,
  totalRaised,
  isClosed,
  clerkUserId,
}: Props) {
  const router = useRouter()
  const existingSet = new Set(existingPledgesByPollId)
  const potAmount = userPotAllocation?.amount ?? null

  const [pledgeAmount, setPledgeAmount] = useState<string>(
    potAmount ? String(potAmount) : '',
  )
  const [pollSelections, setPollSelections] = useState<Record<string, string[]>>({})

  // Stripe pledge flow
  const [pledgeClientSecret, setPledgeClientSecret] = useState<string | null>(null)
  const [pledgeError, setPledgeError] = useState<string | null>(null)
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false)

  // Add to fund flow
  const [fundAmount, setFundAmount] = useState('')
  const [fundClientSecret, setFundClientSecret] = useState<string | null>(null)
  const [fundError, setFundError] = useState<string | null>(null)
  const [fundSubmitting, setFundSubmitting] = useState(false)
  const [showFundInput, setShowFundInput] = useState(false)

  const numericAmount = parseFloat(pledgeAmount)
  const isAmountValid = !isNaN(numericAmount) && numericAmount > 0
  const chargeAmount = isAmountValid ? Math.round(numericAmount * 1.03 * 100) / 100 : 0
  const hasAnySelection = Object.values(pollSelections).some((ids) => ids.length > 0)
  const showAmountInput = !isClosed && clerkUserId && !potAmount
  const canConfirm = isAmountValid && hasAnySelection && !pledgeSubmitting

  const handleSelectionsChange = useCallback(
    (pollId: string, selectedIds: string[]) =>
      setPollSelections((prev) => ({ ...prev, [pollId]: selectedIds })),
    [],
  )

  async function handleConfirmPledge() {
    if (!canConfirm) return
    setPledgeSubmitting(true)
    setPledgeError(null)
    try {
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: chargeAmount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create payment')
      setPledgeClientSecret(data.clientSecret)
    } catch (err) {
      setPledgeError(err instanceof Error ? err.message : 'Something went wrong')
      setPledgeSubmitting(false)
    }
  }

  async function handlePledgePaymentSuccess() {
    setPledgeClientSecret(null)
    try {
      const pollsToSubmit = pollsWithItems.filter(
        (p) => (pollSelections[p.id]?.length ?? 0) > 0,
      )
      await Promise.all(
        pollsToSubmit.map((poll) =>
          createPledge({
            eventPollId: poll.id,
            potAllocationId: userPotAllocation?.id ?? null,
            totalAmount: numericAmount,
            allocations: computePledgeAllocations(
              pollSelections[poll.id],
              poll.topics.topic_items,
              numericAmount,
            ),
          }),
        ),
      )
      router.refresh()
    } catch (err) {
      setPledgeError(err instanceof Error ? err.message : 'Failed to save pledge')
    } finally {
      setPledgeSubmitting(false)
    }
  }

  async function handleAddToFund() {
    const amount = parseFloat(fundAmount)
    if (isNaN(amount) || amount <= 0) return
    const fundChargeAmount = Math.round(amount * 1.03 * 100) / 100
    setFundSubmitting(true)
    setFundError(null)
    try {
      const res = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: fundChargeAmount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create payment')
      setFundClientSecret(data.clientSecret)
    } catch (err) {
      setFundError(err instanceof Error ? err.message : 'Something went wrong')
      setFundSubmitting(false)
    }
  }

  async function handleFundPaymentSuccess() {
    setFundClientSecret(null)
    try {
      await topUpFund(event.id, parseFloat(fundAmount))
      setFundAmount('')
      setShowFundInput(false)
      router.refresh()
    } catch (err) {
      setFundError(err instanceof Error ? err.message : 'Failed to add to fund')
    } finally {
      setFundSubmitting(false)
    }
  }

  return (
    <>
      {/* Stripe modals */}
      {pledgeClientSecret && (
        <StripeCheckout
          clientSecret={pledgeClientSecret}
          charityAmount={numericAmount}
          chargeAmount={chargeAmount}
          onSuccess={handlePledgePaymentSuccess}
          onClose={() => { setPledgeClientSecret(null); setPledgeSubmitting(false) }}
        />
      )}
      {fundClientSecret && (
        <StripeCheckout
          clientSecret={fundClientSecret}
          chargeAmount={Math.round(parseFloat(fundAmount) * 1.03 * 100) / 100}
          onSuccess={handleFundPaymentSuccess}
          onClose={() => { setFundClientSecret(null); setFundSubmitting(false) }}
        />
      )}

      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left — polls */}
        <div>
          {pollsWithItems.length > 0 ? (
            <div className="space-y-12">
              {pollsWithItems.map((poll) => (
                <PollSection
                  key={poll.id}
                  poll={poll}
                  clerkUserId={clerkUserId}
                  pledgeAmount={pledgeAmount}
                  isClosed={isClosed}
                  hasPledged={existingSet.has(poll.id)}
                  onSelectionsChange={handleSelectionsChange}
                  onAddItem={
                    !poll.topics.is_finite && !isClosed && clerkUserId
                      ? async (label) => {
                          await addGuestItem(poll.id, poll.topic_id, label)
                          router.refresh()
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">
              No polls have been set up for this event yet.
            </p>
          )}
        </div>

        {/* Right — sticky meta */}
        <div className="sticky top-20 self-start space-y-4">
          <EventHero event={event} person={event.persons} />
          <CharityBanner charity={event.charities} totalRaised={totalRaised} />
          {!isClosed && <Countdown closesAt={event.closes_at} />}

          {/* Your pledge — amount input + confirm button */}
          {showAmountInput && (
            <div className="space-y-3 rounded-lg border border-border bg-card px-5 py-4">
              <div>
                <label
                  htmlFor="sidebar-pledge-amount"
                  className="text-xs text-muted-foreground"
                >
                  Your pledge
                </label>
                <div className="relative mt-2">
                  <span
                    className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xl text-muted-foreground"
                    aria-hidden="true"
                  >
                    £
                  </span>
                  <input
                    id="sidebar-pledge-amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={pledgeAmount}
                    onChange={(e) => setPledgeAmount(e.target.value)}
                    className="w-full rounded-md border border-input bg-background py-3 pl-8 pr-3 text-2xl font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0"
                  />
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {isAmountValid
                    ? `You'll be charged ${new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(chargeAmount)} (3% fee added)`
                    : '3% fee added on top. All proceeds to charity.'}
                </p>
              </div>

              {pledgeError && (
                <p className="text-sm text-destructive">{pledgeError}</p>
              )}

              <button
                type="button"
                onClick={handleConfirmPledge}
                disabled={!canConfirm}
                className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {pledgeSubmitting ? 'Processing…' : 'Confirm pledge'}
              </button>
            </div>
          )}

          {/* Shared fund */}
          {pot && (
            <div className="space-y-3">
              <PotBanner pot={pot} userAllocation={userPotAllocation} />

              {!isClosed && clerkUserId && (
                <div>
                  {showFundInput ? (
                    <div className="rounded-lg border border-border bg-card px-4 py-3 space-y-3">
                      <label className="text-xs text-muted-foreground">Add to shared fund (£)</label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">£</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          className="w-full rounded-md border border-input bg-background py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          placeholder="0"
                        />
                      </div>
                      {fundError && <p className="text-xs text-destructive">{fundError}</p>}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => { setShowFundInput(false); setFundAmount(''); setFundError(null) }}
                          className="flex-1 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddToFund}
                          disabled={fundSubmitting || !fundAmount || parseFloat(fundAmount) <= 0}
                          className="flex-1 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                        >
                          {fundSubmitting ? 'Processing…' : 'Add funds'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowFundInput(true)}
                      className="w-full rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      + Add to shared fund
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
