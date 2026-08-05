import type { Metadata } from "next"
import Link from "next/link"
import { LandingHero } from "@/components/landing/hero"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { t } from "@/lib/i18n"

// The first register landing page (sequencing decision 2026-08-01:
// memorial FIRST — the warm channel is Joy, funeral directors, St
// Luke's). This page is the FORWARDING ARTEFACT for those gatekeepers:
// everything a celebrant needs to hand a family, in the memorial
// register — wake-first placement, the presence dial at its quiet
// settings, and the reveal as keepsake, never quiz. Copy lives in
// messages/en-GB.json (memorials.*); bands follow the landing's
// alternating grammar (purple hero · white · bg-primary/5 · purple
// close).

export const metadata: Metadata = {
  title: "Memorials — favpoll",
  description:
    "Remember them by what they loved. Give in their name. A favpoll turns everyone's favourites into pledges to a charity the family names.",
}

const STEPS = [
  { label: t("memorials.how.pick.label"), body: t("memorials.how.pick.body") },
  {
    label: t("memorials.how.pledge.label"),
    body: t("memorials.how.pledge.body"),
  },
  {
    label: t("memorials.how.reveal.label"),
    body: t("memorials.how.reveal.body"),
  },
]

const ASSURANCES = [
  {
    label: t("memorials.assure.free.label"),
    body: t("memorials.assure.free.body"),
  },
  {
    label: t("memorials.assure.charity.label"),
    body: t("memorials.assure.charity.body"),
  },
  {
    label: t("memorials.assure.nofave.label"),
    body: t("memorials.assure.nofave.body"),
  },
  {
    label: t("memorials.assure.phone.label"),
    body: t("memorials.assure.phone.body"),
  },
]

const PRESENCE = [
  t("memorials.presence.ambient"),
  t("memorials.presence.screen"),
  t("memorials.presence.rally"),
]

export default function MemorialsPage() {
  return (
    <main>
      {/* ── Hero — the REAL landing hero, register-configured (v2,
          2026-08-03): the demo loops the memorial story alone, on the
          register's band. Stats hidden (home-flavoured). ── */}
      <LandingHero
        sceneKind="memorial"
        eyebrow={t("memorials.eyebrow")}
        headline={t("memorials.headline")}
        subheader={t("memorials.subheader")}
        ctaLabel={t("memorials.cta.primary")}
        accentBarClassName="bg-memorial"
        hideStats
      />

      {/* ── How it works, in the memorial register ── */}
      <section id="how" className="w-full scroll-mt-20">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <SectionEyebrow className="mb-10 text-center">
            {t("memorials.how.title")}
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

      {/* ── Placement: the wake, not the service ── */}
      <section className="w-full bg-primary/5">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="mb-4 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {t("memorials.wake.title")}
          </h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            {t("memorials.wake.body")}
          </p>
          <p className="border-l-2 border-memorial pl-4 text-lg text-foreground italic">
            {t("memorials.wake.nocash")}
          </p>
        </div>
      </section>

      {/* ── The presence dial, quiet end first ── */}
      <section className="w-full">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-20">
          <h2 className="mb-6 text-2xl font-medium tracking-tight text-foreground md:text-3xl">
            {t("memorials.presence.title")}
          </h2>
          <ul className="space-y-4">
            {PRESENCE.map((line) => (
              <li key={line} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-memorial"
                />
                <p className="leading-relaxed text-muted-foreground">{line}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Reassurances ── */}
      <section className="w-full bg-primary/5">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 sm:grid-cols-2 md:grid-cols-4 md:py-20">
          {ASSURANCES.map((item) => (
            <div key={item.label}>
              <p className="mb-1 font-medium text-foreground">{item.label}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── For the gatekeepers this page is forwarded by ── */}
      <section className="w-full">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <h2 className="mb-3 text-xl font-medium tracking-tight text-foreground">
            {t("memorials.pro.title")}
          </h2>
          <p className="mx-auto mb-6 max-w-xl leading-relaxed text-muted-foreground">
            {t("memorials.pro.body")}
          </p>
          <Button asChild variant="outline">
            <a href="mailto:joseph.moffatt@favpoll.com">
              {t("memorials.pro.cta")}
            </a>
          </Button>
        </div>
      </section>

      {/* ── Close — the landing's purple monogram close, one line ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-20">
          <p className="mb-6 text-3xl leading-tight font-light tracking-tight md:text-4xl">
            {t("memorials.close.headline")}
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/favpolls/new">{t("memorials.close.cta")}</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
