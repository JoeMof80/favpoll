import type { Metadata } from "next"
import Link from "next/link"
import { LandingHero } from "@/components/landing/hero"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"

// Register landing #3 (see /memorials for the pattern notes; /celebrations
// for the accent decision). Fundraising wears the success green — ALREADY
// the product's goal-reached colour, so the accent is semantic, not
// decorative: this is the register where the goal is the protagonist.

export const metadata: Metadata = {
  title: "Fundraisers — favpoll",
  description:
    "Fundraise by sharing what we all love. Give to charity in support of the cause. Supporters back their favourite and the room watches the total climb.",
}

const STEPS = [
  {
    label: t("fundraisers.how.pick.label"),
    body: t("fundraisers.how.pick.body"),
  },
  {
    label: t("fundraisers.how.pledge.label"),
    body: t("fundraisers.how.pledge.body"),
  },
  {
    label: t("fundraisers.how.reveal.label"),
    body: t("fundraisers.how.reveal.body"),
  },
]

const PRESENCE = [
  t("fundraisers.presence.ambient"),
  t("fundraisers.presence.screen"),
  t("fundraisers.presence.rally"),
]

export default function FundraisersPage() {
  return (
    <main>
      {/* ── Hero — the REAL landing hero, register-configured (v2):
          the demo loops the fundraiser story on the register's band. ── */}
      <LandingHero
        sceneKind="fundraiser"
        eyebrow={t("fundraisers.eyebrow")}
        headline={t("fundraisers.headline")}
        subheader={t("fundraisers.subheader")}
        ctaLabel={t("fundraisers.cta.primary")}
        accentBarClassName="bg-success-strong"
        hideStats
      />

      {/* ── How it works, in the rally register ── */}
      <section id="how" className="w-full scroll-mt-20">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <SectionEyebrow className="mb-10 text-center">
            {t("fundraisers.how.title")}
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

      {/* ── The room: goal + live display ── */}
      <section className="w-full bg-primary/5">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="mb-4 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {t("fundraisers.rally.title")}
          </h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            {t("fundraisers.rally.body")}
          </p>
          <p className="border-l-2 border-success-strong pl-4 text-lg text-foreground italic">
            {t("fundraisers.rally.line")}
          </p>
        </div>
      </section>

      {/* ── Scale: bake sale to telethon ── */}
      <section className="w-full">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="mb-6 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {t("fundraisers.presence.title")}
          </h2>
          <ul className="space-y-4">
            {PRESENCE.map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success-strong"
                />
                <p className="leading-relaxed text-muted-foreground">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Close ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <p className="mb-6 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            {t("fundraisers.close.headline")}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/favpolls/new">{t("fundraisers.close.cta")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
