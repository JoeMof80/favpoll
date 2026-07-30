"use client"

import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { occasionsForRegister, type OccasionSpec } from "@/lib/occasions"
import { deriveRegister } from "@/lib/registers"
import { cn } from "@/lib/utils"
import type { FavpollCategory, FavpollGrouping } from "@favpoll/types"

export type WhoValue = "he" | "she" | "they" | "couple" | "group"

export function groupingForWho(who: WhoValue | ""): FavpollGrouping {
  return who === "couple" ? "couple" : who === "group" ? "group" : "individual"
}

// Word pills, no glyphs (founder, 2026-07-30) — both steps share the
// same chip language.
const WHO_OPTIONS = [
  { value: "he", label: "He" },
  { value: "she", label: "She" },
  { value: "they", label: "They" },
  { value: "couple", label: "Pair" },
  { value: "group", label: "Group" },
] as const

const CHIP_ON =
  "rounded-full border-primary bg-secondary text-secondary-foreground hover:bg-secondary"
const CHIP_OFF = "rounded-full"

/**
 * The Generate control's two-step dialog (founder, 2026-07-30): step 1
 * picks the who (He/She/They/Pair/Group), step 2 the occasion — the who
 * narrows the occasion list, so the ordering is structural. Selecting an
 * occasion (or "No occasion") generates immediately; there is no confirm
 * step. Causes have no who and open straight onto occasions.
 *
 * Selections are remembered between opens (the parent owns them), so a
 * re-roll with the same settings is tap-tap.
 */
export function GenerateExampleDialog({
  open,
  onOpenChange,
  category,
  subject,
  who,
  occasion,
  onGenerate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: FavpollCategory | null | undefined
  subject: "someone" | "cause"
  /** Current who selection, "" when none yet. */
  who: WhoValue | ""
  occasion: OccasionSpec | null
  onGenerate: (who: WhoValue | null, occasion: OccasionSpec | null) => void
}) {
  const isCause = subject === "cause"
  const [step, setStep] = useState<1 | 2>(isCause ? 2 : 1)
  const [localWho, setLocalWho] = useState<WhoValue | "">(who)
  const [search, setSearch] = useState("")

  // Re-opening starts from the top with the previous selections shown.
  useEffect(() => {
    if (!open) return
    setStep(isCause ? 2 : 1)
    setLocalWho(who)
    setSearch("")
  }, [open, isCause, who])

  const register = deriveRegister(
    category ?? null,
    groupingForWho(localWho),
    subject
  )
  const grouping = groupingForWho(localWho)
  const occasions = occasionsForRegister(
    register,
    grouping === "couple" ? "pair" : grouping === "group" ? "group" : undefined
  )

  const trimmed = search.trim().toLowerCase()
  const filtered = trimmed
    ? occasions.filter((o) => o.label.toLowerCase().includes(trimmed))
    : occasions

  function close() {
    onOpenChange(false)
  }

  function handleWho(value: WhoValue) {
    setLocalWho(value)
    setSearch("")
    setStep(2)
  }

  function handleOccasion(spec: OccasionSpec | null) {
    onGenerate(isCause ? null : (localWho as WhoValue), spec)
    close()
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Generate an example"
      dialogContentClassName="flex-1 overflow-y-auto px-5 pb-5"
      fullscreenOnMobile
      mobileBack={
        step === 2 && !isCause
          ? { label: "Back", onClick: () => setStep(1) }
          : { label: "Cancel", onClick: close }
      }
    >
      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-base font-medium">Who is this favpoll for?</p>
          <div className="flex flex-wrap gap-1.5">
            {WHO_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                variant="outline"
                size="sm"
                aria-pressed={localWho === value}
                onClick={() => handleWho(value)}
                className={cn(localWho === value ? CHIP_ON : CHIP_OFF)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {!isCause && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Back"
                onClick={() => setStep(1)}
                className="hidden md:inline-flex"
              >
                <ArrowLeft />
              </Button>
            )}
            <p className="text-base font-medium">What&apos;s the occasion?</p>
          </div>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search occasions…"
            className="md:text-base"
          />
          <div
            className="flex flex-wrap gap-1.5"
            role="listbox"
            aria-label="Occasions"
          >
            {!trimmed && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                role="option"
                aria-selected={occasion === null}
                onClick={() => handleOccasion(null)}
                className={cn(occasion === null ? CHIP_ON : CHIP_OFF)}
              >
                No occasion
              </Button>
            )}
            {filtered.map((spec) => (
              <Button
                key={spec.label}
                type="button"
                variant="outline"
                size="sm"
                role="option"
                aria-selected={occasion?.label === spec.label}
                onClick={() => handleOccasion(spec)}
                className={cn(
                  occasion?.label === spec.label ? CHIP_ON : CHIP_OFF
                )}
              >
                {spec.label}
              </Button>
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="py-3 text-center text-sm text-muted-foreground">
              No occasions match.
            </p>
          )}
        </div>
      )}
    </ResponsiveOverlay>
  )
}
