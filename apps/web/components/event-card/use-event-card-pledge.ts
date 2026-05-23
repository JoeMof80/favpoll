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
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedItemLabel, setSelectedItemLabel] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null) // pounds
  const [step, setStep] = useState<CardStep>(initialResults ? "pledged" : "idle")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [results, setResults] = useState<CardResultItem[] | null>(initialResults ?? null)
  const [error, setError] = useState<string | null>(null)

  function selectItem(id: string, label: string) {
    setSelectedItemId(id)
    setSelectedItemLabel(label)
    // Picker closes; move to ready if amount is already set
    setStep(amount !== null ? "ready" : "idle")
  }

  function selectAmount(pounds: number) {
    setAmount(pounds)
    if (selectedItemId !== null) setStep("ready")
  }

  async function initPayment() {
    if (selectedItemId === null || amount === null) return
    setError(null)
    try {
      const res = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }), // pounds
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error((body as { error?: string }).error ?? "Failed to initialise payment")
      }
      const { clientSecret: secret } = (await res.json()) as { clientSecret: string }
      setClientSecret(secret)
      setStep("paying")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment setup failed")
    }
  }

  async function onPaymentSuccess() {
    if (selectedItemId === null || amount === null) return

    try {
      await createPledge({
        eventPollId: pollId,
        potAllocationId: null,
        totalAmount: amount,
        allocations: [{ topicItemId: selectedItemId, amount }],
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
    setSelectedItemId(null)
    setSelectedItemLabel(null)
    setAmount(null)
    setStep("idle")
    setClientSecret(null)
    setError(null)
  }

  return {
    selectedItemId,
    selectedItemLabel,
    amount,
    step,
    clientSecret,
    results,
    error,
    selectItem,
    selectAmount,
    initPayment,
    onPaymentSuccess,
    closePayment,
    resetPledge,
    viewResults,
  }
}
