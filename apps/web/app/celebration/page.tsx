import { RegisterScope } from "@/components/register-scope"
import type { Metadata } from "next"
import Link from "next/link"
import { LandingHero } from "@/components/landing/hero"
import { Button } from "@/components/ui/button"
import { HowItWorksSteps } from "@/components/landing/how-it-works-steps"
import {
  PickHint,
  PledgeHint,
  RankHint,
  type HintScene,
} from "@/components/landing/how-it-works-hints"
import { IdeasSection } from "@/components/landing/ideas-section"
import { FoldedCardVignette } from "@/components/landing/folded-card-vignette"
import { RevealVignettePhone } from "@/components/landing/reveal-vignette"
import { LiveVignette } from "@/components/landing/live-vignette"
import { KeepsakeVignetteDetail } from "@/components/landing/keepsake-vignette"
import {
  WEDDING_SCENE,
  WEDDING_PACK_DATA,
  WEDDING_PACK_STEPS,
  WEDDING_KEEPSAKE_DATA,
} from "@/components/landing/demo-fixture"
import { t } from "@/lib/i18n"
import { fetchLiveFavpolls, REGISTERS_BY_PAGE } from "@/lib/live-favpolls"
import { OpenRightNow } from "@/components/landing/open-right-now"

// Register landing #2 (see /memorials for the pattern notes). ACCENT,
// NOT REBRAND (founder decision, 2026-08-03): brand chrome stays purple
// everywhere; each register page carries an accent from the EXISTING
// token family — celebration wears the warm gold (--warning, tuned
// alongside the brand purple), applied to the hero band, quote rule and
// bullet dots. Structure deliberately parallels the other register
// pages so the three can be shaped against each other.

// The shelf below renders live data but the page has no request-dependent
// APIs, so Next would cache the FIRST render for ever. 60s, matching home.
export const revalidate = 60

