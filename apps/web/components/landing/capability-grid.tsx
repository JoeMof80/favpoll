import Link from "next/link"
import {
  FileHeart,
  HeartHandshake,
  MessageCircleQuestion,
  QrCode,
  Quote,
  Tv,
} from "lucide-react"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"

// The homepage's capability trailer, replacing the feature × register matrix
// (founder, 2026-08-08, after six prototyped shapes).
//
// WHY THE MATRIX WENT. Its own caption said "no rules, every favpoll can use
// every feature" — but a matrix is a form for showing that some cells are
// better than others, so the muted cells read as switched off. Every attempt
// to fix that by changing the differentiator (weight, row count, prose,
// volume, what-leads) failed the same way: each had to dramatise a difference
// between registers that does not really exist.
//
// WHAT CHANGED THE ANSWER. /features now exists, so this section stopped
// being the capability REFERENCE and became the trailer. That let the axis
// invert: features are the SUBJECT and the register is a modifier on each —
// one italic line showing the range instead of a column tabulating it. It is
// still the only place on the homepage where a single feature is named, which
// is why cutting the section outright would have been wrong.
//
// Copy lives in messages/en-GB.json, per the landing-page convention.

// SIX, not eight (founder, 2026-08-08). Pledge goal and Guest wall left for
// /features: this section is the TRAILER, and a target and a donor feed are
// what any giving platform has — standard features dilute a trailer. They
// stay on the reference page for the opposite reason, since an evaluator
// scanning for the expected reads absence as absence.
//
// Three columns rather than four: wider cards stop the longer bullets
// wrapping to two lines, which is what made the rows uneven.
const CAPABILITIES: {
  key: string
  icon: typeof Tv
}[] = [
  // Ordered by when each one happens, and the two rows are the two phases —
  // no labels needed, the break does the work. Row 1 is what the organiser
  // puts in place before anyone arrives; row 2 is what happens to a guest and
  // what is left afterwards. The previous order was inherited from the
  // matrix's array and chosen by nobody.
  { key: "topics", icon: MessageCircleQuestion },
  { key: "cards", icon: QrCode },
  { key: "display", icon: Tv },
  { key: "fund", icon: HeartHandshake },
  { key: "reveal", icon: Quote },
  { key: "keepsake", icon: FileHeart },
]

export function CapabilityGrid() {
  return (
    <section className="w-full bg-primary/5">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        {/* Eyebrow only, no heading (founder, 2026-08-08): the heading was
            arguing a point eight labelled capabilities underneath already
            prove, and the page had one section too many doing that. Rendered
            as the h2 so the item headings below do not skip a level. */}
        <SectionEyebrow as="h2" className="mb-10">
          {t("home.capability.eyebrow" as never)}
        </SectionEyebrow>
        {/* No card chrome: bordered boxes on a tinted band read as buttons,
            and these are not links — the section has one, at the bottom. */}
        {/* SUBGRID (2026-08-08). Each card spans three of the parent's row
            tracks — header, sentence, examples — so all three align across a
            row however the copy wraps. mt-auto alone was not enough: it
            bottom-anchors the list, so a card whose bullets wrap to two lines
            each (Custom topics) grew UPWARDS and its first bullet started a
            line above its neighbours'. Bottoms matched, tops drifted. */}
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div
              key={c.key}
              className="row-span-3 grid grid-rows-subgrid gap-y-3"
            >
              {/* HowItWorksThreeBeat's header grammar — icon beside the label,
                  primary, uppercase, tracking-widest — at text-base rather
                  than its text-lg, which wraps at four columns. */}
              <div className="flex items-center gap-2.5">
                <c.icon className="h-6 w-6 shrink-0 text-primary" />
                <h3 className="text-base font-medium tracking-widest text-primary uppercase">
                  {t(`home.capability.${c.key}.name` as never)}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`home.capability.${c.key}.line` as never)}
              </p>
              {/* Two examples per capability, spanning the registers — the
                  quiet use and the loud one. They replaced a single italic
                  "range" line (founder rewrite, 2026-08-08): one sentence
                  trying to hold both ends read as a formula, and every one of
                  the eight had the same shape. */}
              <ul className="list-disc space-y-1 pl-4 text-sm leading-relaxed text-muted-foreground marker:text-primary-muted">
                <li>{t(`home.capability.${c.key}.b1` as never)}</li>
                <li>{t(`home.capability.${c.key}.b2` as never)}</li>
              </ul>
            </div>
          ))}
        </div>
        {/* The no-rules line went with the matrix (2026-08-08). It was
            insurance against a grid that implied some features belonged to
            some registers; this one gates nothing, so the disclaimer read as
            an answer to a question nobody had asked. */}
        <div className="mt-10">
          <Link
            href="/features"
            className="text-base font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("home.capability.link" as never)}
          </Link>
        </div>
      </div>
    </section>
  )
}
