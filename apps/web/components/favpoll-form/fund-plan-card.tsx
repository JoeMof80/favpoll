"use client"

// Create-mode shared-fund card: lets the organiser stage a seed amount from
// the preview's right column. Payment still happens post-publish in
// SeedFundModal (it needs the favpoll id for the Stripe metadata) — this
// pre-fills it.
import { useState } from "react"
import { Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { formatCurrency, MARKET_DEFAULTS } from "@/lib/i18n"

const PRESETS = [10, 25, 50]

type Props = {
  plannedSeed: number | null
  onChange: (amount: number | null) => void
}

export function FundPlanCard({ plannedSeed, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")

  function openOverlay() {
    setDraft(plannedSeed ? String(plannedSeed) : "")
    setOpen(true)
  }

  const numeric = parseFloat(draft)
  const isValid = !isNaN(numeric) && numeric > 0

  function save() {
    onChange(isValid ? numeric : null)
    setOpen(false)
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-background px-5 py-4">
        <p className="mt-1 text-sm text-muted-foreground">
          {plannedSeed ? (
            <>
              <b className="text-foreground">
                {formatCurrency(plannedSeed, MARKET_DEFAULTS["en-GB"])}
              </b>{" "}
              will be added to the shared fund when you publish.
            </>
          ) : (
            <>
              The shared fund lets guests pledge even if they can't pay — you
              can give it a head start.
            </>
          )}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 flex w-full"
          onClick={openOverlay}
        >
          <Gift data-icon="inline-start" aria-hidden="true" />
          {plannedSeed ? "Change amount" : "Add to the shared fund"}
        </Button>
      </div>

      <ResponsiveOverlay
        open={open}
        onOpenChange={setOpen}
        title="Give guests a head start"
        description="Choose an amount now — you'll be asked to pay when you publish."
        footer={
          <div className="flex w-full items-center justify-between gap-2">
            {plannedSeed ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground"
                onClick={() => {
                  onChange(null)
                  setOpen(false)
                }}
              >
                Remove
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
              aria-label="Amount in pounds"
              className="w-full border-0 bg-transparent text-3xl text-foreground outline-none placeholder:text-muted-foreground/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>
      </ResponsiveOverlay>
    </>
  )
}
