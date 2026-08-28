import type { Metadata } from "next"
import Link from "next/link"
import { LandingHero } from "@/components/landing/hero"
import { Button } from "@/components/ui/button"
import { HowItWorksSteps } from "@/components/landing/how-it-works-steps"
import { IdeasSection } from "@/components/landing/ideas-section"
import { TentCardVignette } from "@/components/landing/tent-card-vignette"
import { RevealVignettePhone } from "@/components/landing/reveal-vignette"
import { LiveVignette } from "@/components/landing/live-vignette"
import { KeepsakeVignetteDetail } from "@/components/landing/keepsake-vignette"
import {
  DEMO_SCENE,
  DEMO_KEEPSAKE_WALKTHROUGH_DATA,
} from "@/components/landing/demo-fixture"
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
    "Celebrate them by sharing what they love. Give to charity in their name. A favpoll turns everyone's favourites into pledges to a charity they choose.",
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

// Cards -> phone -> room -> paper, the same arc /memorials runs, in the
// register's own objects. Every one is the real component pointed at the
// CELEBRATION scene, so Poppy Chen's favpoll runs from the homepage router
// card through the hero and on through all four.
const IDEAS = [
  {
    key: "cards",
    label: t("celebrations.artefacts.cards.label"),
    body: t("celebrations.artefacts.cards.body"),
    // A tent card, not the pack fan: the copy names the object on the
    // table, so the picture is that object. TentCardVignette's defaults are
    // the celebration pack, so this needs no register twin.
    artefact: <TentCardVignette />,
  },
  {
    key: "reveal",
    label: t("celebrations.artefacts.reveal.label"),
    body: t("celebrations.artefacts.reveal.body"),
    // Poppy's own favourite comes FOURTH in her standings — the room
    // disagreed with her — which makes this the better register for the
    // reveal than the memorial it was built for.
    artefact: <RevealVignettePhone scene={DEMO_SCENE} />,
  },
  {
    key: "display",
    label: t("celebrations.artefacts.display.label"),
    body: t("celebrations.artefacts.display.body"),
    // FUNDRAISER variant, and it comes for free: DisplayStill derives the
    // presence dial from the scene's register, so a memorial gets tribute
    // and everything else gets the goal bar. A party screen should be loud
    // where a wake's is quiet.
    artefact: <LiveVignette scene={DEMO_SCENE} still room />,
  },
  {
    key: "keepsake",
    label: t("celebrations.artefacts.keepsake.label"),
    body: t("celebrations.artefacts.keepsake.body"),
    // The walkthrough's own sheet — Poppy's — which until now had nowhere
    // to live outside the home page's How It Works.
    artefact: <KeepsakeVignetteDetail data={DEMO_KEEPSAKE_WALKTHROUGH_DATA} />,
  },
]

export default function CelebrationsPage() {
  return (
    <main>
      {/* ── The opening — the REAL landing hero, register-configured, and
          now the same shape as /memorials (founder, 2026-08-28).

          `still` replaces the looping demo with a phone at phase "reveal".
          The reasoning that put it on /memorials was half register-specific
          and half not: "a looping demo is the wrong first note" for a page a
          celebrant forwards to a bereaved family does NOT transfer to a
          sixteenth birthday. What does transfer is the continuity — the
          homepage's router card opens this page, and a visitor who tapped a
          card showing a favpoll should land on that favpoll, not on a demo
          starting over from the beginning.

          accentVar over accentBarClassName. The bar class only tinted the
          leader; accentVar swaps --primary and --chart-3 across the whole
          card, so the handset carries the register's amber the way the
          memorial one carries its blue. Both --warning and
          --warning-on-band already exist, for light and dark. ── */}
      <LandingHero
        sceneKind="celebration"
        still
        eyebrow={t("celebrations.eyebrow")}
        headline={t("celebrations.headline")}
        subheader={t("celebrations.subheader")}
        ctaLabel={t("celebrations.cta.primary")}
        ctaSecondaryLabel={t("celebrations.cta.secondary")}
        accentVar="warning"
        hideStats
      />

      {/* ── How it works, in the celebration register ── */}
      <HowItWorksSteps title={t("celebrations.how.title")} steps={STEPS} />

      <IdeasSection
        title={t("celebrations.artefacts.title")}
        ideas={IDEAS}
        accentClassName="text-warning-strong"
      />

      {/* ── Placement: a beat in the speeches ──
          KEPT FOR NOW (founder, 2026-08-28): the Ideas section above
          overlaps both this and the presence dial below, and the founder is
          drawing the Ideas copy from them. They go when that copy settles. */}
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
