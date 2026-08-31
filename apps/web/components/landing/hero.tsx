"use client"

// Landing hero: purple band with monogram shimmer texture (eyebrow retired
// carrying the breadth (any occasion, or none), one fixed universal headline
// naming the mechanic the demo enacts, a kind nav to jump the demo, and the
// live animated demo card in a browser-style frame (traffic lights signal that
// it's a demo). The card renders at full logical size and is optically scaled
// to 80%. Register/occasion signals live in the kind nav + the demo content —
// nothing in the pitch column cycles.
import Link from "next/link"
import { useMemo } from "react"
import { ArrowDown } from "lucide-react"
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
import { DemoFrame } from "@/components/hero-demo-panel/demo-frame"
import {
  PhoneFrame,
  PHONE_SCALE,
  PHONE_SCALED_BOX,
} from "@/components/hero-demo-panel/phone-frame"
import { NAV_TABS, SCENES } from "@/components/hero-demo-panel/scenes"
import type { HeroScene, SceneKind } from "@/components/hero-demo-panel/scenes"
import { Button } from "@/components/ui/button"
import { RankingBar } from "@/components/ui/ranking-bar"
import { cn } from "@/lib/utils"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"
import { useDemoLoop, beatForPhase } from "./use-demo-loop"
import { CountUp } from "./count-up"
import { HeroTexture } from "./hero-texture"

const BEATS = ["Pick", "Pledge", "Reveal"] as const

// NO ICONS BESIDE THE BEATS (founder, 2026-08-17, after trying them). The
// headline was never the confusing part of this hero — pick, give and see are
// already plain — so glyphs beside them decorated three clear verbs while the
// actual gap (nothing says what a favpoll IS before the button asks you to
// create one) went untouched. They also added a fourth object to a band that
// already carries three router cards, and broke the h1's clean left edge,
// which is the whole mechanism of a poster.
//
// This was the second attempt to answer that gap with pictures — HeroBeats,
// three stills under the headline, failed the same way earlier the same day.
// Two failures with the same shape: the hero can show what HAPPENS as many
// ways as it likes, and no picture of a mechanic says what the thing is.
// What did work was verbal and structural — the "See how it works" secondary
// CTA, which offers the explanation rather than hoping visitors scroll.

type Props = {
  liveCount?: number
  totalLive?: number
  /** Register pages: the stats row is home-flavoured — hide it. */
  hideStats?: boolean
  /** Optional eyebrow above the headline (home has none). */
  eyebrow?: string
  /** Register landing v2 (2026-08-03): play ONLY this kind's scenes on a
   *  loop and hide the kind nav — the page IS the kind. Home omits it. */
  sceneKind?: SceneKind
  /**
   * Play exactly THIS scene, rather than every scene of a kind.
   *
   * Needed the moment a register gained a second scene (2026-08-28):
   * /celebrations has both Poppy's birthday and Alex & Jordan's wedding, and
   * `sceneKind` filters to BOTH — so useDemoLoop would cycle them, which a
   * page asking for `still` plainly does not want. One scene in, nothing to
   * cycle to.
   */
  scene?: HeroScene
  /** Copy overrides — literal strings (t() stays statically typed at the
   *  call site). Defaults = the home landing's keys. */
  headline?: string
  subheader?: string
  ctaLabel?: string
  /**
   * Label for the second, quieter path. Home supplies its own via `router`;
   * a register page passes its own string.
   */
  ctaSecondaryLabel?: string
  /** Band override — the default is the page palette's primary. */
  bandClassName?: string
  /**
   * REVERSIBLE V1 (founder, 2026-08-04): the Goodstack-style register
   * router replaces the demo column — the demos now live on the register
   * pages. Remove the prop on the home page to restore the demo hero.
   */
  router?: boolean
  /**
   * Show the scene as a STILL PHONE instead of the looping browser demo.
   *
   * /memorials is a forwarding artefact — a celebrant sends it to a family
   * — and a looping demo is the wrong first note for it, as well as being
   * the homepage's demo told a second time (founder, 2026-08-26). A still
   * at phase "reveal" says the same thing once, in the state a guest is
   * left holding, and the reveal is what a memorial favpoll is FOR.
   *
   * PhoneFrame at the shared PHONE_SCALE, so this handset and the one in
   * the homepage's guest arc are the same size.
   */
  still?: boolean
  /** Extra pitch-column content, under the subheader. */
  children?: React.ReactNode
}

