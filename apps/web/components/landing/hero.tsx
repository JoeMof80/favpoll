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
  /** Band override, e.g. "bg-memorial text-memorial-foreground". */
  bandClassName?: string
  /** Register accent for the demo's leader bar — see DemoCard. */
  accentBarClassName?: string
  /**
   * REVERSIBLE V1 (founder, 2026-08-04): the Goodstack-style register
   * router replaces the demo column — the demos now live on the register
   * pages. Remove the prop on the home page to restore the demo hero.
   */
  router?: boolean
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
const ROUTER_CARDS = [
  {
    kind: "memorial" as const,
    href: "/memorials",
    bar: "bg-memorial-on-band",
    title: t("home.router.memorials.title"),
    body: t("home.router.memorials.body"),
    topic: "flower",
    more: "+9 more flowers",
    charity: "Marie Curie",
    total: "£1,005",
    results: [
      { label: "Sweet pea", amount: "£350", widthPercent: 100 },
      { label: "Daffodil", amount: "£220", widthPercent: 63 },
      { label: "Rose", amount: "£165", widthPercent: 47 },
    ],
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
  bandClassName,
  accentBarClassName,
  router = false,
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
          "relative mx-auto grid w-full max-w-87 gap-8 px-0 py-10 sm:max-w-100 md:max-w-330 md:px-6",
          router
            ? // ROW (founder, 2026-08-05): statement on top, three doors
              // across the bottom. The cards don't change size doing this —
              // each was already a third of the container — so this is purely
              // a restacking, and above md the band's min-height governs, so
              // the hero height is identical at 1440 and up. py is a floor,
              // not a look: the content is centred inside the min-height, so
              // it only shows on a short viewport, where it buys the fit.
              "md:grid-cols-1 md:gap-y-8 md:py-8"
            : // COLUMN: the demo hero the register pages mount — the demo
              // card is 400px, so the last-of-three column still holds it.
              "md:grid-cols-[1fr_calc((100%-4rem)/3)] md:grid-rows-[auto_auto] md:items-center md:gap-x-12 md:gap-y-8 md:py-12"
        )}
      >
        {/* Pitch (headline + CTA). Stats are a separate cell below, so on
            mobile the demo comes right after the pitch. */}
        <div className={cn(!router && "md:col-start-1 md:row-start-1")}>
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
              "mb-6 max-w-3xl text-4xl leading-[1.12] font-light tracking-tight md:text-5xl",
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
              router ? "max-w-2xl" : "max-w-md"
            )}
          >
            {subheader ?? t("landing.subheader")}
          </p>
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
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="lg"
                variant="secondary"
                className="h-11 px-6 text-base"
              >
                <Link href="/favpolls/new">
                  {withQuietTail(ctaLabel ?? t("landing.cta.primaryFree"))}
                </Link>
              </Button>
              {/* ONLY WHERE THE LABEL DOES NOT CARRY IT (founder, 2026-08-18).
                  Home's button now says "always free" itself, so a caption
                  beside it would state the same fact twice in one row. The
                  register pages keep it: their labels are already 28
                  characters ("Create a celebration favpoll") and appending the
                  promise makes 41, which is no longer a button.

                  It stays BESIDE, never beneath (measured 2026-08-06,
                  re-measured 08-18). Below costs ~16px, the LEFT column sets
                  the hero's height, and the hero is already 1px past the fold
                  at 1280x800 — which is the fit #524 worked for. "Free to
                  create" only: the short form is the one that doesn't wrap at
                  390. */}
              {ctaLabel && (
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
                a hope. The register pages already carry their own
                cta.secondary and their own demo, so they are unchanged.
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
                hover wash. Padding drops 6 -> 3 with the border, so the wash
                hugs the words instead of blooming a pill-sized box around
                them, and h-11 stays so the two CTAs share a baseline. */}
            {router && (
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="h-11 px-3 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground has-data-[icon=inline-end]:pr-3"
              >
                {/* The arrow says WHERE it goes (founder, 2026-08-17): every
                    other button on this page navigates, and this one scrolls
                    the reader down the same page — which is a different
                    promise, and the only one a visitor can be disappointed by
                    if they expect a new page. */}
                <Link href="#how">
                  {t("landing.cta.secondary")}
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
            !router && "md:col-start-2 md:row-span-2 md:row-start-1"
          )}
        >
          {router ? (
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
                <div className="h-108 w-[19.4rem] sm:h-[34.8rem] sm:w-100">
                  <div className="h-174 w-125 origin-top-left scale-[0.62] text-foreground sm:scale-80">
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
                  className="mt-3 flex w-[19.4rem] items-center justify-start gap-4 sm:w-100 md:justify-center"
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
