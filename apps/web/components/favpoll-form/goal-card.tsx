"use client"

// Right-column card for the optional pledge goal. A form field like any
// other: staged in create mode (written by createFavpoll at publish), saved
// by the FAB in edit mode (written by updateFavpoll).
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import type { FavpollFormValues } from "./schema"

const PRESETS = [100, 250, 500]

const GBP = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 0,
})

export function GoalCard() {
  const form = useFormContext<FavpollFormValues>()
  const goalAmount = useWatch({ control: form.control, name: "goalAmount" })
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")

  function openOverlay() {
    setDraft(goalAmount ? String(goalAmount) : "")
    setOpen(true)
  }

  const numeric = parseFloat(draft)
  const isValid = !isNaN(numeric) && numeric > 0

  function save() {
    form.setValue("goalAmount", isValid ? numeric : undefined, {
      shouldDirty: true,
    })
    setOpen(false)
  }

  function remove() {
    form.setValue("goalAmount", undefined, { shouldDirty: true })
    setOpen(false)
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-background px-5 py-4">
        <p className="text-sm text-muted-foreground">
          {goalAmount ? (
            <>
              Goal: <b className="text-foreground">{GBP.format(goalAmount)}</b>{" "}
              — shown as a quiet progress bar for guests.
            </>
          ) : (
            <>A goal gives guests something to rally behind. Optional.</>
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 flex w-full"
          onClick={openOverlay}
        >
          <Target data-icon="inline-start" aria-hidden="true" />
          {goalAmount ? "Change goal" : "Set a goal"}
        </Button>
      </div>

      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title="Set a pledge goal"
        description="Optional — shown to guests as understated progress, never as pressure."
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            {goalAmount ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={remove}
              >
                Remove goal
              </Button>
            ) : (
              <span />
            )}
            <Button type="button" disabled={!isValid} onClick={save}>
              Save
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="flex gap-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                type="button"
                variant={numeric === preset ? "default" : "outline"}
                className="flex-1"
                onClick={() => setDraft(String(preset))}
              >
                £{preset}
              </Button>
            ))}
          </div>
          <div className="flex items-baseline gap-1 border-b border-border pb-2">
            <span className="text-3xl text-muted-foreground">£</span>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="0"
              aria-label="Goal amount in pounds"
              className="w-full border-0 bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </ResponsiveOverlay>
    </>
  )
}