// Each card WEARS its register's palette (data-register, 2026-08-30): its
// dot and bars are that palette's --chart-4 — light enough to read on the
// deep default band in light, deep enough on the pale band in dark — and in
// dark its ink is the register colour. The retired accent tokens did this by
// hand for one purple band; the palette does it for any.
//
// Each card carries its OWN miniature poll rather than reading the register's
// demo scene (founder, 2026-08-05): the topic has to be synonymous with the
// register at a glance — flower/cake/biscuit — and the scenes are authored
// stories whose topics serve their own reveal (the memorial scene turns on
// Belinda's favourite COLOUR, which its reveal quote names). The card is a
// signpost, not a rerun of the page's story. Charities are short by design:
// the row sits beside the total at a third of the container's width.
// DERIVED, not retyped (2026-08-26). This card carried Marie Curie and
// "£1,005" — Belinda Hartley's charity and her exact total — with results
// of £350 / £220 / £165 at 100 / 63 / 47%, which are her top three to the
// pound and the percent. Only the LABELS had drifted, from her colours to
// flowers, and the comment below still said "scene-sourced". So the card
// was always meant to be her favpoll.
//
// It matters because this card opens /memorials, and that page now shows
// her printed card, her reveal and her keepsake. One favpoll runs from
// the homepage through every object on the page; a flower poll here broke
// it at the first click.
//
// All three are derived now (2026-08-28) — see FUNDRAISER_SCENE below for the
// last one.
const MEMORIAL_SCENE = SCENES.find((s) => s.kind === "memorial") ?? SCENES[0]
const MEMORIAL_RESULTS = MEMORIAL_SCENE.results.slice(0, 3)
const MEMORIAL_TOPIC = MEMORIAL_SCENE.poll.topic.title.toLowerCase()

// DERIVED NOW, like the memorial above (2026-08-28). The comment below used
// to end "The other two cards are still literals... unchecked" — and the
// celebration one had indeed drifted: it showed cake and Barnardo's while
// /celebrations showed Poppy's ice cream and Great Ormond Street. Same total,
// different everything else.
//
// Derived, the card follows the scene wherever it goes — which it promptly
// did, twice in a day: cake became holiday destinations, and Barnardo's
// became WWF. Neither needed an edit here, which is the point.
const WEDDING_SCENE =
  SCENES.find((s) => s.occasion_type === "Wedding") ?? SCENES[0]
const WEDDING_RESULTS = WEDDING_SCENE.results.slice(0, 3)
const WEDDING_TOPIC = WEDDING_SCENE.poll.topic.title.toLowerCase()

// AND THE THIRD (2026-08-28), which the comment above had flagged as
// "unchecked" — rightly. It showed Hobnobs and Macmillan, but its total was
// "£810" and its bars £240 / £190 / £150 at 100 / 79 / 63%: Marcus Bell's
// total and his top three to the pound and the percent, the same signature
// the memorial card carried under its flowers. It was always his favpoll;
// only the labels and the charity had drifted.
//
// Now that /fundraisers opens on his marathon and runs it through the poster,
// the reveal, the display and the keepsake, a biscuit poll here broke that
// chain at the first click — exactly as the flowers and the cake did.
//
// Found by kind, unambiguously: he is the only "fundraiser" scene, where the
// faceless cause carries kind "cause".
const FUNDRAISER_SCENE =
  SCENES.find((s) => s.kind === "fundraiser") ?? SCENES[0]
const FUNDRAISER_RESULTS = FUNDRAISER_SCENE.results.slice(0, 3)
const FUNDRAISER_TOPIC = FUNDRAISER_SCENE.poll.topic.title.toLowerCase()

const ROUTER_CARDS = [
  {
    kind: "celebration" as const,
    href: "/celebration",
    title: t("home.router.celebrations.title"),
    body: t("home.router.celebrations.body"),
    topic: WEDDING_TOPIC,
    more: `+${WEDDING_SCENE.poll.topic.favourites.length - WEDDING_RESULTS.length} more ${WEDDING_TOPIC}s`,
    charity: WEDDING_SCENE.charities[0]?.name ?? "",
    total: WEDDING_SCENE.total,
    results: WEDDING_RESULTS,
  },
  {
    kind: "fundraiser" as const,
    href: "/fundraiser",
    title: t("home.router.fundraisers.title"),
    body: t("home.router.fundraisers.body"),
    topic: FUNDRAISER_TOPIC,
    more: `+${FUNDRAISER_SCENE.poll.topic.favourites.length - FUNDRAISER_RESULTS.length} more ${FUNDRAISER_TOPIC}s`,
    charity: FUNDRAISER_SCENE.charities[0]?.name ?? "",
    total: FUNDRAISER_SCENE.total,
    results: FUNDRAISER_RESULTS,
  },
  {
    kind: "memorial" as const,
    href: "/memorial",
    title: t("home.router.memorials.title"),
    body: t("home.router.memorials.body"),
    topic: MEMORIAL_TOPIC,
    // Naive plural, correct for "colour" and for every topic title in the
    // seed that this card could show. A topic whose plural is irregular
    // would need the noun back as a literal.
    more: `+${MEMORIAL_SCENE.poll.topic.favourites.length - MEMORIAL_RESULTS.length} more ${MEMORIAL_TOPIC}s`,
    charity: MEMORIAL_SCENE.charities[0]?.name ?? "",
    total: MEMORIAL_SCENE.total,
    results: MEMORIAL_RESULTS,
  },
] as const

