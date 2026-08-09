import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FadeIn } from "@/components/landing/fade-in"
import { HeroTexture } from "@/components/landing/hero-texture"
import { t } from "@/lib/i18n"
import { FeatureNav } from "@/components/landing/feature-nav"
import { TopicPickerVignette } from "@/components/landing/topic-picker-vignette"
import { RoomVignette } from "@/components/landing/room-vignette"
import { PackVignette } from "@/components/landing/pack-vignette"
import { FundVignette } from "@/components/landing/fund-vignette"
import { RevealVignette } from "@/components/landing/reveal-vignette"
import { GoalVignette } from "@/components/landing/goal-vignette"
import { GuestWallVignette } from "@/components/landing/guest-wall-vignette"

// /features, organised BY FEATURE (founder redesign, 2026-08-09).
//
// It was organised by READER — for organisers, for guests, for charities —
// which is an ARGUMENT, and arguments belong on About, which already makes
// them. A features page is a REFERENCE, and references are organised by the
// thing you look up: the same reason documentation is organised by API rather
// than by persona.
//
// The restructure removed two duplications rather than relocating them. The
// old #charities section restated About#money, and #beyond's will
// instructions restated About#wills; both now point at About instead.
//
// And it unlocks the homepage: the capability grid's six cards each have a
// section here, so they can become links. That was the reason to do it.
//
// Deliberately NOT here: Gift Aid, which is effectively confirmed but not
// contractually settled — the most attractive line this page could carry and
// the most damaging to get wrong.

export const metadata: Metadata = {
  title: "Features — favpoll",
  description:
    "What a favpoll does: the print pack, the live display, the shared fund, the personal reveal, and 100% of every pledge to a registered charity.",
}

const SECTIONS = [
  { id: "topics", label: "Custom topics" },
  { id: "stationery", label: "QR-coded stationery" },
  { id: "display", label: "Live display" },
  { id: "shared-fund", label: "Shared fund" },
  { id: "reveal", label: "Personal reveal" },
  { id: "goal", label: "Pledge goal" },
  { id: "guest-wall", label: "Guest wall" },
  { id: "keepsake", label: "Keepsake" },
  { id: "basics", label: "The basics" },
  { id: "money", label: "Where the money goes" },
]

const BASICS: { label: string; body: string }[] = [
  {
    label: "Free to create",
    body: "No fee to set one up, and none taken from the gift.",
  },
  {
    label: "One to three charities",
    body: "Name up to three. The proceeds are split equally between them.",
  },
  {
    label: "Up to 90 days",
    body: "It closes on its own when the date arrives, and the proceeds go on their way.",
  },
  {
    label: "Editable after publishing",
    body: "Change the details, the charities or the closing date any time before it closes.",
  },
  {
    label: "Private if you need it",
    body: "An unlisted favpoll is reachable only by the people you share it with, and never appears on the public favpolls page.",
  },
  {
    label: "Nothing to sign up for",
    body: "A guest pledges with an email address. No account, no app.",
  },
]

function Feature({
  id,
  title,
  lead,
  children,
  artefact,
}: {
  id: string
  title: string
  lead: string
  children?: React.ReactNode
  artefact?: React.ReactNode
}) {
  return (
    // scroll-mt-14 = 56px, which is the header's height EXACTLY: h-14 of
    // content plus a 1px bottom border, measured 57px at every breakpoint.
    // It must not exceed that. scroll-mt-28 landed the heading 168px down —
    // a screenful of the previous section's whitespace above the thing you
    // clicked — and scroll-mt-16 left a 7px sliver below the header showing
    // the descenders of whatever sat above. Landing 1px UNDER the header
    // costs nothing, because that pixel is the section's own top padding.
    <section id={id} className="scroll-mt-14 border-b border-border py-14">
      <FadeIn>
        <h2 className="mb-3 text-2xl font-medium tracking-tight text-foreground">
          {title}
        </h2>
        <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {lead}
        </p>
        {children}
      </FadeIn>
      {artefact && (
        <FadeIn delay={0.08}>
          <div className="mt-8">{artefact}</div>
        </FadeIn>
      )}
    </section>
  )
}

