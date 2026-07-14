"use client"

// The ORGANISER's three steps — the landing speaks to the prospective
// organiser (three-surface model); the guest's pick → pledge → reveal arc is
// already shown by the hero demo, so it is not re-told here.
//
// Styled in the wizard triad rail's grammar (icon + tracked uppercase label +
// muted description) so the landing previews the product: the first screen an
// organiser meets after "Create a favpoll" is the wizard, whose rail looks
// exactly like this. Icons are deliberately NOT the rail's Award/Gift/Heart —
// those are triad-bound (Honour/Charity/Love); these steps get their own.
//
// Each step demonstrates itself with a REAL component in miniature (the hero
// demo's idiom — never screenshots: they rot silently and don't theme):
//   Create        → the wizard honour step, frozen mid-choice
//   Share         → a printed table card from the pack (BrandedQR)
//   It runs itself → the real RankingList over demo data
import { Activity, PencilLine, QrCode } from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { HonourStep } from "@/components/favpoll-flow/honour-step"
import { RankingList } from "@/components/ranking-list"
import type { Favourite } from "@favpoll/types"

const STEPS = [
  {
    icon: PencilLine,
    label: "Create",
    body: "Who or what it's for, the question, up to three charities. Minutes.",
  },
  {
    icon: QrCode,
    label: "Share",
    body: "One link — or the printable pack of QR posters and table cards.",
  },
  {
    icon: Activity,
    label: "It runs itself",
    body: "Live rankings, a reveal waiting for each guest, and 100% to your charities at close.",
  },
]

// Mock rankings for the "It runs itself" vignette — mirrors the hero demo's
// Belinda · Colour scene so the landing tells one story.
const DEMO_ITEMS: Favourite[] = [
  ["Purple", 350, 18],
  ["Blue", 220, 12],
  ["Red", 165, 9],
  ["Green", 120, 7],
].map(([label, pledged, count], i) => ({
  id: `how-demo-${i}`,
  topic_id: "how-demo-topic",
  label: label as string,
  all_time_pledged: pledged as number,
  all_time_count: count as number,
  is_canonical: true,
  source: "seed" as const,
  markets: ["en-GB"],
  favpoll_count: 1,
  total_pledge_count: count as number,
  created_at: "2026-01-01T00:00:00Z",
}))

const VIGNETTE_CARD =
  "pointer-events-none select-none overflow-hidden rounded-xl border border-border bg-background"

export function HowItWorksThreeBeat() {
  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-8">
      {/* ── Create ── */}
      <div className="flex flex-col gap-5">
        <StepHeader step={STEPS[0]} />
        {/* The real wizard step, frozen mid-choice and optically scaled; the
            crop at the card edge is deliberate — there's more below — and a
            fade softens the cut. */}
        <div aria-hidden="true" className={`${VIGNETTE_CARD} relative h-56`}>
          <div className="h-[420px] w-[560px] origin-top-left scale-[0.58] p-6">
            <HonourStep
              value={{
                category: "celebration",
                grouping: "individual",
                subject: "someone",
                pronoun: "she",
              }}
              onChange={() => {}}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>

      {/* ── Share ── */}
      <div className="flex flex-col gap-5">
        <StepHeader step={STEPS[1]} />
        {/* A table card from the printable pack (WatchItHappen already shows
            the bare scan-to-pledge tile — this one reads as print). */}
        <div
          aria-hidden="true"
          className={`${VIGNETTE_CARD} flex h-56 items-center justify-center bg-primary/5`}
        >
          <div className="flex -rotate-2 flex-col items-center gap-2.5 rounded-lg border border-border bg-background px-8 py-5 shadow-md">
            <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
              In memory of
            </p>
            <p className="text-sm font-medium text-foreground">
              Belinda Hartley
            </p>
            <BrandedQR value="https://favpoll.com" size={88} />
            <p className="text-[10px] text-muted-foreground">favpoll.com</p>
          </div>
        </div>
      </div>

      {/* ── It runs itself ── */}
      <div className="flex flex-col gap-5">
        <StepHeader step={STEPS[2]} />
        <div aria-hidden="true" className={`${VIGNETTE_CARD} h-56 p-5`}>
          <RankingList
            initialItems={DEMO_ITEMS}
            favpollPollId="how-demo"
            topicId="how-demo-topic"
          />
        </div>
      </div>
    </div>
  )
}

function StepHeader({ step }: { step: (typeof STEPS)[number] }) {
  const Icon = step.icon
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-6 w-6 shrink-0 text-primary" />
        <h3 className="text-lg font-medium tracking-widest text-primary uppercase">
          {step.label}
        </h3>
      </div>
      <p className="pl-8.5 text-sm leading-relaxed text-muted-foreground">
        {step.body}
      </p>
    </div>
  )
}
