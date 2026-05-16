import { useCallback, useEffect, useRef, useState } from "react"

type UsePollSectionOptions = {
  pollId: string
  hasPledged: boolean
  isClosed: boolean
  pledgeJustConfirmed?: boolean
  onSelectionsChange: (pollId: string, selectedIds: string[]) => void
}

export function usePollSection({
  pollId,
  hasPledged,
  isClosed,
  pledgeJustConfirmed,
  onSelectionsChange,
}: UsePollSectionOptions) {
  const [view, setView] = useState<"pledge" | "results">(
    hasPledged || isClosed ? "results" : "pledge"
  )
  const [rankingView, setRankingView] = useState<"amount" | "count">("amount")
  const [pledgeConfirmed, setPledgeConfirmed] = useState(hasPledged)
  const [showRankings, setShowRankings] = useState(true)

  // Single ref to ensure reveal fires at most once
  const revealed = useRef(false)

  // Primary signal: fires immediately after savePledge() resolves (guests + signed-in)
  useEffect(() => {
    if (!revealed.current && pledgeJustConfirmed) {
      revealed.current = true
      setView("results")
      setPledgeConfirmed(true)
      setShowRankings(false)
      const t = setTimeout(() => setShowRankings(true), 300)
      return () => clearTimeout(t)
    }
  }, [pledgeJustConfirmed])

  // Fallback: fires when hasPledged transitions false → true (signed-in, after router.refresh)
  const prevHasPledged = useRef(hasPledged)
  useEffect(() => {
    if (!prevHasPledged.current && hasPledged && !revealed.current) {
      revealed.current = true
      setView("results")
      setPledgeConfirmed(true)
      setShowRankings(false)
      const t = setTimeout(() => setShowRankings(true), 300)
      return () => clearTimeout(t)
    }
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
    pledgeConfirmed,
    showRankings,
    handleSelectionsChange,
  }
}
