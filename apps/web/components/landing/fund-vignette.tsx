import { Button } from "@/components/ui/button"
import { Vignette } from "@/components/landing/vignette"

// THE shared fund dialog — SeedFundModal in its guest variant, the one a
// guest opens to put money in the pot for somebody else.
//
// It showed StepAmount's split row before (founder, 2026-08-09): the control
// for moving part of your OWN pledge across. That is a shared-fund feature
// but it is not the shared fund dialog, and the section is about the fund
// itself — a thing anyone can top up, that a guest with no means draws on.
//
// Mirrored rather than mounted, the way TopicPickerVignette mirrors the two
// topic dialogs: SeedFundModal wants a favpoll id, hits the payment-intent
// route and renders through a portal. The copy and the controls here are its
// own, to the word.
//
// A STILL (founder, 2026-09-03, extending the standing "i'm not sure there
// is any need to animate these vignettes"): the dialog as it stands with
// £25 picked and the primary lit — the press-loop deleted rather than
// propped, because /features is this vignette's only consumer. No longer a
// client component: nothing here needs a browser.

const PRESETS = [10, 25, 50] as const
const PICKED = 25

export function FundVignette() {
  return (
    <Vignette>
      {/* ResponsiveOverlay's dialog shape at sm and up: sm:max-w-lg, a title
          row, then the body. */}
      <div className="mx-auto max-w-lg rounded-xl border border-border bg-background p-5 shadow-lg">
        <p className="text-lg font-semibold tracking-tight text-foreground">
          Add to the shared fund
        </p>

        {/* Amount field — £ beside a borderless number input, as the dialog
            has it. */}
        <div className="flex items-baseline gap-1.5 py-4">
          <span className="text-2xl text-muted-foreground select-none">£</span>
          <span className="text-3xl text-foreground">{PICKED}</span>
        </div>

        <div className="flex gap-2">
          {PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              // The picked preset wears the pressed state — £25 is where
              // the amount above came from (founder, 2026-09-03).
              variant={preset === PICKED ? "default" : "outline"}
              className="flex-1"
            >
              £{preset}
            </Button>
          ))}
        </div>

        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Not everybody is in a position to pledge money of their own. The
          shared fund is a float that helps them take part. Any money left in
          the shared fund goes to the charity.
        </p>

        {/* The dialog's footer: the primary is enabled because an amount is
            in — the state a guest is one click from giving. */}
        <div className="mt-5 flex flex-col gap-3">
          <Button type="button" className="w-full">
            Add to fund
          </Button>
          <Button type="button" variant="ghost" className="w-full">
            No thanks
          </Button>
        </div>
      </div>
    </Vignette>
  )
}
