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
        {/* as="h2" matches the home page's How It Works exactly: the same
            SectionEyebrow rendered as a heading rather than its default
            paragraph, and the right element for a section title the page
            outline should carry. */}
        <SectionEyebrow as="h2" className="mb-10">
          {title}
        </SectionEyebrow>
        <ol className="grid gap-10 lg:grid-cols-3">
          {steps.map((step, i) => (
            /* A SECOND COLUMN PER BEAT (founder, 2026-08-27): the words
               on the left, the hint beside them. minmax(0,1fr) on the text
               so IT gives way rather than the page, and the hint sized by
               its own content rather than a share of the track — these are
               chips and bars, and a fixed fraction would either starve the
               text or stretch four chips across nothing. */
            /* NO RULES ANYWHERE IN THIS BAND (founder, 2026-08-27, ending
               a day that tried all three positions). They sat between each
               beat's words and its hint first, which divided the wrong
               thing: those two are ONE statement said twice, once in prose
               and once in the product's own controls, and a rule there
               argued they were two. Moving them between the beats divided
               the right thing but cost the layout — a rule needs padding
               beside it, and padding only the second and third columns left
               the first 40px wider, so the same sentence set four lines
               there and five next to it.

               And nothing needed dividing. The beats are already numbered,
               already headed in tracked uppercase, already 40px apart. A
               rule was drawing a seam the numbering had drawn better. */
            <li key={step.label} className="min-w-0">
              {/* The second column only from xl. At lg the three beats are
                  already sharing 1320px, so splitting each again left the
                  text at 155px — about twenty characters a line. Below xl
                  the hint drops under its own paragraph instead. */}
              <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:gap-0">
                {/* The numbered label lives IN the left column with its
                    own body (founder, 2026-08-27), not spanning above both.
                    Spanning, the rule beside the hint began below it and the
                    label floated free of the pair it heads. */}
                <div className="min-w-0 xl:pr-6">
                  {/* The home page's beat-label style, to the class:
                      text-sm font-medium tracking-widest text-primary
                      uppercase. This band is meant to read as a miniature
                      of that section, so the labels have to be the same
                      thing at a smaller scale — not a different treatment
                      wearing the same words. */}
                  <p className="mb-2 text-sm font-medium tracking-widest text-primary uppercase">
                    {i + 1}. {step.label}
                  </p>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                </div>
                {/* NO RULE HERE any more — see the note on the <li>. The
                    padding stays: it is what keeps the hint off the prose
                    once the two sit side by side at xl.
                    The comment lives OUTSIDE the && : a JSX comment beside
                    an element inside one expression is two roots, which is
                    a parse error tsc does not catch. Third time tonight. */}
                {(step.media ?? DEFAULT_MEDIA[i]) && (
                  <div className="w-48 shrink-0 pt-5 xl:pt-0 xl:pl-6">
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
