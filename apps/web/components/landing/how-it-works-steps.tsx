import { SectionEyebrow } from "@/components/ui/section-eyebrow"

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
 */
export function HowItWorksSteps({
  title,
  steps,
}: {
  title: string
  steps: { label: string; body: string }[]
}) {
  return (
    <section id="how" className="w-full scroll-mt-20">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <SectionEyebrow className="mb-10">{title}</SectionEyebrow>
        <ol className="grid gap-10 md:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step.label}>
              <p className="mb-2 text-sm font-semibold text-primary">
                {i + 1}. {step.label}
              </p>
              <p className="leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
