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
import { ShareVignette } from "@/components/landing/share-vignette"
import { RevealVignettePhone } from "@/components/landing/reveal-vignette"
import { TopicPickerVignette } from "@/components/landing/topic-picker-vignette"
import { KeepsakeVignetteDetail } from "@/components/landing/keepsake-vignette"
import {
  FUNDRAISER_SCENE,
  FUNDRAISER_KEEPSAKE_DATA,
  FUNDRAISER_TOPIC_PICKER,
} from "@/components/landing/demo-fixture"
import { t } from "@/lib/i18n"
import { fetchLiveFavpolls, REGISTERS_BY_PAGE } from "@/lib/live-favpolls"
import { OpenRightNow } from "@/components/landing/open-right-now"

// Register landing #3 (see /memorials for the pattern notes; /celebrations
// for the accent decision). Fundraising wears the success green — ALREADY
// the product's goal-reached colour, so the accent is semantic, not
// decorative: this is the register where the goal is the protagonist.

// The shelf below renders live data but the page has no request-dependent
// APIs, so Next would cache the FIRST render for ever. 60s, matching home.
export const revalidate = 60

export const metadata: Metadata = {
  title: "Fundraiser — favpoll",
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

// The band's hints run on the FUNDRAISER scene rather than the memorial one
// they default to — the last of the three registers to stop showing
// Belinda's colours under its own headline.
//
// ALL EIGHT ARE SHOWN, where the memorial withholds Purple and the wedding
// withholds Chengdu. Those two hold back the protagonist's own answer, so
// that lighting it in the hint column does not spend the reveal two columns
// before the standings do. Marcus has no answer to protect — his reveal is a
// remark — so the whole list can appear, and a homemade list is short enough
// that it fits.
//
// `picked` is the sombrero: a guest's pick, top of the standings, and the
// scene's own selectedIndex.
const FUNDRAISER_HINTS: HintScene = {
  scene: FUNDRAISER_SCENE,
  shown: [
    "Beret",
    "Bowler",
    "Deerstalker",
    "Fez",
    "Sombrero",
    "Stetson",
    "Top hat",
    "Viking helmet",
  ],
  picked: "Sombrero",
}

const STEP_MEDIA = [
  <PickHint key="pick" hints={FUNDRAISER_HINTS} />,
  <PledgeHint key="pledge" hints={FUNDRAISER_HINTS} />,
  <RankHint key="rank" hints={FUNDRAISER_HINTS} />,
]

// Topic -> link -> phone -> paper: make it, send it, give and be told,
// keep it. The other two pages run paper -> phone -> room -> paper; this one
// diverges twice, and both are the exemplar deciding the pictures.
//
// THE LIVE DISPLAY IS GONE (founder, 2026-08-28: "removing the live display
// since it isn't a live event"). Its copy said supporters "can scan from
// their seats", and a marathon has no seats — the same words-and-picture
// mismatch that made the order of service wrong on /memorials and the tent
// card wrong on /celebrations. The register does hold room events, quiz
// nights and galas among them, but the page has to be true to the favpoll it
// is actually showing. The display keeps its place on /celebrations.
//
// THE TOPIC PICKER GOES FIRST rather than slotting into the gap left by the
// display. It is the only artefact here about making the favpoll rather than
// running it, so chronology puts it at the front — and this is the one page
// whose exemplar earns it: nobody has a favourite hat in the abstract, so
// "which should he wear" is a topic no catalogue could ever stock.
//
// Every one is the real component pointed at the FUNDRAISER scene, so Marcus
// Bell's marathon runs from the homepage router card through the hero and on
// through all four.
//
// MARCUS, NOT THE CAUSE SCENE — see FUNDRAISER_SCENE for why the artefacts
// decided it. The page still has to read true for a faceless cause, and that
// is what the copy does: none of the four bodies below names a protagonist,
// and only the reveal one assumes there is a person with an answer, which is
// the one idea a cause would skip anyway.
const IDEAS = [
  {
    key: "topic",
    label: t("fundraisers.artefacts.topic.label"),
    body: t("fundraisers.artefacts.topic.body"),
    feature: { label: "homemade topics", href: "/features#topics" },
    // STILL (founder, 2026-08-29: "it should probably just show the dialog
    // with the homemade topic that Marcus already created"). It ran the full
    // three-dialog sequence until now, which was the wrong picture twice
    // over: it was the only moving artefact on any of the three register
    // pages, and it depicted the topic being MADE when everything else on
    // this page depicts a favpoll that already exists.
    //
    // Held, it shows the items dialog with "Favourite marathon hat" and all
    // eight hats as chips under "Added by you" — which is the whole claim of
    // the idea beside it, in one frame, with no waiting.
    //
    // The full sequence stays on /features, where how a custom topic gets
    // made is the point being explained.
    artefact: <TopicPickerVignette scene={FUNDRAISER_TOPIC_PICKER} still />,
  },
  {
    key: "share",
    label: t("fundraisers.artefacts.share.label"),
    body: t("fundraisers.artefacts.share.body"),
    // A LINK, NOT A POSTER (founder, 2026-08-29). A QR code needs somebody to
    // walk past it: a memorial has a wake and a wedding has a room, so their
    // paper reaches people who are already there. Marcus's marathon has no
    // venue at all, so a noticeboard was the wrong picture of how this favpoll
    // spreads. See ShareVignette for what replaced it.
    artefact: <ShareVignette />,
  },
  {
    key: "reveal",
    label: t("fundraisers.artefacts.reveal.label"),
    body: t("fundraisers.artefacts.reveal.body"),
    feature: { label: "the reveal", href: "/features#reveal" },
    // THE ONLY MESSAGE REVEAL ON THE SITE, and the only surface demonstrating
    // isMessageReveal. On a poll with a consequence the protagonist's own
    // favourite is hollow — Marcus wears whatever the room picks — so he gives
    // back a remark instead. The product follows with no field set: the poster
    // one row above promises a message too.
    artefact: <RevealVignettePhone scene={FUNDRAISER_SCENE} />,
  },
  {
    key: "keepsake",
    label: t("fundraisers.artefacts.keepsake.label"),
    body: t("fundraisers.artefacts.keepsake.body"),
    feature: { label: "the keepsake", href: "/features#keepsake" },
    // FUNDRAISER variant — the first page to use it, and its home. Tribute
    // leads on the person and their reveal; fundraiser leads on the money.
    // A memorial memento opening with a total would be crass and a wedding's
    // merely odd, but a sponsored event's whole story IS the total, and the
    // sheet that leads with it is the one to send a sponsor.
    artefact: (
      <KeepsakeVignetteDetail
        data={FUNDRAISER_KEEPSAKE_DATA}
        variant="fundraiser"
      />
    ),
  },
]

export default async function FundraisersPage() {
  const live = await fetchLiveFavpolls({
    registers: REGISTERS_BY_PAGE.fundraisers,
  })

  return (
    <RegisterScope palette="fundraiser">
      <main>
        {/* ── The opening — the REAL landing hero, register-configured, now
          the same shape as the other two (see /celebrations for the `still`
          reasoning). The page wears the fundraiser palette (RegisterScope)
          and the handset wears its scene's — green, both (2026-08-30). ── */}
        <LandingHero
          sceneKind="fundraiser"
          scene={FUNDRAISER_SCENE}
          still
          eyebrow={t("fundraisers.eyebrow")}
          headline={t("fundraisers.headline")}
          subheader={t("fundraisers.subheader")}
          ctaLabel={t("fundraisers.cta.primary")}
          ctaSecondaryLabel={t("fundraisers.cta.secondary")}
          hideStats
        />

        {/* ── How it works, in the rally register ── */}
        <HowItWorksSteps
          title={t("fundraisers.how.title")}
          steps={STEPS.map((step, i) => ({ ...step, media: STEP_MEDIA[i] }))}
        />

        <IdeasSection title={t("fundraisers.artefacts.title")} ideas={IDEAS} />

        <OpenRightNow favpolls={live} />

        {/* ── Close — matched to the other two registers: max-w-330,
          left-aligned, and variant="secondary" because a default Button is
          PRIMARY and this band is bg-primary. ── */}
        <section className="bg-primary text-primary-foreground">
          <div className="mx-auto w-full max-w-330 px-6 py-16">
            <p className="mb-6 text-3xl leading-tight font-light tracking-tight md:text-4xl">
              {t("fundraisers.close.headline")}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls/new">{t("fundraisers.close.cta")}</Link>
            </Button>
          </div>
        </section>
      </main>
    </RegisterScope>
  )
}