// The promise, set quieter than the action it qualifies (founder,
// 2026-08-18: "can we style the '- always free' text slight differently?").
//
// SPLIT HERE, NOT IN messages/. The label stays ONE string so a locale pass
// sees "Create a favpoll — always free" whole rather than two fragments it
// has to reassemble in the right order — the same reasoning the retired
// {next} token carried. Anything without the separator, which is every
// register page's own ctaLabel, comes back untouched.
//
// opacity-80, NOT lower. Measured on the rendered pixels rather than eyeballed
// — the tokens are oklch, so blending them by hand gets the wrong answer — and
// the tail is 14px, which WCAG treats as normal text needing 4.5:1. Against
// this button: 0.65 gives 3.3, 0.75 gives 4.13, 0.8 gives 4.63. The first two
// look right and fail. The head sits at 7.34, so the two still read as
// different weights.
function withQuietTail(label: string) {
  const [head, ...rest] = label.split(" — ")
  if (!rest.length) return label
  return (
    <>
      {head}
      <span className="text-sm font-normal opacity-80">
        {" — "}
        {rest.join(" — ")}
      </span>
    </>
  )
}

export function LandingHero({
  liveCount = 0,
  totalLive = 0,
  hideStats = false,
  eyebrow,
  sceneKind,
  scene: sceneOverride,
  headline,
  subheader,
  ctaLabel,
  ctaSecondaryLabel,
  bandClassName,
  router = false,
  still = false,
  children,
}: Props) {
  const scenes = useMemo(
    () =>
      sceneOverride
        ? [sceneOverride]
        : sceneKind
          ? SCENES.filter((s) => s.kind === sceneKind)
          : SCENES,
    [sceneKind, sceneOverride]
  )
  const { scene, phase, barWidths, fading, prefersReducedMotion, goToScene } =
    useDemoLoop(scenes)
  const beat = beatForPhase(phase)

  return (
    <section
      className={cn(
        // Full-screen band (founder, 2026-08-05): the hero fills the
        // viewport below the h-14 nav, content vertically centred —
        // min-h, not h, so short phones never clip.
        // min-h, not h, so short phones never clip. EVERY variant fills the
        // screen, stills included: the slab of empty band under the still
        // was never this — it was the phone's box laying out at its
        // unscaled 868px (see PHONE_SCALED_BOX). Fix the box and min-h does
        // what it does on the home page, with items-center holding the
        // content in the middle of it.
        "relative flex min-h-[calc(100vh-3.5rem)] items-center",
        bandClassName ?? "bg-primary text-primary-foreground"
      )}
    >
      <HeroTexture />
      {/* Both layouts put the cards on the page's three-column rhythm: the
          row uses grid-cols-3 with the same 2rem gutter as the three-beat
          band below, and the demo column uses calc((100%-4rem)/3) — the same
          402.7px, right-aligned to the container. At the original 44rem the
          cards covered 35% of the band on a 1440 laptop and read as white
          slabs; a third of the container is the fix. */}
      <div
        className={cn(
          // ONE LEFT RAIL WITH THE REST OF THE PAGE (founder, 2026-08-18: "do you
          // think it would be better if the hero content lined up with the
          // favpoll brand text?").
          //
          // It did not line up with anything. Below md the hero was CENTRED by
          // a max-width with no padding, so its rail was (viewport - 348) / 2
          // and drifted with the screen, while the header logo and every
          // section on the page sit at a fixed 24:
          //
          //   390   header 24   sections 24   hero 21
          //   430   header 24   sections 24   hero 41
          //   700   header 24   sections 24   hero 150
          //
          // On a desktop it happened to land on 24, which is why it read as
          // deliberate. Padding it like everything else pins it at 24 at every
          // width, and md:max-w-330 still governs above.
          //
          // The cost, accepted: between 640 and 767 the content is no longer
          // capped at 400, so the router cards stretch to the full padded
          // width. That is what every other band does there, and md brings the
          // two-column layout in at 768 regardless.
          "relative mx-auto grid w-full gap-8 px-6 py-10 md:max-w-330",
          router
            ? // ROW (founder, 2026-08-05): statement on top, three doors
              // across the bottom. The cards don't change size doing this —
              // each was already a third of the container — so this is purely
              // a restacking, and above md the band's min-height governs, so
              // the hero height is identical at 1440 and up. py is a floor,
              // not a look: the content is centred inside the min-height, so
              // it only shows on a short viewport, where it buys the fit.
              "md:grid-cols-1 md:gap-y-8 md:py-8"
            : still
              ? // STILL: ONE ROW. The demo layout is grid-rows-[auto_auto]
                // with the media spanning both, which works when the stats
                // occupy row 2. A register page hides the stats, so row 2 is
                // empty, the pitch sits in row 1 alone, and items-center
                // centres it against nothing — every pixel of slack fell
                // below the text while the phone ran on past it. One row
                // makes the two columns siblings, so they centre against
                // each other. The media track is `auto`: the phone is a
                // fixed chassis and must not be squeezed by a 1fr share.
                "md:grid-cols-[1fr_auto] md:items-center md:gap-x-12 md:py-12"
              : // COLUMN: the demo hero the register pages mount — the demo
                // card is 400px, so the last-of-three column still holds it.
                // minmax, NOT the bare third (2026-08-22). The demo card is a
                // FIXED 400px and a grid item cannot shrink below its
                // min-content, so whenever a third of the container came to
                // less than 400 — which is every width below about 1300 — the
                // column refused to shrink and the whole PAGE grew instead.
                // Measured before: +157px of horizontal scroll at 768, +72 at
                // 1024, +20 at 1180, on all three register pages.
                // The floor is the card's own width; above ~1300 the third is
                // wider and takes over, so the three-column rhythm the original
                // was reaching for is unchanged where it was ever achieved.
                "md:grid-cols-[1fr_minmax(25rem,calc((100%-4rem)/3))] md:grid-rows-[auto_auto] md:items-center md:gap-x-12 md:gap-y-8 md:py-12"
        )}
      >
        {/* Pitch (headline + CTA). Stats are a separate cell below, so on
            mobile the demo comes right after the pitch. */}
        <div
          className={cn(
            "min-w-0",
            !router && !still && "md:col-start-1 md:row-start-1"
          )}
        >
          {/* Single, register-agnostic headline — names the three-beat
              mechanic the demo plays out; the subheader carries the soul.
              Each sentence takes its own line so the triad never wraps
              mid-beat. */}
          {eyebrow && (
            <p className="mb-4 text-xs font-medium tracking-widest uppercase opacity-80">
              {eyebrow}
            </p>
          )}
          {/* In row mode the headline has the whole band to itself, so it
              scales up to hold that width — otherwise the pitch fills the
              left 40% and leaves ~700px of empty purple beside it. The 6xl
              step waits for 2xl: at 1280–1440 the extra 40px of line height
              is the difference between the hero fitting a laptop and not.

              max-w-3xl in BOTH modes (2026-08-06) — a partial win, recorded
              honestly. It buys /fundraisers a line back (4 → 3) and costs
              nothing anywhere, but it does NOT give the register pages home's
              beats-never-wrap poster. Measured: the register first-beats need
              784 / 773 / 788px at 48px type against a 768px cap, so they were
              only just overshooting; but the binding constraint below 1280 is
              the demo layout's pitch COLUMN, which is 795px at 1280 and 624px
              at 1024. No cap fixes 624. Home's beats are 404–427px — half the
              width — which is why the poster works there and not here. If the
              register headlines should hold one line, that is a COPY change
              (shorter first beats), not a layout one. */}
          <h1
            className={cn(
              "mb-6 text-4xl leading-[1.12] font-light tracking-tight md:text-5xl",
              // EXPERIMENT (2026-08-26): register headlines capped so every
              // beat wraps to exactly two lines — 446-595px is the window
              // where the widest beat (892) does not reach three and the
              // narrowest (595) does not stay on one.
              sceneKind ? "max-w-xl" : "max-w-3xl",
              router && "2xl:text-6xl"
            )}
          >
            {(headline ?? t("landing.headline"))
              .split(". ")
              .map((sentence, i, all) => (
                <span key={sentence} className="block">
                  {sentence}
                  {i < all.length - 1 ? "." : ""}
                </span>
              ))}
          </h1>
          <p
            className={cn(
              "mb-8 text-lg leading-relaxed opacity-80",
              // The subheader must not be WIDER than the headline above it.
              sceneKind ? "max-w-xl" : router ? "max-w-2xl" : "max-w-md"
            )}
          >
            {subheader ?? t("landing.subheader")}
          </p>
          {children}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3.5">
            {/* The hero's only conversion action under a display headline —
                poster-scale, not form-scale (founder call, 2026-07-28) */}
            {/* The caption is GROUPED with the primary, not trailing the row
                (founder, 2026-08-18: "the free to create label is in the wrong
                place now"). It was written when the hero had one button and it
                simply followed it; the second CTA landed between them, so
                "Free to create" ended up reading as a note about SEEING HOW IT
                WORKS — which is not a thing anyone creates. Proximity is the
                whole fix: a tighter gap inside the pair than the row's own
                gap, so the eye binds it to the button it describes. 8px
                inside against 20px between: at 10 against 14 the pair did not
                read as a pair, it read as three things evenly spaced. */}
            {/* flex-wrap so the pair can BREAK on a narrow phone (2026-08-22).
                Grouping the caption with its button fixed the referent, but a
                group that cannot wrap is a single unbreakable 306px unit — and
                /celebrations has the longest label of the three registers
                ("Create a celebration favpoll"), so it alone pushed a 320px
                phone sideways by 10px. Wrapped, the caption drops under the
                button and stays attached to it, which is all the grouping was
                ever for. */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                asChild
                size="lg"
                variant="secondary"
                // WRAPPING, WHICH TAKES FOUR CLASSES, NOT ONE (2026-08-27).
                // The register labels were 25-28 characters and carrying the
                // promise makes the longest 42 — a 356px button inside a
                // 272px content column on a 320px phone. Measured: the page
                // went sideways on all three registers.
                //
                // whitespace-normal alone did nothing, and the reason is worth
                // recording: Button is `shrink-0`, so a flex item that is
                // allowed to wrap still never gets narrow enough to. `shrink`
                // restores flex-shrink:1. And the label is TWO flex items —
                // the head as an anonymous one, withQuietTail's span as the
                // other — so without flex-wrap they stay side by side and each
                // wraps internally into a pair of narrow columns. flex-wrap
                // drops the quiet tail to its own line instead. h-auto with
                // min-h-11 lets the button grow for it while keeping the 44px
                // tap target at every width that still fits one line, which is
                // 390 up.
                className="h-auto min-h-11 shrink flex-wrap px-6 py-2 text-base whitespace-normal"
              >
                <Link href="/favpolls/new">
                  {withQuietTail(ctaLabel ?? t("landing.cta.primaryFree"))}
                </Link>
              </Button>
              {/* ONLY WHERE THE LABEL DOES NOT CARRY IT — now keyed on the
                  LABEL rather than on which page it is (founder, 2026-08-27:
                  "'free to create' should be part of the button like the
                  homepage").
                  Home has said "always free" inside its button since
                  2026-08-18; the register pages kept a caption beside theirs
                  because appending the promise to a 28-character label makes
                  42, and 42 characters was judged not a button. It fits: the
                  tail sets in withQuietTail's smaller, quieter type, and the
                  row already flex-wraps, so the longest of the three measures
                  well inside a 390px phone.
                  A label carrying a quiet tail says it itself, so a caption
                  beside it would state the same fact twice in one row. Any
                  future label without one still gets the caption. */}
              {ctaLabel && !ctaLabel.includes(" — ") && (
                <p className="text-xs opacity-80">{t("landing.cta.free")}</p>
              )}
            </div>
            {/* A SECOND PATH, HOME ONLY (founder, 2026-08-17). "Create a
                favpoll" names an invented noun, so on home it asks a
                first-time visitor to make a thing nothing has yet defined —
                unlike "Start fundraising", which names a goal the visitor
                already arrived with. ProcessOverview directly below does
                define it, and the page was relying on visitors scrolling to
                find that out. This makes the other path an offer rather than
                a hope.

                RESTORED ON THE REGISTER PAGES, 2026-08-26. This comment used
                to say they "already carry their own cta.secondary" — they
                carried the STRING and rendered nothing, so the only action in
                a register hero was "Create a memorial favpoll". Nobody four
                days into a bereavement clicks create before they have looked,
                and the register pages are where a cold visitor most often
                lands: a celebrant or a hospice forwards the link. They now
                pass their own label.
                Ghost in BAND ink — a wash and ring of the band's own
                foreground, the router cards' idiom — so it reads as the
                quieter of the two without vanishing when the theme flips.
                NO RING AT ALL (founder, 2026-08-18: "it should have no border
                or ring"). Tried at 1px, then at a 0.5px hairline, and the
                founder took it all the way off. It is a deliberate departure
                from the style guide, which puts a bordered ghost at the
                secondary tier and reserves the borderless one for quiet
                actions like cancel — worth knowing before anyone "restores"
                the border as a fix.
                It survives without one because two other things carry it: the
                arrow, which no static line of copy on this band has, and the
                hover wash, and h-11 keeps both CTAs on one baseline.

                PADDING MATCHES THE PRIMARY'S so the two LABELS start at the
                same x (founder, 2026-08-18: "their text doesn't line up
                because of the different margin"). Stacked, both boxes begin at
                the column edge, so padding alone decides where each label
                lands — at px-3 against the primary's px-6 they sat 12px apart.
                An earlier pass pulled this the other way with -ml-3, putting
                the words on the column RAIL: level with the headline, but 24px
                left of the label directly above them. Wrong reading. Two
                buttons stacked read as a pair, and a pair lines up with itself
                before it lines up with the paragraph above.

                pr-6 IS AN OVERRIDE, not a repetition of px-6. Button's lg size
                carries has-data-[icon=inline-end]:pr-2, which trims the
                trailing side when a button ends in an icon — fair for a SOLID
                button, where the eye reads the filled edge. There is no edge
                here until hover, so it only rendered the wash lopsided, 24
                left against 8 right. Same variant, same property, declared
                after, so it wins. */}
            {(router || ctaSecondaryLabel) && (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-11 px-6 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground has-data-[icon=inline-end]:pr-6"
              >
                {/* The arrow says WHERE it goes (founder, 2026-08-17): every
                    other button on this page navigates, and this one scrolls
                    the reader down the same page — which is a different
                    promise, and the only one a visitor can be disappointed by
                    if they expect a new page. */}
                <Link href="#how">
                  {ctaSecondaryLabel ?? t("landing.cta.secondary")}
                  <ArrowDown data-icon="inline-end" aria-hidden="true" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Right — live demo in a browser-style frame. Rendered at full
            logical size (nothing cropped — the real experience) and optically
            scaled: 80% on md+, 68% on phones so the same card fits a
            ~360px-wide screen. On mobile it stacks directly under the pitch,
            before the stats, so the demo is the first thing a visitor scrolls
            to. */}
        <div
          className={cn(
            !router && !still && "md:col-start-2 md:row-span-2 md:row-start-1"
          )}
        >
          {still ? (
            <div className={PHONE_SCALED_BOX}>
              <div className={cn("origin-top-left", PHONE_SCALE)}>
                <PhoneFrame>
                  <DemoCard
                    scene={scene}
                    phase="reveal"
                    barWidths={scene.results.map((r) => r.widthPercent)}
                    prefersReducedMotion
                    device="phone"
                    className="rounded-none border-0"
                  />
                </PhoneFrame>
              </div>
            </div>
          ) : router ? (
            /* Register router — one card per register, its accent as the
               top rule; the demo lives on the page each card opens. */
            <nav
              aria-label="Explore favpoll by occasion"
              className="grid gap-4 md:grid-cols-3 md:gap-8"
            >
              {ROUTER_CARDS.map((card) => (
                <Link
                  key={card.kind}
                  href={card.href}
                  data-register={card.kind}
                  className={cn(
                    // WHITE, WITH THE REGISTER AS INK (founder, 2026-08-31:
                    // "make them white with their brand colors as text,
                    // similar to how the header behaves on the white
                    // background, with tinted background on hover"). One
                    // remap does it (the register-ink utility in globals.css):
                    // inside the card --primary-foreground IS the register's
                    // --primary, so every inner class that
                    // took band ink (text-primary-foreground/75, the bars'
                    // band tone, the ring) now takes purple, magenta or
                    // green on white without being touched. Hover is the
                    // register's --accent tint, the header's ghost hover. In
                    // dark the scope's --primary is near-white and its
                    // --background the register's dark page, so the card is
                    // near-white with that as ink — the same picture,
                    // inverted the way the pages invert. Glass (2026-08-05),
                    // tinted glass and a solid band were all rendered on
                    // #588 before this. ring, not border, so nothing fights
                    // the accent's border-t-4.
                    // No accent top rule (founder, 2026-08-05) — the register
                    // reads from the card's own palette: the dot, the bars,
                    // and in dark the ink.
                    // QUIETER (founder, 2026-08-31: "too two-tone — only the
                    // headers and ranking bars should be in the branding
                    // colour"). The root keeps the ink remap for the title
                    // line and the bars; body, topic header and footer are
                    // overridden to neutral greys in light. Dark keeps the
                    // full ink scheme untouched — there the card is the
                    // near-white block with the register as ink, and the
                    // neutral tokens would vanish against it.
                    "group register-ink @container block rounded-xl bg-background p-5 text-primary-foreground shadow-sm ring-1 ring-border transition-all hover:bg-accent motion-safe:hover:-translate-y-0.5 dark:bg-primary dark:ring-primary-foreground/20 dark:hover:bg-chart-1"
                  )}
                >
                  {/* Two columns inside the card (founder, 2026-08-05):
                      the register's text one side, its poll — the
                      product's core — the other. Scene-sourced, accent
                      bars, charity + total beneath. */}
                  {/* Top-aligned (founder, 2026-08-05): the register label and
                      the topic header then share a top line across the two
                      columns. Centred, the shorter text column floated below
                      the topic header and nothing lined up.

                      A CONTAINER query, not a viewport one: the interior has
                      to answer to the CARD's width, which varies with the
                      layout and with browser zoom. Keyed to the viewport it
                      spilled — plain 1fr tracks have min-width:auto, so the
                      poll could not shrink below its 147px min-content and
                      burst the card by up to 69px between 768 and 950px (and
                      at zoom, which is how this was found). minmax(0,…) stops
                      the burst; the 21rem threshold stacks the interior
                      before the columns get too mean to read. */}
                  <div className="flex h-full flex-col gap-5 @min-[21rem]:grid @min-[21rem]:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] @min-[21rem]:items-start">
                    <div>
                      {/* The register accent is a DOT, not the ink (the
                          matrix's grammar). Measured 2026-08-05: as text the
                          accents fail on every surface we have — gold on the
                          old white card was 2.14:1, and blue on the dark
                          theme's purple card 1.95:1. As a dot beside full
                          band ink the register still reads and the label is
                          legible. */}
                      {/* Inline, not a flex child: "Fundraisers & causes"
                          wraps to two lines in this column, and a flex dot
                          centres itself across both. Inline keeps it on the
                          first line where it reads as a bullet. */}
                      {/* leading-5 + mb-1.5 puts this column on the poll's
                          rhythm (founder, 2026-08-05): the same 20px line box
                          as the topic header, so the two headers share a
                          baseline rather than just a top edge (12px/16px vs
                          14px/20px left them ~3px out), and the same 8px gap
                          the poll uses, so the body starts level with the
                          first ranking row. */}
                      <p className="mb-2 text-xs leading-5 font-medium tracking-widest uppercase">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle dark:bg-primary-foreground"
                          )}
                        />
                        {card.title}
                      </p>
                      <p className="text-sm leading-relaxed text-muted-foreground dark:text-primary-foreground/75">
                        {card.body}
                      </p>
                    </div>
                    {/* Stacked, the bodies run 3 or 4 lines depending on the
                        register, which left each card's poll starting at a
                        different height. mt-auto pins the poll to the foot of
                        the card so the three polls line up across the row
                        (the cards are equal height already — grid stretch).
                        Cancelled in two-column mode, where the poll is its
                        own column and must stay top-aligned with the label. */}
                    <div
                      aria-hidden="true"
                      // The band-tone bars take their label/amount ink and
                      // track from --primary-foreground, which register-ink
                      // remapped to the register colour — so the text
                      // matched the bars (founder, 2026-08-31: it
                      // shouldn't). Re-point the variable to the neutral
                      // foreground for this column in light; the bars keep
                      // their chart fill. Dark restates register-ink's own
                      // value, so nothing changes there.
                      className="pointer-events-none mt-auto space-y-1.5 select-none [--primary-foreground:var(--foreground)] @min-[21rem]:mt-0 dark:[--primary-foreground:var(--background)]"
                    >
                      {/* text-sm, a step above the register label (founder,
                          2026-08-05): the poll is the product's core, so its
                          question shouldn't be the smallest thing on the
                          card. */}
                      {/* Broken after "Favourite" on EVERY card (founder,
                          2026-08-31): left to wrap naturally, two of the
                          three topics broke and one didn't, so the first
                          ranking row started at three different heights
                          across the row. A deliberate two-line header is
                          uniform whatever the exemplar topic. The first
                          line sits quieter so the topic word leads. */}
                      <p className="pb-0.5 text-sm font-medium tracking-[0.09em] text-muted-foreground uppercase dark:text-primary-foreground/70">
                        <span className="block text-muted-foreground/55 dark:text-primary-foreground/45">
                          Favourite
                        </span>
                        {card.topic}
                      </p>
                      {card.results.map((r) => (
                        <RankingBar
                          key={r.label}
                          label={r.label}
                          amount={r.amount}
                          widthPercent={r.widthPercent}
                          barClassName="bg-chart-2 dark:bg-chart-4"
                          tone="band"
                        />
                      ))}
                      {/* The three bars are a TOP three, and the total is the
                          whole favpoll's — without this line the figures read
                          as a column that doesn't add up (£735 shown against
                          £1,005). The gap is real and correct: more items sit
                          below, and every favpoll's shared fund takes pledges
                          that attach to no favourite, so a total can never be
                          just the sum of its visible rows. */}
                      <p className="text-xs text-muted-foreground dark:text-primary-foreground/55">
                        {card.more}
                      </p>
                      {/* Where it all goes — charity + running total. No rule
                          above it (founder, 2026-08-05); the spacing carries
                          the break. */}
                      <div className="flex items-baseline justify-between gap-2 pt-1.5 text-sm">
                        {/* text-xs on the charity alone (2026-08-28). The row
                            was uniform text-sm, which held while both names
                            were short — "Marie Curie", "WWF-UK" — and broke
                            the day the fundraiser card started deriving its
                            own: "British Heart Foundation" needed 159px at
                            14px and the column gives 133–159 depending on how
                            the grid is folded, so it truncated mid-word at
                            three of five widths. At 12px it needs 136 and
                            fits at every one.
                            Truncate stays as the fallback — real charity
                            names run to "Great Ormond Street Hospital
                            Children's Charity" and nothing sizes for that —
                            but the card's own exemplar should not need it.
                            items-baseline, not items-center: two type sizes
                            on one row centre-align to nothing, and the
                            baseline is what the eye reads them along. */}
                        <span className="min-w-0 truncate text-xs text-muted-foreground dark:text-primary-foreground/70">
                          {card.charity}
                        </span>
                        <span className="shrink-0 font-medium text-foreground dark:text-primary-foreground">
                          {card.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          ) : (
            <>
              <span className="sr-only">
                Animated demonstration of how favpoll works. It cycles through
                the different kinds of favpoll automatically; use the buttons
                below to jump to one.
              </span>
              {/* Kind nav — jump the demo to a kind of favpoll, disrupting the
              auto-cycle so a visitor doesn't wait for their kind to come round. */}
              {!sceneKind && (
                <div
                  className="mb-4 flex flex-wrap justify-start gap-2 md:justify-center"
                  role="group"
                  aria-label="Preview a kind of favpoll"
                >
                  {NAV_TABS.map((tab) => {
                    const active = tab.kind === scene.kind
                    return (
                      <Button
                        key={tab.label}
                        type="button"
                        size="sm"
                        variant={active ? "secondary" : "ghost"}
                        aria-pressed={active}
                        onClick={() => goToScene(tab.sceneIndex)}
                        className={cn(
                          "rounded-full",
                          !active &&
                            "border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        )}
                      >
                        {tab.label}
                      </Button>
                    )
                  })}
                </div>
              )}
              <div
                className="transition-opacity duration-400"
                style={{ opacity: fading ? 0 : 1 }}
                aria-live="polite"
              >
                {/* A THIRD STOP BELOW 360 (2026-08-22). The card is 500 wide
                    laid out and scaled to fit a fixed box — 0.62 gives 310,
                    which is wider than the 272 a 320px phone has after the
                    page's padding, so the smallest phones scrolled sideways
                    by 14px. 0.54 gives 270 and fits. */}
                <div className="h-94 w-[16.875rem] min-[360px]:h-108 min-[360px]:w-[19.4rem] sm:h-[34.8rem] sm:w-100">
                  <div className="h-174 w-125 origin-top-left scale-[0.54] text-foreground min-[360px]:scale-[0.62] sm:scale-80">
                    <DemoFrame>
                      <DemoCard
                        scene={scene}
                        phase={phase}
                        barWidths={barWidths}
                        prefersReducedMotion={prefersReducedMotion}
                        className="rounded-t-none border-t-0"
                      />
                    </DemoFrame>
                  </div>
                </div>
                {/* Beat indicator: which of the three beats the loop is in */}
                <div
                  className="mt-3 flex w-[16.875rem] items-center justify-start gap-4 min-[360px]:w-[19.4rem] sm:w-100 md:justify-center"
                  aria-hidden="true"
                >
                  {BEATS.map((label, i) => (
                    <span
                      key={label}
                      className={`flex items-center gap-1.5 text-xs font-medium tracking-[0.07em] uppercase transition-opacity duration-300 ${
                        i === beat ? "opacity-90" : "opacity-40"
                      }`}
                    >
                      <span
                        className={`h-1 w-6 rounded-full transition-colors duration-300 ${
                          i === beat
                            ? "bg-primary-foreground"
                            : "bg-primary-foreground/30"
                        }`}
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* In row mode the stats take the cards' own three columns and gutter
            (founder, 2026-08-05), so each figure sits under a card instead of
            floating on its own spacing. The demo hero keeps the flex row —
            there the stats live in the narrow pitch column. */}
        {!hideStats && (
          <dl
            className={cn(
              "gap-y-6 border-t border-primary-foreground/20 pt-8",
              router
                ? "grid grid-cols-2 gap-x-8 md:grid-cols-3"
                : "flex flex-wrap gap-x-14"
            )}
          >
            <div>
              <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                Open favpolls
              </dt>
              <dd className="mt-1 text-3xl font-light tabular-nums">
                <CountUp
                  value={liveCount}
                  format={(n) => String(Math.round(n))}
                />
              </dd>
            </div>
            {totalLive > 0 && (
              <div>
                <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                  Raised by open favpolls
                </dt>
                <dd className="mt-1 text-3xl font-light tabular-nums">
                  <CountUp
                    value={totalLive}
                    format={(n) =>
                      formatCurrency(Math.round(n), MARKET_DEFAULTS["en-GB"])
                    }
                  />
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs font-medium tracking-widest uppercase opacity-70">
                Reaches charity
              </dt>
              <dd className="mt-1 text-3xl font-light tabular-nums">
                <CountUp value={100} format={(n) => `${Math.round(n)}%`} />
              </dd>
            </div>
          </dl>
        )}
      </div>
    </section>
  )
}
