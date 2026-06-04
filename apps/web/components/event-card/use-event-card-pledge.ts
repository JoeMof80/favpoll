"use client"

import { useState } from "react"
import { createPledge } from "@/app/events/[id]/actions"

export type CardStep = "idle" | "ready" | "paying" | "pledged"

export type CardResultItem = {
  label: string
  amountPence: number
  widthPercent: number
}

type Options = {
  pollId: string
  initialResults?: CardResultItem[]
}

export function useEventCardPledge({ pollId, initialResults }: Options) {
  const [selectedIds, setSelectedIdsState] = useState<string[]>([])
  const [amount, setAmount] = useState<number | null>(null) // pounds
  const [step, setStep] = useState<CardStep>(
    initialResults ? "pledged" : "idle"
  )
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [results, setResults] = useState<CardResultItem[] | null>(
    initialResults ?? null
  )
  const [error, setError] = useState<string | null>(null)

  function setSelectedIds(ids: string[]) {
    setSelectedIdsState(ids)
    setStep(ids.length > 0 && amount !== null && amount > 0 ? "ready" : "idle")
  }

  function selectAmount(pounds: number) {
    setAmount(pounds)
    if (selectedIds.length > 0 && pounds > 0) setStep("ready")
    else if (step === "ready") setStep("idle")
  }

  async function initPayment() {
    if (selectedIds.length === 0 || amount === null) return
    setError(null)
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }), // pounds
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(
          (body as { error?: string }).error ?? "Failed to initialise payment"
        )
      }
      const { clientSecret: secret } = (await res.json()) as {
        clientSecret: string
      }
      setClientSecret(secret)
      setStep("paying")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment setup failed")
    }
  }

  async function onPaymentSuccess() {
    if (selectedIds.length === 0 || amount === null) return

    const equal = Math.floor(100 / selectedIds.length)
    const remainder = 100 - equal * selectedIds.length
    const allocations = selectedIds.map((id, idx) => ({
      topicItemId: id,
      amount:
        Math.round(
          ((amount * (idx === 0 ? equal + remainder : equal)) / 100) * 100
        ) / 100,
    }))

    try {
      await createPledge({
        eventPollId: pollId,
        potAllocationId: null,
        totalAmount: amount,
        allocations,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save pledge")
      setClientSecret(null)
      setStep("ready")
      return
    }

    // Fetch results snapshot for this poll
    try {
      const res = await fetch(`/api/polls/${pollId}/results`)
      if (res.ok) {
        const { results: fetched } = (await res.json()) as {
          results: CardResultItem[]
        }
        if (fetched.length > 0) setResults(fetched)
      }
    } catch {
      // Non-fatal — show pledged state without results
    }

    setClientSecret(null)
    setStep("pledged")
  }

  function closePayment() {
    setClientSecret(null)
    setStep("ready")
  }

  function viewResults() {
    setStep("pledged")
  }

  function resetPledge() {
    setSelectedIdsState([])
    setAmount(null)
    setStep("idle")
    setClientSecret(null)
    setError(null)
  }

  return {
    selectedIds,
    setSelectedIds,
    amount,
    step,
    clientSecret,
    results,
    error,
    selectAmount,
    initPayment,
    onPaymentSuccess,
    closePayment,
    resetPledge,
    viewResults,
  }
}
