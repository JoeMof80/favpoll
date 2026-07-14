"use client"

// The ORGANISER's three steps — the landing speaks to the prospective
// organiser (three-surface model); the guest's pick → pledge → reveal arc is
// already shown by the hero demo, so it is not re-told here.
//
// Styled in the wizard triad rail's grammar (icon + tracked uppercase label),
// three columns, so the landing previews the product: the first screen an
// organiser meets after "Create a favpoll" is the wizard, whose rail looks
// exactly like this. Icons are deliberately NOT the rail's Award/Gift/Heart —
// those are triad-bound (Honour/Charity/Love); these steps get their own.
//
// Each step demonstrates itself with real product idioms in miniature (the
// hero demo's approach — never screenshots: they rot silently and don't
// theme), each with a quiet hover moment (motion-safe only):
//   Create → the wizard's overlay dialogs stacked in creation order
//            (charity → topic → name → About); hover fans the deck
//   Share  → a printed table card (BrandedQR); hover straightens it and an
//            iPhone-camera-style detection frame + link pill appear
//   Watch  → PollHeading + real RankingBars; hover nudges the live standings
import { useState } from "react"
import { Eye, PencilLine, QrCode } from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { Chip } from "@/components/ui/chip"
import { PollHeading } from "@/components/poll-heading"
import { RankingBar } from "@/components/ui/ranking-bar"

const STEPS = [
  { icon: PencilLine, label: "Create" },
  { icon: QrCode, label: "Share" },
  { icon: Eye, label: "Watch" },
]

// Belinda · Colour · Marie Curie — mirrors the hero demo scene so the landing
// tells one story throughout. The About card carries the signature sentence —
// the one that sets up the demo's reveal — shown freshly typed, caret still
// blinking.
const ABOUT_SIGNATURE = "She had a signature colour that she loved."

// Watch vignette bars: rest state and the hover nudge (Blue closing in) —
// widths animate via the bar fill's transition; amounts tick alongside.
const BARS = [
  { label: "Purple", rest: [78, "£350"], live: [82, "£370"] },
  { label: "Blue", rest: [51, "£220"], live: [62, "£265"] },
  { label: "Red", rest: [38, "£165"], live: [40, "£170"] },
  { label: "Green", rest: [28, "£120"], live: [28, "£120"] },
] as const

// Rest: £855 of the £900 goal. The hover surge (bars above) sums to £925 —
// the goal is reached and the bar turns success-green, the live display's
// goal-as-milestone moment in miniature.
const GOAL = { amount: 900, rest: 855, live: 925 }

// The card itself keeps pointer events (the hover moments depend on them);
// its content is wrapped `inert` — unfocusable and untouchable.
const VIGNETTE_CARD =
  "select-none overflow-hidden rounded-xl border border-border bg-background"

// Mini overlay-dialog chrome — the wizard's field overlays in miniature.
const DIALOG =
  "absolute rounded-xl border border-border bg-background p-4 shadow-lg transition-transform duration-300"

