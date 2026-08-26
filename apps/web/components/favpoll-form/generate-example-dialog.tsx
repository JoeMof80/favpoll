"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { occasionsForRegister, type OccasionSpec } from "@/lib/occasions"
import { deriveRegister } from "@/lib/registers"
import { cn } from "@/lib/utils"
import type {
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
} from "@favpoll/types"

export type WhoValue = "he" | "she" | "they" | "couple" | "group" | "cause"

export function groupingForWho(who: WhoValue | ""): FavpollGrouping {
  return who === "couple" ? "couple" : who === "group" ? "group" : "individual"
}

/**
 * Cause is an answer to "who is this for?", not a pronoun — it is the
 * answer that says NO ONE. It moved here from the wizard's type step
 * (founder, 2026-08-25), where it sat beside Celebration / Memorial /
 * Fundraiser as if subject and kind were one axis. They are not: a
 * marathon runner is a person AND a fundraiser.
 */
export function subjectForWho(who: WhoValue | ""): FavpollSubject {
  return who === "cause" ? "cause" : "someone"
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
 * picks the who (He/She/They/Pair/Group, or Cause), step 2 the occasion —
 * the who narrows the occasion list, so the ordering is structural.
 * Selecting an occasion (or "No occasion") generates immediately; Done is
 * the escape hatch that closes without generating, like the wizard
 * pickers. Cause is one of the who answers rather than a reason to skip
 * the step (2026-08-25); it narrows step 2 to the cause occasions.
 *
 * Chrome follows the pledge-dialog grammar: per-step title carries the
 * question, close button hidden, search as a transparent header input,
 * footer/top-bar carry the navigation.
 *
 * Selections are remembered between opens (the parent owns them), so a
 * re-roll with the same settings is tap-tap.
 */
export function GenerateExampleDialog({
  open,
  onOpenChange,
  category,
  who,
  occasion,
  onGenerate,
  onSubjectChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: FavpollCategory | null | undefined
  /** Current who selection, "" when none yet. Carries the subject: "cause". */
  who: WhoValue | ""
  occasion: OccasionSpec | null
  onGenerate: (who: WhoValue | null, occasion: OccasionSpec | null) => void
  /**
   * Commits the SUBJECT the moment it is picked, before any generation.
   *
   * Everything else in this dialog is generation metadata and waits for
   * onGenerate — but subject is not: it decides whether a protagonist
   * exists, and routes the organiser's one "about" box into
   * protagonists.about or events.description. Left to onGenerate, the
   * only way to declare a cause would be to run a generation, which
   * would also overwrite the name, about and reveal with example copy.
   */
  onSubjectChange: (subject: FavpollSubject) => void
}) {
  const [step, setStep] = useState<1 | 2>(1)
  const [localWho, setLocalWho] = useState<WhoValue | "">(who)
  const [search, setSearch] = useState("")

  // Re-opening starts from the top with the previous selections shown.
  //
  // Fires on the OPEN TRANSITION only. `who` is derived from form state
  // that this dialog now writes (subject commits on click), so resetting
  // whenever it changed sent the dialog back to step 1 the instant Cause
  // was picked — the selection landed and the step bounced back.
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open && !wasOpen.current) {
      setStep(1)
      setLocalWho(who)
      setSearch("")
    }
    wasOpen.current = open
  }, [open, who])

  // The local selection, not the `subject` prop: picking Cause on step 1
  // must switch step 2 to the cause occasions (Fundraiser, Sponsored
  // event, Charity night, In memoriam appeal) before anything is saved.
  const localSubject = subjectForWho(localWho)
  const register = deriveRegister(
    category ?? null,
    groupingForWho(localWho),
    localSubject
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
    // Structural, so it lands now — see onSubjectChange. Done can then
    // close the dialog with the subject set and nothing generated.
    const nextSubject = subjectForWho(value)
    if (nextSubject !== subjectForWho(localWho)) onSubjectChange(nextSubject)
  }

  function handleOccasion(spec: OccasionSpec | null) {
    onGenerate(localWho === "" ? null : (localWho as WhoValue), spec)
    close()
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title={step === 1 ? "Who is this favpoll for?" : "Pick an occasion"}
      hideCloseButton
      headerClassName={step === 2 ? "px-5 pt-4 pb-2" : undefined}
      bodyClassName="p-0"
      dialogContentClassName="flex-1 overflow-y-auto"
      fullscreenOnMobile
      mobileBack={
        step === 2 ? { label: "Back", onClick: () => setStep(1) } : undefined
      }
      mobileSave={{ label: "Done", onClick: close }}
      header={
        step === 2 ? (
          <input
            type="text"
            autoFocus
            placeholder="Search occasions…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/50"
          />
        ) : undefined
      }
      footer={
        <div className="flex gap-2">
          {step === 2 ? (
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              ← Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={close}
            >
              Cancel
            </Button>
          )}
          <Button type="button" className="flex-1" onClick={close}>
            Done
          </Button>
        </div>
      }
    >
      {step === 1 ? (
        <div className="px-5 pt-1 pb-4">
          {/* Five who-chips, a separator, then Cause. Cause is a different
              axis — the answer that says no one — so it does not sit flush
              as a sixth chip. Same grammar the wizard's type step used to
              carry, moved here with it (founder, 2026-08-25). */}
          <div className="flex flex-wrap items-center gap-1.5">
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
            <span
              className="px-1 text-xs font-medium tracking-widest text-muted-foreground uppercase"
              aria-hidden="true"
            >
              or
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-pressed={localWho === "cause"}
              onClick={() => handleWho("cause")}
              className={cn(localWho === "cause" ? CHIP_ON : CHIP_OFF)}
            >
              Cause
            </Button>
          </div>
          <p className="pt-3 text-[11px] text-muted-foreground">
            Examples are starting points — everything published is yours to
            edit.
          </p>
        </div>
      ) : (
        // min-h floor: searching filters the chips down and the sheet
        // would otherwise sink behind the iOS keyboard (pledge picker
        // precedent).
        <div className="min-h-80 px-5 pt-1 pb-4">
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
          <p className="pt-3 text-[11px] text-muted-foreground">
            Examples are starting points — everything published is yours to
            edit.
          </p>
        </div>
      )}
    </ResponsiveOverlay>
  )
}
