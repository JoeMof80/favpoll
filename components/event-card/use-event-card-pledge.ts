"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { createPledge } from "@/app/events/[id]/actions"

export type CardStep = "idle" | "picking" | "ready" | "paying" | "pledged"

export type CardResultItem = {
  label: string
  amountPence: number
  widthPercent: number
}

type Options = {
  pollId: string
  topicId: string | null
}

export function useEventCardPledge({ pollId, topicId }: Options) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedItemLabel, setSelectedItemLabel] = useState<string | null>(null)
  const [amount, setAmount] = useState<number | null>(null) // pounds
  const [step, setStep] = useState<CardStep>("idle")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [results, setResults] = useState<CardResultItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openPicker() {
    setStep("picking")
  }

  function closePicker() {
    setStep(selectedItemId !== null ? "ready" : "idle")
  }

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

    // Fetch results snapshot for the topic
    if (topicId) {
      const supabase = createClient()
      const { data: items } = await supabase
        .from("topic_items")
        .select("label, all_time_pledged")
        .eq("topic_id", topicId)
        .order("all_time_pledged", { ascending: false })
        .limit(5)

      if (items && items.length > 0) {
        const max = (items[0].all_time_pledged as number) ?? 1
        setResults(
          items.map((item) => {
            const pledged = (item.all_time_pledged as number) ?? 0
            return {
              label: item.label as string,
              amountPence: Math.round(pledged * 100),
              widthPercent: max > 0 ? Math.round((pledged / max) * 100) : 0,
            }
          })
        )
      }
    }

    setClientSecret(null)
    setStep("pledged")
  }

  function closePayment() {
    setClientSecret(null)
    setStep("ready")
  }

  return {
    selectedItemId,
    selectedItemLabel,
    amount,
    step,
    clientSecret,
    results,
    error,
    openPicker,
    closePicker,
    selectItem,
    selectAmount,
    initPayment,
    onPaymentSuccess,
    closePayment,
  }
}
