import { useCallback, useEffect, useRef, useState } from "react"

type UsePollSectionOptions = {
  pollId: string
  hasPledged: boolean
  isClosed: boolean
  onSelectionsChange: (pollId: string, selectedIds: string[]) => void
}

export function usePollSection({
  pollId,
  hasPledged,
  isClosed,
  onSelectionsChange,
}: UsePollSectionOptions) {
  const [view, setView] = useState<"pledge" | "results">(
    hasPledged || isClosed ? "results" : "pledge"
  )
  const [rankingView, setRankingView] = useState<"amount" | "count">("amount")

  // Flip to results when hasPledged transitions false → true (payment completed).
  // Ref-based to avoid reacting on every render.
  const prevHasPledged = useRef(hasPledged)
  useEffect(() => {
    if (!prevHasPledged.current && hasPledged) setView("results")
    prevHasPledged.current = hasPledged
  }, [hasPledged])

  const handleSelectionsChange = useCallback(
    (selectedIds: string[]) => onSelectionsChange(pollId, selectedIds),
    [pollId, onSelectionsChange]
  )

  return {
    view,
    setView,
    rankingView,
    setRankingView,
    handleSelectionsChange,
  }
}
