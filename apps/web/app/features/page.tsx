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
import { WallOfFavouritesVignette } from "@/components/landing/wall-of-favourites-vignette"
import { KeepsakeVignette } from "@/components/landing/keepsake-vignette"

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
// The principle was finished on 2026-08-16 (founder): #basics and #money left
// the page entirely. Neither is a feature — the basics are the product's spec
// and now live on About (where the FAQ already carried most of them), and
// #money was a restatement of About#money with a link to itself. The page is
// now the eight features and nothing else.
//
// And it unlocks the homepage: the capability grid's six cards each have a
// section here, so they can become links. That was the reason to do it.
//
// Deliberately NOT here: Gift Aid, which is effectively confirmed but not
// contractually settled — the most attractive line this page could carry and
// the most damaging to get wrong.
//
// WHO "YOU" IS (founder question, 2026-08-17). The page addresses its reader
// as the prospective ORGANISER: every second-person verb is an organiser's
// action ("Set a target", "Run it loud", "Add the favourites yourself"), and
// guests are NAMED in the third person wherever the capability is theirs
// ("Anyone can pledge as Someone", "A guest without means draws on it",
// "the guest shares something of themselves"). Every section already obeys
// this, so it is the rule rather than an accident — and it is what lets one
// list carry both actors without "you" changing referent mid-bullet.
// "The organiser can…" was considered and rejected: it documents a third
// party TO the very reader who would be that party, repeats a subject the
// page can imply, and reads as manual rather than voice. A guest who wanders
// in still finds their own row, precisely because guest capabilities are the
// ones written in the third person.
//
// "GUEST" AND THE STANDALONE FAVPOLL (founder, 2026-08-17). "Guest" smuggles
// in a gathering, and a favpoll needs no life event — so the word is spent
// with care. The wall's record of who TOOK PART (not "who came") and the
// keepsake's "the whole of it" (not "the day") are true of a standalone
// favpoll with nobody in a room. EVENT-SHAPED features keep the event
// language, because it is accurate rather than presumptuous — stationery for
// tables and orders of service, and a display on a screen "in the room".
//
// THE REVEAL IS NOT ON THAT LIST ANY MORE (founder, 2026-08-19). It was, as
// "protagonist-bound by definition" — and it never was. The field holds any
// message; the protagonist's favourite is the strongest thing to put in it,
// not what it IS. The name asserted otherwise and every sentence about it
// paid for that, hedging into "the subject's favourite, or a special message,
// optionally". Its own home-page bullets had given the game away long before
// anyone noticed: "The final word from a loved one" and "A humorous callback
// to a speech" are messages, not favourites.
// Note "guest" ALSO has a domain meaning here — account-less pledger, as in
// guest checkout (allow_guest_items, createGuestPledge, the organiser's
// "Guest additions" toggle). That sense is register-neutral and stays.
//
// HOMEMADE TOPICS IS THE FOUNDER'S OWN COPY AND IS FINAL (2026-08-17). It
// says "guests", by his decision, and the wording is not to be rewritten —
// not to "anyone", not to a concrete example, not to an em dash. Rewriting it
// has been reverted repeatedly; leave it alone.

export const metadata: Metadata = {
  title: "Features — favpoll",
  description:
    "What a favpoll does: homemade topics, QR-coded stationery, a live display, a shared fund, the reveal, a pledge goal, a wall of favourites and a printable keepsake.",
}

const SECTIONS = [
  { id: "topics", label: "Homemade topics" },
  { id: "stationery", label: "QR-coded stationery" },
  { id: "display", label: "Live display" },
  { id: "shared-fund", label: "Shared fund" },
  { id: "reveal", label: "The reveal" },
  { id: "goal", label: "Pledge goal" },
  { id: "wall-of-favourites", label: "Wall of favourites" },
  { id: "keepsake", label: "Keepsake" },
]

