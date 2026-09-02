"use client"

import {
  BookOpen,
  Calendar,
  Check,
  Gift,
  Settings2,
  Shapes,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Charity } from "@favpoll/types"
import { STEPS, STEP_LABELS, type WizardStep } from "@/lib/wizard-copy"

// Concrete objects where one exists — a calendar, a gift, an assortment,
// a person, a book; Settings wears its own glyph. The rail tracks the answers
// as they accumulate (extended-wizard prototype, round 25): each step
// shows a tick once its content is in, and the chosen thing itself as a
// one-line summary beneath the label.
export const STEP_ICONS: Record<WizardStep, React.ElementType> = {
  event: Calendar,
  charity: Gift,
  topic: Shapes,
  info: UserRound,
  story: BookOpen,
  details: Settings2,
}

type Props = {
  currentStep: WizardStep
  summary: Record<WizardStep, string>
  done: Record<WizardStep, boolean>
  /** Chosen charities — up to three avatar chips on the Charity line
   * (option B, founder, 2026-09-02: the favpoll visibly assembling). */
  charities?: Charity[]
  /** The protagonist photo (or its crop preview) — a thumb on the
   * Header line. */
  photoUrl?: string | null
  /** Entries the canJump gate allows become buttons that jump to their step. */
  onStepClick?: (step: WizardStep) => void
  /** Which steps a click may open (create mode: passed steps only). */
  canJump?: (step: WizardStep) => boolean
}

export function WizardStepRail({
  currentStep,
  summary,
  done,
  charities,
  photoUrl,
  onStepClick,
  canJump,
}: Props) {
  return (
    <div className="hidden h-full flex-col gap-6 bg-primary/10 p-6 md:flex">
      <div className="flex flex-1 flex-col justify-around gap-5">
        {STEPS.map((s) => {
          const Icon = STEP_ICONS[s]
          const isActive = s === currentStep
          const chips = s === "charity" ? (charities ?? []).slice(0, 3) : []
          const photoChip = s === "info" ? (photoUrl ?? null) : null
          const hasContent = !!summary[s] || chips.length > 0 || !!photoChip
          const clickable = !!onStepClick && (canJump ? canJump(s) : true)
          const Entry = clickable ? "button" : "div"
          return (
            <Entry
              key={s}
              {...(clickable
                ? { type: "button" as const, onClick: () => onStepClick?.(s) }
                : {})}
              className={cn(
                "min-w-0 space-y-1 text-left transition-opacity",
                isActive || done[s] ? "opacity-100" : "opacity-60",
                clickable && "cursor-pointer hover:opacity-100"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <p
                  className={cn(
                    "text-base font-medium tracking-widest uppercase",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {STEP_LABELS[s]}
                </p>
                {done[s] && (
                  <Check
                    aria-label="Done"
                    className="h-4 w-4 shrink-0 text-primary"
                  />
                )}
              </div>
              {/* Always rendered — an empty summary keeps its line so the
                  rail never reflows as answers accumulate (justify-around
                  would otherwise redistribute every entry). Chips are h-5,
                  matching the text-sm line box, so the invariant holds
                  with or without them. */}
              <div
                className={cn(
                  "flex min-h-5 items-center gap-1.5 pl-7.5",
                  !hasContent && "invisible"
                )}
              >
                {photoChip && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoChip}
                    alt=""
                    className="h-5 w-5 shrink-0 rounded object-cover"
                  />
                )}
                {chips.map((c) =>
                  c.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={c.id}
                      src={c.logo_url}
                      alt=""
                      className="h-5 w-5 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <span
                      key={c.id}
                      aria-hidden="true"
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary/15 text-[10px] font-medium text-primary"
                    >
                      {c.name.charAt(0)}
                    </span>
                  )
                )}
                <p
                  title={summary[s] || undefined}
                  className="truncate text-sm text-muted-foreground"
                >
                  {summary[s] || " "}
                </p>
              </div>
            </Entry>
          )
        })}
      </div>
    </div>
  )
}
