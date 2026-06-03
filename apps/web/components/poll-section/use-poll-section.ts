import { useCallback, useEffect, useRef, useState } from "react"

type UsePollSectionOptions = {
  pollId: string
  hasPledged: boolean
  isClosed: boolean
  pledgeJustConfirmed?: boolean
  onSelectionsChange: (pollId: string, selectedIds: string[]) => void
  onViewChange?: (view: "pledge" | "results") => void
}

export function usePollSection({
  pollId,
  hasPledged,
  isClosed,
  pledgeJustConfirmed,
  onSelectionsChange,
  onViewChange,
}: UsePollSectionOptions) {
  const initialView = hasPledged || isClosed ? "results" : "pledge"
  const [view, setView] = useState<"pledge" | "results">(initialView)
  const [rankingView, setRankingView] = useState<"amount" | "count">("amount")
  const [pledgeConfirmed, setPledgeConfirmed] = useState(hasPledged)
  const [showRankings, setShowRankings] = useState(true)

  // Notify parent of initial view
  const notifiedInitial = useRef(false)
  useEffect(() => {
    if (!notifiedInitial.current) {
      notifiedInitial.current = true
      onViewChange?.(initialView)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Single ref to ensure reveal fires at most once
  const revealed = useRef(false)

  // Primary signal: fires immediately after savePledge() resolves (guests + signed-in)
  useEffect(() => {
    if (!revealed.current && pledgeJustConfirmed) {
      revealed.current = true
      setView("results")
      onViewChange?.("results")
      setPledgeConfirmed(true)
      setShowRankings(false)
      const t = setTimeout(() => setShowRankings(true), 300)
      return () => clearTimeout(t)
    }
  }, [pledgeJustConfirmed, onViewChange])

  // Fallback: fires when hasPledged transitions false → true (signed-in, after router.refresh)
  const prevHasPledged = useRef(hasPledged)
  useEffect(() => {
    if (!prevHasPledged.current && hasPledged && !revealed.current) {
      revealed.current = true
      setView("results")
      onViewChange?.("results")
      setPledgeConfirmed(true)
      setShowRankings(false)
      const t = setTimeout(() => setShowRankings(true), 300)
      return () => clearTimeout(t)
    }
    prevHasPledged.current = hasPledged
  }, [hasPledged, onViewChange])

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
