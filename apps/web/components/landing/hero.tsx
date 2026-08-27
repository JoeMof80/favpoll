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
import type { SceneKind } from "@/components/hero-demo-panel/scenes"
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
  /** Band override, e.g. "bg-memorial text-memorial-foreground". */
  bandClassName?: string
  /** Register accent for the demo's leader bar — see DemoCard. */
  accentBarClassName?: string
  /** Register accent token for a still's whole card — see DemoCard. */
  accentVar?: string
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

// The cards are glass on the brand band, so every accent mark uses the
// *-on-band variant (see globals.css) — the base accents are tuned for page
// surfaces and go invisible here in one theme or the other.
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
// The other two cards are still literals. They have scenes too and could
// drift the same way — unchecked.
const MEMORIAL_SCENE = SCENES.find((s) => s.kind === "memorial") ?? SCENES[0]
const MEMORIAL_RESULTS = MEMORIAL_SCENE.results.slice(0, 3)
const MEMORIAL_TOPIC = MEMORIAL_SCENE.poll.topic.title.toLowerCase()

const ROUTER_CARDS = [
  {
    kind: "memorial" as const,
    href: "/memorials",
    bar: "bg-memorial-on-band",
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
  {
    kind: "celebration" as const,
    href: "/celebrations",
    bar: "bg-warning-on-band",
    title: t("home.router.celebrations.title"),
    body: t("home.router.celebrations.body"),
    topic: "cake",
    more: "+6 more cakes",
    charity: "Barnardo's",
    total: "£705",
    results: [
      { label: "Victoria sponge", amount: "£210", widthPercent: 100 },
      { label: "Lemon drizzle", amount: "£175", widthPercent: 83 },
      { label: "Carrot cake", amount: "£130", widthPercent: 62 },
    ],
  },
  {
    kind: "fundraiser" as const,
    href: "/fundraisers",
    bar: "bg-success-on-band",
    title: t("home.router.fundraisers.title"),
    body: t("home.router.fundraisers.body"),
    topic: "biscuit",
    more: "+8 more biscuits",
    charity: "Macmillan",
    total: "£810",
    results: [
      { label: "Hobnob", amount: "£240", widthPercent: 100 },
      { label: "Digestive", amount: "£190", widthPercent: 79 },
      { label: "Custard cream", amount: "£150", widthPercent: 63 },
    ],
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
  headline,
  subheader,
  ctaLabel,
  ctaSecondaryLabel,
  bandClassName,
  accentBarClassName,
  accentVar,
  router = false,
  still = false,
  children,
}: Props) {
  const scenes = useMemo(
    () => (sceneKind ? SCENES.filter((s) => s.kind === sceneKind) : SCENES),
    [sceneKind]
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
                    accentVar={accentVar}
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
                  className={cn(
                    // Glass, not white (founder, 2026-08-05): a translucent
                    // wash of the band's OWN foreground, so the cards sit in
                    // the hero rather than on it. Everything inside takes band
                    // ink (text-primary-foreground), which is what makes this
                    // survive the theme flip — the band inverts (purple with
                    // white ink in light, pale with purple ink in dark), and a
                    // wash of its own ink inverts with it. ring, not border, so
                    // nothing fights the accent's border-t-4.
                    // No accent top rule (founder, 2026-08-05) — the register
                    // reads from the dot and the bars.
                    "group @container block rounded-xl bg-primary-foreground/12 p-5 text-primary-foreground ring-1 ring-primary-foreground/20 backdrop-blur-md transition-all hover:bg-primary-foreground/18 motion-safe:hover:-translate-y-0.5"
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
                            "mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle",
                            card.bar
                          )}
                        />
                        {card.title}
                      </p>
                      <p className="text-sm leading-relaxed text-primary-foreground/75">
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
                      className="pointer-events-none mt-auto space-y-1.5 select-none @min-[21rem]:mt-0"
                    >
                      {/* text-sm, a step above the register label (founder,
                          2026-08-05): the poll is the product's core, so its
                          question shouldn't be the smallest thing on the
                          card. */}
                      <p className="pb-0.5 text-sm font-medium tracking-[0.09em] text-primary-foreground/70 uppercase">
                        Favourite {card.topic}
                      </p>
                      {card.results.map((r) => (
                        <RankingBar
                          key={r.label}
                          label={r.label}
                          amount={r.amount}
                          widthPercent={r.widthPercent}
                          barClassName={card.bar}
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
                      <p className="text-xs text-primary-foreground/55">
                        {card.more}
                      </p>
                      {/* Where it all goes — charity + running total. No rule
                          above it (founder, 2026-08-05); the spacing carries
                          the break. */}
                      <div className="flex items-center justify-between gap-3 pt-1.5 text-sm">
                        <span className="min-w-0 truncate text-primary-foreground/70">
                          {card.charity}
                        </span>
                        <span className="shrink-0 font-medium text-primary-foreground">
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
                        accentBarClassName={accentBarClassName}
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
