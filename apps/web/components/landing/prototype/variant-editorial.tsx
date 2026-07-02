// PROTOTYPE — "editorial" variant: magazine-style. Oversized display type,
// the reveal as a pull-quote, big-numeral steps, live favpolls as list rows,
// prose sections. No demo card — the words carry the mechanic.
import Link from "next/link"
import { SCENES } from "@/components/hero-demo-panel/scenes"
import HonourCharityLoveVenn from "@/components/landing/honour-charity-love-venn"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { RankingBar } from "@/components/ui/ranking-bar"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import type { LandingData } from "./types"

const STEPS = [
  [
    "Introduce them",
    "Write about the person being honoured — their story, their occasion — without giving away their answer. The withholding is the point.",
  ],
  [
    "Guests pledge",
    "Each guest shares their own favourite and gives to charity in your person's name. The answer is still unread.",
  ],
  [
    "The reveal",
    "Only now do guests learn what your person loved, and why. Their own voice, their own words — disclosed after the giving.",
  ],
] as const

export function VariantEditorial({
  favpolls,
  recordItems,
  showRecord,
  recordMax,
  charities,
}: LandingData) {
  const exampleReveal = SCENES[0].poll.personal_reveal
  const exampleName = SCENES[0].protagonist.name.split(" ")[0]

  return (
    <main className="flex flex-col">
      {/* ── Opening statement ── */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-330 px-6">
          <SectionEyebrow className="mb-6">
            In memory of someone special
          </SectionEyebrow>
          <h1 className="mb-10 max-w-4xl text-6xl leading-[1.08] font-light tracking-tight text-foreground md:text-7xl">
            {t("landing.headline")}
          </h1>
          <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
            <blockquote className="border-l-[2.5px] border-primary-muted pl-4 text-lg leading-relaxed text-reveal-foreground italic">
              {exampleReveal}
              <footer className="mt-2 text-xs font-medium tracking-[0.07em] text-muted-foreground uppercase not-italic">
                {exampleName}'s reveal — read by her guests only after they
                pledged
              </footer>
            </blockquote>
            <div className="flex flex-col items-start justify-center gap-5">
              <p className="max-w-md text-lg leading-relaxed text-muted-foreground">
                {t("landing.subheader")}
              </p>
              <div className="flex items-center gap-3.5">
                <Button asChild size="lg">
                  <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/favpolls">See live favpolls →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Numbered story ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <SectionEyebrow className="mb-10">How it works</SectionEyebrow>
          <ol className="flex flex-col">
            {STEPS.map(([heading, body], i) => (
              <li
                key={heading}
                className="grid gap-4 border-t border-border py-8 md:grid-cols-[120px_240px_1fr] md:gap-8"
              >
                <span
                  className="text-6xl leading-none font-light text-primary/20"
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-medium tracking-tight text-foreground">
                  {heading}
                </h3>
                <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Live favpolls as an index, not cards ── */}
      {favpolls.length > 0 && (
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-330 px-6">
            <div className="mb-6 flex items-baseline justify-between">
              <SectionEyebrow>Live right now</SectionEyebrow>
              <Button variant="ghost" asChild>
                <Link href="/favpolls">See all →</Link>
              </Button>
            </div>
            <ul className="flex flex-col" role="list">
              {favpolls.map((f) => (
                <li key={f.id} className="border-t border-border">
                  <Link
                    href={`/favpolls/${f.id}`}
                    className="grid items-baseline gap-1 py-4 transition-colors hover:bg-primary/5 md:grid-cols-[1fr_200px_120px] md:gap-6"
                  >
                    <span className="text-lg font-medium text-foreground">
                      {f.protagonist.name}
                    </span>
                    <span className="text-sm tracking-[0.07em] text-primary-muted uppercase">
                      {f.poll?.topic?.title ?? "—"}
                    </span>
                    <span className="text-sm text-muted-foreground tabular-nums md:text-right">
                      {formatCurrency(f.total_raised, MARKET_DEFAULTS["en-GB"])}{" "}
                      raised
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── The record as a full-width band ── */}
      {showRecord && (
        <section className="border-b border-border bg-primary/5 py-16">
          <div className="mx-auto max-w-330 px-6">
            <SectionEyebrow className="mb-2">The record</SectionEyebrow>
            <h2 className="mb-10 max-w-2xl text-3xl font-light tracking-tight text-foreground">
              A lasting, collectively funded measure of what people love most.
            </h2>
            <ol
              className="grid gap-x-16 gap-y-4 md:grid-cols-2"
              aria-label="Top all-time favourites"
            >
              {recordItems.map((item) => (
                <li key={item.id}>
                  <RankingBar
                    label={item.label}
                    amount={formatCurrency(
                      item.all_time_pledged,
                      MARKET_DEFAULTS["en-GB"]
                    )}
                    widthPercent={Math.round(
                      (item.all_time_pledged / recordMax) * 100
                    )}
                    barClassName="bg-chart-2"
                  />
                  {item.topics?.title && (
                    <p className="mt-0.5 text-xs tracking-[0.07em] text-muted-foreground uppercase">
                      {item.topics.title}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ── Prose: money, then the will ── */}
      <section className="border-b border-border py-20">
        <div className="mx-auto flex max-w-2xl flex-col gap-14 px-6">
          <div>
            <SectionEyebrow className="mb-3">
              Where the money goes
            </SectionEyebrow>
            <p className="text-xl leading-relaxed font-light text-foreground">
              A 5% platform fee covers favpoll's costs.{" "}
              <span className="text-primary">
                The remaining 95% reaches your chosen charity in full
              </span>
              , processed directly through Stripe.
              {charities.length > 0 && (
                <span className="text-muted-foreground">
                  {" "}
                  Charities on favpoll include{" "}
                  {charities.map((c) => c.name).join(", ")} and more.
                </span>
              )}
            </p>
          </div>
          <div>
            <SectionEyebrow className="mb-3">Written in advance</SectionEyebrow>
            <p className="text-xl leading-relaxed font-light text-foreground">
              The questions and the reveals can be written in advance — by you,
              in your own words — and kept in a will or letter of wishes.{" "}
              <span className="text-primary">
                Guests receive your answer in your voice
              </span>
              , after they have pledged. It is one of the quietest and most
              lasting things this platform makes possible.
            </p>
          </div>
        </div>
      </section>

      {/* ── Close ── */}
      <section className="py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-6 text-center">
          <HonourCharityLoveVenn size={180} animate className="opacity-90" />
          <h2 className="text-3xl font-light tracking-tight text-foreground">
            {t("landing.subheader")}
          </h2>
          <div className="flex items-center gap-3.5">
            <Button asChild size="lg">
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/favpolls">See live favpolls →</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("landing.cta.caption")}
          </p>
        </div>
      </section>
    </main>
  )
}