function Feature({
  id,
  title,
  lead,
  bullets,
  artefact,
}: {
  id: string
  title: string
  /** One line saying what it is — the homepage card's line, elaborated. */
  lead: string
  /**
   * The specifics. A features page is scanned, not read, and each section
   * elaborates a homepage card that is itself a line plus two bullets — so
   * the same grammar with more of them makes the relationship visible
   * instead of asserted (founder, 2026-08-09).
   *
   * EVERY section carries them as of 2026-08-17 (founder). The personal
   * reveal was the last holdout, kept as prose because an argument dies as a
   * fragment — but the argument survives in its lead, and what the paragraph
   * buried underneath it (who writes the reveal, and that it is optional)
   * were facts a reader had to mine out. The lead is where this page argues;
   * the bullets are where it answers.
   */
  bullets?: string[]
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
        <p className="mb-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {lead}
        </p>
        {bullets && (
          // The capability grid's list grammar, one size up: this is the
          // reference, that is the trailer.
          <ul className="mb-6 max-w-2xl list-disc space-y-1.5 pl-5 text-base leading-relaxed text-muted-foreground marker:text-primary-muted">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
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
              title="Homemade topics"
              lead="Pick from many ready-made topics, or create your own."
              bullets={[
                "A family in-joke, a talking point, or a topic specific to the event",
                "Add missing favourites to any topic",
                "Allow guests to add favourites of their own - no account needed",
                "Hide guest-added favourites that don’t belong",
              ]}
              artefact={<TopicPickerVignette />}
            />

            <Feature
              id="stationery"
              title="QR-coded stationery"
              // The only two strings on this page that live in messages/
              // (founder, 2026-08-17): both name a PAPER SIZE, and A4 is wrong
              // the moment there is an en-US market — the A4-vs-Letter trap the
              // print-pack roadmap already carries. The rest of the page is
              // prose a locale pass has to rewrite wholesale anyway; these two
              // are a factual dependency worth flagging where translators look.
              // Any future line naming a size belongs here too.
              lead={t("features.stationery.lead")}
              bullets={[
                "Posters, cards, postcards, tent cards, place cards and labels",
                "Print whichever stationery you need for your event",
                t("features.stationery.paper"),
              ]}
              artefact={<PackVignette />}
            />

            <Feature
              id="display"
              title="Live display"
              lead="View your favpoll at a life event. Watch standings move as pledges arrive."
              bullets={[
                "Large QR codes visible from distance",
                "Tribute mode to centre the person being honoured",
                "Fundraiser mode for a telethon-style centrepiece",
              ]}
              artefact={<RoomVignette />}
            />

            <Feature
              id="shared-fund"
              title="Shared fund"
              lead="A float to help everybody take part or give without taking part."
              bullets={[
                "Give to charity without picking a favourite",
                "Give more than your favourite is worth to you. e.g. £50 for your favourite, £50 to the shared fund",
                "Help those without money take part. They can select from the shared fund at checkout",
                "Anything remaining in the shared fund goes to the charity when the favpoll closes",
              ]}
              artefact={<FundVignette />}
            />

            <Feature
              id="reveal"
              title="The reveal"
              lead="A message to be shared the moment someone has pledged, along with the standings."
              bullets={[
                "Often the subject’s own favourite but could be a message about the topic, the charity, or anything else",
                "A gift in return for sharing a favourite",
                "It could be a moment of poignance or not required at all, as set by the favpoll organiser",
              ]}
              artefact={<RevealVignette />}
            />

            <Feature
              id="goal"
              title="Pledge goal"
              lead="Set a target, and the room can watch it come."
              bullets={[
                "The bar fills as pledges land, and turns green the moment the goal is met",
                "A milestone, not a finish line — the favpoll runs to its closing date",
                "Every pledge after the goal still counts",
              ]}
              artefact={<GoalVignette />}
            />

            <Feature
              id="wall-of-favourites"
              title="Wall of favourites"
              lead="Who backed what, as it happens."
              bullets={[
                "Scrolls on the big screen through the day",
                "Reads back afterwards as a record of who took part",
                "Names and favourites only, never amounts",
                "Anyone can pledge as “Someone” instead",
              ]}
              artefact={<WallOfFavouritesVignette />}
            />

            <Feature
              id="keepsake"
              title="Keepsake"
              lead="When a favpoll closes, the whole of it becomes a single sheet to print."
              bullets={[
                "The standings, the reveal and the total raised",
                "Two ways to tell it: the person leads, or what was raised does",
                "Portrait or landscape, always one sheet",
                "No individual amounts — what people gave stays theirs",
                "The full standings and everyone who took part export as a spreadsheet",
              ]}
              artefact={<KeepsakeVignette />}
            />
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
