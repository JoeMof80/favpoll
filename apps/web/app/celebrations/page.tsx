import type { Metadata } from "next"
import Link from "next/link"
import { LandingHero } from "@/components/landing/hero"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"

// Register landing #2 (see /memorials for the pattern notes). ACCENT,
// NOT REBRAND (founder decision, 2026-08-03): brand chrome stays purple
// everywhere; each register page carries an accent from the EXISTING
// token family — celebration wears the warm gold (--warning, tuned
// alongside the brand purple), applied to the hero band, quote rule and
// bullet dots. Structure deliberately parallels the other register
// pages so the three can be shaped against each other.

export const metadata: Metadata = {
  title: "Celebrations — favpoll",
  description:
    "Make their day about what they love. A favpoll gathers everyone around the guest of honour's favourite things and turns the fun into giving to charity, in their name.",
}

const STEPS = [
  {
    label: t("celebrations.how.pick.label"),
    body: t("celebrations.how.pick.body"),
  },
  {
    label: t("celebrations.how.pledge.label"),
    body: t("celebrations.how.pledge.body"),
  },
  {
    label: t("celebrations.how.reveal.label"),
    body: t("celebrations.how.reveal.body"),
  },
]

const PRESENCE = [
  t("celebrations.presence.ambient"),
  t("celebrations.presence.screen"),
  t("celebrations.presence.rally"),
]

export default function CelebrationsPage() {
  return (
    <main>
      {/* ── Hero — the REAL landing hero, register-configured (v2):
          the demo loops the celebration story on the register's band. ── */}
      <LandingHero
        sceneKind="celebration"
        eyebrow={t("celebrations.eyebrow")}
        headline={t("celebrations.headline")}
        subheader={t("celebrations.subheader")}
        ctaLabel={t("celebrations.cta.primary")}
        accentBarClassName="bg-warning-strong"
        hideStats
      />

      {/* ── How it works, in the celebration register ── */}
      <section id="how" className="w-full scroll-mt-20">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <SectionEyebrow className="mb-10 text-center">
            {t("celebrations.how.title")}
          </SectionEyebrow>
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map((step, i) => (
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

      {/* ── Placement: a beat in the speeches ── */}
      <section className="w-full bg-primary/5">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="mb-4 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {t("celebrations.moment.title")}
          </h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            {t("celebrations.moment.body")}
          </p>
          <p className="border-l-2 border-warning-strong pl-4 text-lg text-foreground italic">
            {t("celebrations.moment.line")}
          </p>
        </div>
      </section>

      {/* ── The presence dial, party end first ── */}
      <section className="w-full">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="mb-6 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {t("celebrations.presence.title")}
          </h2>
          <ul className="space-y-4">
            {PRESENCE.map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning-strong"
                />
                <p className="leading-relaxed text-muted-foreground">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Close — gold band, brand CTA ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <p className="mb-6 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            {t("celebrations.close.headline")}
          </p>
          <Button asChild size="lg">
            <Link href="/favpolls/new">{t("celebrations.close.cta")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
