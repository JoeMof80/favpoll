import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import {
  PickHint,
  PledgeHint,
  RankHint,
} from "@/components/landing/how-it-works-hints"

// One per beat, in order. Structural rather than editorial — every register
// picks a topic, pledges and sees a standing, so all three show the same
// three things and only the words differ. A page can still override per
// step if a register ever needs its own.
const DEFAULT_MEDIA = [
  <PickHint key="pick" />,
  <PledgeHint key="pledge" />,
  <RankHint key="rank" />,
]

/**
 * The register pages' numbered "How it works" band.
 *
 * The three were structurally IDENTICAL — same section id and scroll
 * margin, same eyebrow, same three-column ordered list, same numbered
 * label over a muted body — and had drifted apart in the only two places
 * they could: /memorials carried the home page's panel grammar (max-w-330,
 * left-aligned) while /celebrations and /fundraisers still had max-w-5xl
 * and a centred eyebrow. Extracted 2026-08-26 so the next layout change
 * happens once rather than three-times-minus-whichever-was-forgotten.
 *
 * COPY STAYS WITH THE PAGES (founder, 2026-08-26: keep the per-register
 * flavour). Each page passes its own strings — the memorial's "The family
 * picks…" and the celebration's "Pick one topic" are different on purpose.
 * Steps arrive as props rather than being looked up from a register key,
 * because `t()` is statically typed at the call site (see LandingHero's
 * copy-override props); a component that resolved keys itself would give
 * that up.
 *
 * This does NOT deduplicate the words, so it cannot catch copy drift —
 * only layout drift. The three sets still need reading together.
 *
 * A MINIATURE OF THE HOME PAGE'S HOW IT WORKS (founder, 2026-08-27): each
 * beat carries a small vignette of the thing itself — the topic dialog, the
 * pledge dialog, the reveal. It borrows home's medium-per-beat idea and NOT
 * its scroll-pinning: home tells the seven-beat guest journey at length,
 * this tells three beats at a glance. Media is structural, so it lives here
 * and every register gets the same three; only the words differ.
 *
 * lg:grid-cols-3, NOT md: (founder, 2026-08-27). Three columns at 768px
 * gives each 229px, and a dialog rendered 229px wide is a sliver, not an
 * illustration. Stacking on tablets costs a taller section and is the right
 * trade.
 */
export function HowItWorksSteps({
  title,
  steps,
}: {
  title: string
  steps: { label: string; body: string; media?: React.ReactNode }[]
}) {
  return (
    <section id="how" className="w-full scroll-mt-20">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <SectionEyebrow className="mb-10">{title}</SectionEyebrow>
        {/* SEPARATORS between the beats (founder, 2026-08-27). Padding
            rather than gap, so each rule sits CENTRED between two cells
            instead of hard against the left edge of the second — with a gap
            the border lands on the cell and the whitespace all falls one
            side of it. Horizontal when stacked, vertical from lg. */}
        <ol className="grid gap-10 lg:grid-cols-3">
          {steps.map((step, i) => (
            /* A SECOND COLUMN PER BEAT (founder, 2026-08-27): the words
               on the left, the hint beside them. minmax(0,1fr) on the text
               so IT gives way rather than the page, and the hint sized by
               its own content rather than a share of the track — these are
               chips and bars, and a fixed fraction would either starve the
               text or stretch four chips across nothing. */
            <li key={step.label} className="min-w-0">
              <p className="mb-2 text-sm font-semibold text-primary">
                {i + 1}. {step.label}
              </p>
              {/* The second column only from xl. At lg the three beats are
                  already sharing 1320px, so splitting each again left the
                  text at 155px — about twenty characters a line. Below xl
                  the hint drops under its own paragraph instead. */}
              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-0">
                <p className="leading-relaxed text-muted-foreground xl:pr-6">
                  {step.body}
                </p>
                {/* A rule between the words and the hint (founder,
                    2026-08-27) — vertical once they sit side by side,
                    horizontal while stacked. Padding rather than gap on the
                    xl side, so the rule sits between two equal margins
                    instead of hard against the hint.
                    The comment lives OUTSIDE the && : a JSX comment beside
                    an element inside one expression is two roots, which is
                    a parse error tsc does not catch. Third time tonight. */}
                {(step.media ?? DEFAULT_MEDIA[i]) && (
                  <div className="w-48 shrink-0 border-t border-border pt-5 xl:border-t-0 xl:border-l xl:pt-0 xl:pl-6">
                    {step.media ?? DEFAULT_MEDIA[i]}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
