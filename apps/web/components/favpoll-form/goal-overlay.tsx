"use client"

// Overlay for the optional pledge goal, opened from CharityBanner's edit
// affordance in the form's right column. A form field like any other:
// staged in create mode (written by createFavpoll at publish), saved by the
// FAB in edit mode (written by updateFavpoll). Mirrors SeedFundModal's
// layout: amount field first, presets below, stacked full-width footer
// buttons.
import { useEffect, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import type { FavpollFormValues } from "./schema"

const PRESETS = [100, 250, 500]

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoalOverlay({ open, onOpenChange }: Props) {
  const form = useFormContext<FavpollFormValues>()
  const goalAmount = useWatch({ control: form.control, name: "goalAmount" })
  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (open) setDraft(goalAmount ? String(goalAmount) : "")
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const numeric = parseFloat(draft)
  const isValid = !isNaN(numeric) && numeric > 0

  function save() {
    form.setValue("goalAmount", isValid ? numeric : undefined, {
      shouldDirty: true,
    })
    onOpenChange(false)
  }

  function remove() {
    form.setValue("goalAmount", undefined, { shouldDirty: true })
    onOpenChange(false)
  }

  const footer = (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className="w-full"
        disabled={!isValid}
        onClick={save}
      >
        {goalAmount ? "Save goal" : "Set goal"}
      </Button>
      {goalAmount ? (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={remove}
        >
          Remove goal
        </Button>
      ) : (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => onOpenChange(false)}
        >
          Not now
        </Button>
      )}
    </div>
  )

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Set a pledge goal"
      dialogClassName="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      dialogContentClassName="flex-1 overflow-y-auto px-5 pt-0 pb-2"
      footer={footer}
    >
      {/* Amount field */}
      <div className="flex items-baseline gap-1.5 py-4">
        <span
          className="text-2xl text-muted-foreground select-none"
          aria-hidden="true"
        >
          £
        </span>
        <input
          id="goal-amount"
          type="number"
          min="1"
          step="1"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="0"
          aria-label="Goal amount in pounds"
          className="w-full border-0 bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>

      {/* Preset buttons */}
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => setDraft(String(preset))}
          >
            £{preset}
          </Button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        Optional — shown to guests as understated progress, never as pressure.
      </p>
    </ResponsiveOverlay>
  )
}
