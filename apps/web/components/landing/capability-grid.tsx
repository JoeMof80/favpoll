import Link from "next/link"
import {
  FileHeart,
  HeartHandshake,
  ListChecks,
  QrCode,
  Quote,
  Target,
  Tv,
  Users,
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

const CAPABILITIES: {
  key: string
  icon: typeof Tv
}[] = [
  { key: "display", icon: Tv },
  { key: "reveal", icon: Quote },
  { key: "topics", icon: ListChecks },
  { key: "cards", icon: QrCode },
  { key: "fund", icon: HeartHandshake },
  { key: "goal", icon: Target },
  { key: "wall", icon: Users },
  // Keepsake rather than the record (founder, 2026-08-08): the record is
  // unshipped and would need a Coming soon label on a list of things you
  // can have today. The keepsake exists — a single A4 sheet of the day.
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
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <div key={c.key} className="flex flex-col">
              {/* HowItWorksThreeBeat's header grammar — icon beside the label,
                  primary, uppercase, tracking-widest — at text-base rather
                  than its text-lg, which wraps at four columns. */}
              <div className="mb-3 flex items-center gap-2.5">
                <c.icon className="h-6 w-6 shrink-0 text-primary" />
                <h3 className="text-base font-medium tracking-widest text-primary uppercase">
                  {t(`home.capability.${c.key}.name` as never)}
                </h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t(`home.capability.${c.key}.line` as never)}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground italic">
                {t(`home.capability.${c.key}.range` as never)}
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <Link
            href="/features"
            className="text-base font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("home.capability.link" as never)}
          </Link>
          <p className="text-sm text-muted-foreground italic">
            {t("home.capability.norules" as never)}
          </p>
        </div>
      </div>
    </section>
  )
}