export default function FeaturesPage() {
  return (
    <main className="flex flex-col">
      {/* NO HERO (founder, 2026-08-09). It had a purple band, then a plain
          one, and the second was not the fix — the page does not want a hero
          at all. Most visitors arrive from a homepage capability card, which
          links to #topics or #reveal, so they land mid-page and never see the
          top; the rest scroll to find a feature. A hero addresses neither, and
          both pay for it in vertical space before the first fact.
          What is left is a page TITLE, which is not the same thing: one line,
          no lead, no CTA, so the h1 exists for the document and for search
          without pretending to be a landing page. */}
      {/* pb-16: the menu is sticky, so its last items ride down to the very
          end of the grid. Without a gap they finish flush against the CTA
          band and read as sitting ON it. */}
      <div className="mx-auto w-full max-w-330 px-6 pt-14 pb-16">
        {/* The menu is a COLUMN of the page grid rather than a floating
            overlay, so it can never sit on top of the content it indexes. */}
        <div className="grid gap-10 lg:grid-cols-[14rem_1fr]">
          <FeatureNav sections={SECTIONS} />

          <div className="min-w-0">
            {/* The page title lives in the CONTENT column (founder,
                2026-08-09), not above the grid. Above it, it sat over the
                menu and read as a label FOR the menu; here it aligns with
                the section headings it introduces, and the menu starts at
                the top of the column it indexes.
                One word, and no eyebrow above it. "Everything a favpoll can
                do." was the last of the hero still standing — a claim, on a
                page whose whole job is to list rather than to argue. The
                eyebrow went with it: it said "Features" directly above a
                heading, which is the same word twice. */}
            <h1 className="text-3xl font-medium tracking-tight text-foreground">
              Features
            </h1>

            <Feature
              id="topics"
              title="Custom topics"
              lead="Pick a topic favpoll keeps — favourite biscuit, favourite dog breed, favourite song — or write the question yourself. Guests can add favourites nobody thought of, with your blessing."
              artefact={<TopicPickerVignette />}
            />

            <Feature
              id="stationery"
              title="QR-coded stationery"
              lead="A pack to print: an A4 poster for the door, A5 cards for the tables, and eight wallet cards to a sheet — credit-card size, so they slip into an order of service or a pocket. Each carries the topic, the charity and its registered number, and a code that opens the favpoll on a phone."
              artefact={<PackVignette />}
            />

            <Feature
              id="display"
              title="Live display"
              lead="Open it on any screen in the room — a television, a projector, a laptop on a table. The standings re-order as pledges land, and a code big enough to read from across the room stays on screen throughout. Two ways to run it: the fundraiser leads with the total climbing, the tribute turns the volume down so the person leads and the money stays quiet."
              artefact={<RoomVignette />}
            />

            <Feature
              id="shared-fund"
              title="Shared fund"
              lead="Nobody needs to be able to pay. Anyone can put money into the shared fund — outright, or by moving part of their own pledge across — and a guest without means, a child usually, draws on it to take part. Nobody sees who used it, and the money reaches the charity either way."
              artefact={<FundVignette />}
            />

            <Feature
              id="reveal"
              title="Personal reveal"
              lead="A favpoll can hold a favourite back — the subject's own — and show it only once a guest has pledged one of their own. It is a gift rather than a gate: the guest shares something of themselves, and the favpoll shares something back."
              artefact={<RevealVignette />}
            />

            <Feature
              id="goal"
              title="Pledge goal"
              lead="Set a target and the room can watch it come. A goal is a milestone, not a finish line — the favpoll stays open until its closing date, and every pledge after the goal still counts."
              artefact={<GoalVignette />}
            />

            <Feature
              id="guest-wall"
              title="Guest wall"
              lead="Who backed what, as it happens. It scrolls on the big screen during the day and reads back afterwards as a record of who came. Names and favourites only — never amounts, and anyone can pledge as “Someone”."
              artefact={<GuestWallVignette />}
            />

            <Feature
              id="keepsake"
              title="Keepsake"
              lead="When a favpoll closes, the day becomes a single sheet to print — the standings, the reveal, the total raised, and everyone who took part. No per-guest amounts: what people gave stays theirs."
            >
              {/* PLACEHOLDER (2026-08-09). The keepsake EXISTS — it is not
                  "coming soon" — but it needs work and carries the dark-mode
                  print bug #535 fixed on the pack. No artefact until that is
                  done; the section exists so the homepage card has somewhere
                  honest to land. */}
              <p className="max-w-2xl text-sm text-muted-foreground italic">
                A picture of one is coming — the page is being reworked.
              </p>
            </Feature>

            <Feature
              id="basics"
              title="The basics"
              lead="True of every favpoll, whatever the occasion."
            >
              <dl className="grid max-w-4xl gap-x-10 gap-y-6 sm:grid-cols-2">
                {BASICS.map((item) => (
                  <div key={item.label}>
                    <dt className="mb-1 text-base font-medium text-foreground">
                      {item.label}
                    </dt>
                    <dd className="text-base leading-relaxed text-muted-foreground">
                      {item.body}
                    </dd>
                  </div>
                ))}
              </dl>
            </Feature>

            {/* Money and wills POINT AT About rather than restating it — the
                old by-reader sections here duplicated About#money and
                About#wills, which make those arguments properly. */}
            <Feature
              id="money"
              title="Where the money goes"
              lead="favpoll takes no fee. 100% of every pledge reaches the charity in full, and the recipient is always a registered charity — never a project fund, and never the organiser. Payments are processed by Stripe; favpoll is supported by optional contributions from guests who choose to add one."
            >
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link
                  href="/about#money"
                  className="text-base font-medium text-primary underline-offset-4 hover:underline"
                >
                  The full detail →
                </Link>
                <Link
                  href="/about#wills"
                  className="text-base font-medium text-primary underline-offset-4 hover:underline"
                >
                  Writing a favpoll into a will →
                </Link>
              </div>
            </Feature>
          </div>
        </div>
      </div>

      {/* The homepage's closing CTA, verbatim (founder, 2026-08-09). A visitor
          who skipped the homepage by following a link here should still reach
          the same place by scrolling to the bottom — same band, same brand
          statement, same button. Familiarity is the point, so this is not a
          variation on it. */}
      <section className="relative w-full bg-primary text-primary-foreground">
        <HeroTexture />
        <div className="relative mx-auto w-full max-w-330 px-6 py-16">
          <FadeIn>
            <h2 className="mb-5 max-w-2xl text-3xl font-light tracking-tight">
              {t("landing.subheader")}
            </h2>
            <Button asChild size="lg" variant="secondary">
              <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
            </Button>
          </FadeIn>
        </div>
      </section>
    </main>
  )
}
