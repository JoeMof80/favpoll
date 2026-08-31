import { Lock } from "lucide-react"
import { mechanicFooter } from "@/lib/mechanic-steps"

// The inside of the pre-pledge lock card, shared by the REAL guest page
// (poll-section) and the landing demo (hero-demo-panel/demo-card).
//
// Extracted 2026-08-06 because the two had drifted: the guest page showed the
// full teaching card — CTA bar, numbered steps, footer — while the demo showed
// a bare pill, so the landing page advertised a simpler product than the one
// it links to. Steps already came from lib/mechanic-steps (the same source the
// print pack's table cards use); this pulls the PRESENTATION into one place
// too, so the next change lands on both at once.
//
// Content only. The guest page wraps this in a Button with sticky positioning
// and a click handler; the demo wraps it in a static div. Neither concern
// belongs in here.

type Props = {
  /** Numbered instructions from buildMechanicSteps — the shared source. */
  steps: string[]
  /** Topic title, for the shared-fund footer line. */
  topicTitle: string
  /**
   * One universal CTA (founder, 2026-08-02): "reveal X's favourite" as the
   * header made the reveal transactional bait — the quiz-frame again. The
   * action is pledging YOUR favourite; the steps present the reveal as a gift.
   */
  ctaLabel?: string
  /**
   * The list cards' size (founder, 2026-09-01: the shelf cards teach the
   * mechanic too, but a 120px lock zone cannot hold the full card): smaller
   * CTA bar, xs steps, no shared-fund footer — that line waits for the
   * pledge dialog.
   */
  compact?: boolean
}

export function LockCardContent({
  steps,
  topicTitle,
  ctaLabel = "Pledge your favourite",
  compact = false,
}: Props) {
  return (
    <>
      <span
        className={
          compact
            ? "flex items-center justify-center gap-1.5 bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            : "flex items-center justify-center gap-2 bg-primary px-4 py-2.5 text-base font-medium text-primary-foreground"
        }
      >
        <Lock
          className={compact ? "h-3.5 w-3.5" : "h-4 w-4"}
          aria-hidden="true"
        />
        {ctaLabel}
      </span>
      <span
        className={
          compact
            ? "flex flex-col gap-1 px-3 py-2.5 text-left text-xs leading-snug font-normal whitespace-normal text-muted-foreground"
            : "flex flex-col gap-1.5 px-4 py-3 text-left text-sm leading-relaxed font-normal whitespace-normal text-muted-foreground"
        }
      >
        {steps.map((step, i) => (
          <span key={i} className="flex gap-2">
            <span
              className={`shrink-0 text-right font-semibold text-primary ${compact ? "w-3" : "w-4"}`}
            >
              {i + 1}.
            </span>
            <span className="flex-1">{step}</span>
          </span>
        ))}
        {!compact && (
          <span className="pt-1 text-[13px] text-muted-foreground/80">
            {mechanicFooter(topicTitle)}
          </span>
        )}
      </span>
    </>
  )
}
