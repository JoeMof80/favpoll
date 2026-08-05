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
import { DemoCard } from "@/components/hero-demo-panel/demo-card"
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
      { label: "Sweet pea", amount: "£350", widthPercent: 78 },
      { label: "Daffodil", amount: "£220", widthPercent: 51 },
      { label: "Rose", amount: "£165", widthPercent: 38 },
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
      { label: "Victoria sponge", amount: "£210", widthPercent: 78 },
      { label: "Lemon drizzle", amount: "£175", widthPercent: 65 },
      { label: "Carrot cake", amount: "£130", widthPercent: 48 },
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
      { label: "Hobnob", amount: "£240", widthPercent: 78 },
      { label: "Digestive", amount: "£190", widthPercent: 62 },
      { label: "Custard cream", amount: "£150", widthPercent: 49 },
    ],
  },
] as const

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
              is the difference between the hero fitting a laptop and not. */}
          <h1
            className={cn(
              "mb-6 text-4xl leading-[1.12] font-light tracking-tight md:text-5xl",
              router ? "max-w-3xl 2xl:text-6xl" : "max-w-xl"
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
          <div className="flex flex-wrap items-center gap-3.5">
            {/* The hero's only conversion action under a display headline —
                poster-scale, not form-scale (founder call, 2026-07-28) */}
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="h-11 px-6 text-base"
            >
              <Link href="/favpolls/new">
                {ctaLabel ?? t("landing.cta.primary")}
              </Link>
            </Button>
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
                    "group @container block rounded-xl bg-primary-foreground/12 p-4 text-primary-foreground ring-1 ring-primary-foreground/20 backdrop-blur-md transition-all hover:bg-primary-foreground/18 motion-safe:hover:-translate-y-0.5"
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
                      className="pointer-events-none mt-auto space-y-1 select-none @min-[21rem]:mt-0"
                    >
                      {/* text-sm, a step above the register label (founder,
                          2026-08-05): the poll is the product's core, so its
                          question shouldn't be the smallest thing on the
                          card. */}
                      <p className="pb-1 text-sm font-medium tracking-[0.09em] text-primary-foreground/70 uppercase">
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
                    <div className="flex h-full flex-col rounded-xl shadow-2xl">
                      {/* Traffic-light window bar — signals this is a demo */}
                      <div
                        className="flex h-9 shrink-0 items-center gap-1.5 rounded-t-xl border border-b-0 border-border bg-muted px-3.5"
                        aria-hidden="true"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                        <span className="flex-1 text-center text-xs text-muted-foreground">
                          favpoll.com · demo
                        </span>
                        {/* Balance the dots so the label centres optically */}
                        <span className="w-9" />
                      </div>
                      <DemoCard
                        scene={scene}
                        phase={phase}
                        barWidths={barWidths}
                        prefersReducedMotion={prefersReducedMotion}
                        className="rounded-t-none border-t-0"
                      />
                    </div>
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
