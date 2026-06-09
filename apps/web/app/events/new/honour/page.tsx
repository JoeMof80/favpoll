"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FlowShell } from "@/components/event-flow/flow-shell"
import { HonourStep } from "@/components/event-flow/honour-step"

function HonourPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [state, setState] = useState({
    occasionType: searchParams.get("occasionType") ?? "",
    isPlural: searchParams.get("isPlural") === "true",
  })

  function handleNext() {
    const params = new URLSearchParams({
      occasionType: state.occasionType,
      isPlural: String(state.isPlural),
    })
    router.push(`/events/new/love?${params}`)
  }

  return (
    <FlowShell
      step={1}
      title="Choose the occasion"
      nextDisabled={!state.occasionType}
      onNext={handleNext}
    >
      <HonourStep value={state} onChange={setState} />
    </FlowShell>
  )
}

export default function HonourPage() {
  return (
    <Suspense>
      <HonourPageInner />
    </Suspense>
  )
}