export const metadata: Metadata = {
  title: "Celebration — favpoll",
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

// Cards -> phone -> room -> paper, the same arc /memorials runs, in the
// register's own objects. Every one is the real component pointed at the
// CELEBRATION scene, so Poppy Chen's favpoll runs from the homepage router
// card through the hero and on through all four.
// The band's hints run on the WEDDING scene, not the memorial one they
// default to. Until now /celebrations showed Belinda's colours and Marie
// Curie under a wedding headline — the hints file said as much: the other
// registers "borrow them for now ... each can pass its own when its turn in
// the rework comes."
//
// `shown` is eleven of the topic's twenty-eight, chosen not sliced
// (eight until 2026-09-02 — another line to match the taller triad). Short
// labels, because the hint column is 184px and long place names drop it to
// one pill a row; and CHENGDU IS DELIBERATELY ABSENT, exactly as Purple is
// on the memorial — it is the couple's own answer, and lighting it here
// would give the reveal away two columns before the standings do.
//
// `picked` is Greece: a guest's pick, second in the standings, and not the
// scene's selectedIndex, which points at Chengdu.
const WEDDING_HINTS: HintScene = {
  scene: WEDDING_SCENE,
  shown: [
    "Bali",
    "Cornwall",
    "Croatia",
    "Cyprus",
    "Greece",
    "Iceland",
    "Italy",
    "Japan",
    "Lisbon",
    "Norway",
    "Venice",
  ],
  picked: "Greece",
}

const STEP_MEDIA = [
  <PickHint key="pick" hints={WEDDING_HINTS} />,
  <PledgeHint key="pledge" hints={WEDDING_HINTS} />,
  <RankHint key="rank" hints={WEDDING_HINTS} />,
]

const IDEAS = [
  {
    key: "cards",
    label: t("celebrations.artefacts.cards.label"),
    body: t("celebrations.artefacts.cards.body"),
    // A PLACE CARD, because the copy now says place names (founder,
    // 2026-08-28). Avery C32253, 110 x 40mm — a different face from the tent
    // card that was here, and the picture has to follow the words or it is
    // the same label/artefact mismatch the order of service had on
    // /memorials. Alex & Jordan's, so it matches the handset above it and
    // the keepsake below.
    artefact: (
      <FoldedCardVignette
        face="averyPlace"
        data={WEDDING_PACK_DATA}
        steps={WEDDING_PACK_STEPS}
      />
    ),
  },
  {
    key: "reveal",
    label: t("celebrations.artefacts.reveal.label"),
    body: t("celebrations.artefacts.reveal.body"),
    // The couple's answer is not competing with the guests' at all — the
    // room says where it loves, they say where they are GOING — which makes
    // this a better register for the reveal than the memorial it was built
    // for.
    artefact: <RevealVignettePhone scene={WEDDING_SCENE} />,
  },
  {
    key: "display",
    label: t("celebrations.artefacts.display.label"),
    body: t("celebrations.artefacts.display.body"),
    // FUNDRAISER variant, and it comes for free: DisplayStill derives the
    // presence dial from the scene's register, so a memorial gets tribute
    // and everything else gets the goal bar. A party screen should be loud
    // where a wake's is quiet.
    artefact: <LiveVignette scene={WEDDING_SCENE} still room />,
  },
  {
    key: "keepsake",
    label: t("celebrations.artefacts.keepsake.label"),
    body: t("celebrations.artefacts.keepsake.body"),
    // TRIBUTE variant, despite the name, and it is right for a wedding:
    // tribute leads on the people and their reveal, fundraiser leads on the
    // money. A wedding memento opening with the total is the wrong way round.
    //
    // The copy here says the ORGANISER prints and sends; /memorials says the
    // family INVITES GUESTS to print their own. That divergence is
    // deliberate and both halves are true — the keepsake route carries no
    // auth check, only `if (!isClosed) notFound()`, so anyone with the link
    // can print one. Do not flatten them to match; the registers want
    // different things.
    artefact: <KeepsakeVignetteDetail data={WEDDING_KEEPSAKE_DATA} />,
  },
]

export default async function CelebrationsPage() {
  const live = await fetchLiveFavpolls({
    registers: REGISTERS_BY_PAGE.celebrations,
  })

  return (
    <RegisterScope palette="celebration">
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

          The page wears the celebration palette (RegisterScope), and the
          handset inside the hero wears its scene's — both magenta here —
          so nothing is tinted by hand any more (2026-08-30). ── */}
        <LandingHero
          sceneKind="celebration"
          scene={WEDDING_SCENE}
          still
          eyebrow={t("celebrations.eyebrow")}
          headline={t("celebrations.headline")}
          subheader={t("celebrations.subheader")}
          ctaLabel={t("celebrations.cta.primary")}
          ctaSecondaryLabel={t("celebrations.cta.secondary")}
          hideStats
        />

        {/* ── How it works, in the celebration register ── */}
        <HowItWorksSteps
          title={t("celebrations.how.title")}
          steps={STEPS.map((step, i) => ({ ...step, media: STEP_MEDIA[i] }))}
        />

        <IdeasSection title={t("celebrations.artefacts.title")} ideas={IDEAS} />

        <OpenRightNow favpolls={live} />

        {/* ── Close — the landing's purple monogram close, one line.
          MATCHED TO /memorials (founder, 2026-08-28) in all three ways it
          differed: max-w-330 rather than max-w-3xl so it sits on the same
          panel width as every other section, left-aligned rather than
          centred, and — the one that was not merely cosmetic — the button
          takes `variant="secondary"`. A default Button is PRIMARY, and this
          band is bg-primary: purple on purple. ── */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto w-full max-w-330 px-6 py-16">
            <p className="mb-6 text-3xl leading-tight font-light tracking-tight md:text-4xl">
              {t("celebrations.close.headline")}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls/new">{t("celebrations.close.cta")}</Link>
            </Button>
          </div>
        </section>
      </main>
    </RegisterScope>
  )
}