export function HowItWorksThreeBeat() {
  const [watching, setWatching] = useState(false)

  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-8">
      {/* ── Create — the wizard's dialogs, stacked in creation order ── */}
      <Step step={STEPS[0]}>
        <div
          aria-hidden="true"
          className={`${VIGNETTE_CARD} group relative h-80 bg-primary/5`}
        >
          <div inert className="absolute inset-0">
            {/* Charity — first pick, back of the deck */}
            <div
              className={`${DIALOG} top-3 left-8 w-60 -rotate-2 motion-safe:group-hover:-translate-x-3 motion-safe:group-hover:-translate-y-2 motion-safe:group-hover:-rotate-4`}
            >
              <p className="mb-2.5 text-sm font-medium text-foreground">
                Choose a charity
              </p>
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm text-secondary-foreground">
                  M
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm text-foreground">
                    Marie Curie
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Charity no. 207994
                  </span>
                </span>
              </div>
            </div>

            {/* Topic */}
            <div
              className={`${DIALOG} top-16 left-16 w-60 rotate-1 motion-safe:group-hover:translate-x-3 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:rotate-3`}
            >
              <p className="mb-2.5 text-sm font-medium text-foreground">
                Choose a topic
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Chip readOnly selected size="sm">
                  Colour
                </Chip>
                <Chip readOnly size="sm">
                  Season
                </Chip>
                <Chip readOnly size="sm">
                  Song
                </Chip>
              </div>
            </div>

            {/* Name */}
            <div
              className={`${DIALOG} top-[7.75rem] left-10 w-64 -rotate-1 motion-safe:group-hover:-translate-x-3 motion-safe:group-hover:translate-y-1 motion-safe:group-hover:-rotate-3`}
            >
              <p className="mb-2.5 text-sm font-medium text-foreground">Name</p>
              <p className="rounded-lg border border-border px-3 py-2 text-base text-foreground">
                Belinda Hartley
              </p>
            </div>

            {/* About — last written, front of the deck */}
            <div
              className={`${DIALOG} top-[11.5rem] left-20 w-64 rotate-2 motion-safe:group-hover:translate-x-3 motion-safe:group-hover:translate-y-2 motion-safe:group-hover:rotate-4`}
            >
              <p className="mb-2.5 text-sm font-medium text-foreground">
                About
              </p>
              {/* Freshly typed: same text-box treatment as the Name card,
                  with a blinking caret at the end of the sentence. */}
              <p className="rounded-lg border border-border px-3 py-2 text-sm leading-relaxed text-foreground">
                {ABOUT_SIGNATURE}
                <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[2px] animate-caret-blink bg-foreground" />
              </p>
            </div>
          </div>
        </div>
      </Step>

      {/* ── Share — a table card from the printable pack ── */}
      <Step step={STEPS[1]}>
        <div
          aria-hidden="true"
          className={`${VIGNETTE_CARD} group flex h-80 items-center justify-center bg-primary/5`}
        >
          <div
            inert
            className="flex -rotate-2 flex-col items-center gap-3 rounded-lg border border-border bg-background px-9 py-7 shadow-md transition-transform duration-300 motion-safe:group-hover:rotate-0"
          >
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              In memory of
            </p>
            <p className="text-sm font-medium text-foreground">
              Belinda Hartley
            </p>
            {/* iPhone-camera QR detection: corner brackets + link pill fade
                in on hover. Amber accents follow the traffic-light precedent
                (demo chrome, not product UI) via the warning token. */}
            <div className="relative">
              <BrandedQR value="https://favpoll.com" size={88} />
              <div className="absolute -inset-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="absolute top-0 left-0 h-3.5 w-3.5 rounded-tl-md border-t-2 border-l-2 border-warning" />
                <span className="absolute top-0 right-0 h-3.5 w-3.5 rounded-tr-md border-t-2 border-r-2 border-warning" />
                <span className="absolute bottom-0 left-0 h-3.5 w-3.5 rounded-bl-md border-b-2 border-l-2 border-warning" />
                <span className="absolute right-0 bottom-0 h-3.5 w-3.5 rounded-br-md border-r-2 border-b-2 border-warning" />
                <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 rounded-full bg-warning px-2.5 py-1 text-[10px] font-medium whitespace-nowrap text-black shadow-sm">
                  Open “favpoll.com”
                </span>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground transition-opacity duration-300 group-hover:opacity-0">
              favpoll.com
            </p>
          </div>
        </div>
      </Step>

      {/* ── Watch — the poll answering its question, live ── */}
      <Step step={STEPS[2]}>
        <div
          aria-hidden="true"
          className={`${VIGNETTE_CARD} h-80 space-y-5 p-5`}
          onMouseEnter={() => setWatching(true)}
          onMouseLeave={() => setWatching(false)}
        >
          <div inert className="space-y-5">
            <PollHeading topicTitle="Colour" size="md" />
            <div className="space-y-3">
              {BARS.map((bar) => {
                const [pct, amount] = watching ? bar.live : bar.rest
                return (
                  <RankingBar
                    key={bar.label}
                    label={bar.label}
                    amount={amount}
                    widthPercent={pct}
                    barClassName="transition-all duration-700 ease-out"
                  />
                )
              })}
            </div>

            {/* The pledge goal — the live display's goal-as-milestone moment:
                on hover the surge tips it over and the bar turns success. */}
            <div className="border-t border-border pt-3 text-right">
              <p className="text-lg font-medium text-primary">
                £{watching ? GOAL.live : GOAL.rest}
              </p>
              <p className="text-xs text-muted-foreground">
                {watching
                  ? "raised — goal reached"
                  : `raised of the £${GOAL.amount} goal`}
              </p>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    watching ? "bg-success" : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min(100, ((watching ? GOAL.live : GOAL.rest) / GOAL.amount) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Step>
    </div>
  )
}

function Step({
  step,
  children,
}: {
  step: (typeof STEPS)[number]
  children: React.ReactNode
}) {
  const Icon = step.icon
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-6 w-6 shrink-0 text-primary" />
        <h3 className="text-lg font-medium tracking-widest text-primary uppercase">
          {step.label}
        </h3>
      </div>
      {children}
    </div>
  )
}
