"use client"

// The ORGANISER's three steps — the landing speaks to the prospective
// organiser (three-surface model); the guest's pick → pledge → reveal arc is
// already shown by the hero demo, so it is not re-told here.
//
// Styled in the wizard triad rail's grammar (icon + tracked uppercase label +
// muted description), three columns, so the landing previews the product: the
// first screen an organiser meets after "Create a favpoll" is the wizard,
// whose rail looks exactly like this.
// Icons are deliberately NOT the rail's Award/Gift/Heart — those are
// triad-bound (Honour/Charity/Love); these steps get their own.
//
// Each step demonstrates itself with REAL components in miniature (the hero
// demo's idiom — never screenshots: they rot silently and don't theme):
//   Create → Belinda's favpoll being assembled: her hero (name, dates,
//            photo, About — the hero's primitives, statically composed)
//            beside the charity and topic cards from the wizard
//   Share  → a printed table card from the pack (BrandedQR)
//   Watch  → the real PollHeading + RankingList over the same demo data
import { Activity, PencilLine, QrCode } from "lucide-react"
import { BrandedQR } from "@/components/branded-qr"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { PollHeading } from "@/components/poll-heading"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { RankingList } from "@/components/ranking-list"
import { WizardCharityCard } from "@/components/new-favpoll-wizard/wizard-charity-card"
import { WizardTopicCard } from "@/components/new-favpoll-wizard/wizard-topic-card"
import type { Charity, Favourite } from "@favpoll/types"

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
    label: "Watch",
    body: "Live rankings, a reveal waiting for each guest, and 100% to your charities at close.",
  },
]

// ── Demo data — mirrors the hero demo's Belinda · Colour · Marie Curie scene
// so the landing tells one story throughout. ──────────────────────────────────

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

const DEMO_CHARITY: Charity = {
  id: "how-demo-charity",
  name: "Marie Curie",
  description: null,
  logo_url: null,
  registered_number: "207994",
  created_at: "2026-01-01T00:00:00Z",
}

const DEMO_ABOUT =
  "A headmistress for forty-one years with a gift for knowing every pupil's name. She had a signature colour that she loved."

const DEMO_TOPIC = {
  topicId: "how-demo-topic",
  title: "Colour",
  isCustom: false,
  items: [],
  customLabels: [],
}

const VIGNETTE_CARD =
  "pointer-events-none select-none overflow-hidden rounded-xl border border-border bg-background"

const noop = () => {}

export function HowItWorksThreeBeat() {
  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-8">
      {/* ── Create — Belinda's favpoll being assembled ── */}
      <Step step={STEPS[0]}>
        <div aria-hidden="true" className={`${VIGNETTE_CARD} relative h-72`}>
          {/* One scaled canvas: her page taking shape, then the wizard's
              charity + topic cards, cropped with a fade — there's more. */}
          <div className="w-[560px] origin-top-left scale-[0.62] space-y-6 p-6">
            {/* Belinda's hero, static — the real FavpollHero is a live
                scroll organism (HeroLayout fades the dates and slides the
                About under its sticky header once the page has scrolled),
                so the vignette recomposes the same primitives without the
                choreography: real eyebrow, real avatar, the hero's own type
                classes. */}
            <div className="flex items-start gap-6">
              <div className="min-w-0 flex-1">
                <SectionEyebrow
                  variant="muted"
                  className="flex h-8 items-center"
                >
                  In memory of
                </SectionEyebrow>
                <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight text-foreground">
                  Belinda Hartley
                </h1>
                <p className="mt-2 text-xl font-normal text-primary">
                  1945 – 2024
                </p>
                <p className="mt-4 line-clamp-2 text-base leading-relaxed text-muted-foreground">
                  {DEMO_ABOUT}
                </p>
              </div>
              <ProtagonistAvatar
                name="Belinda Hartley"
                photoUrl="/demo/belinda.jpg"
              />
            </div>
            <WizardCharityCard
              charities={[DEMO_CHARITY]}
              onEdit={noop}
              onRemove={noop}
              onPickAnother={noop}
            />
            <WizardTopicCard
              topic={DEMO_TOPIC}
              sortedExistingItems={DEMO_ITEMS}
              customLabels={[]}
              showItemsSection
              onEdit={noop}
              onRemove={noop}
              onOpenItemsDialog={noop}
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
        </div>
      </Step>

      {/* ── Share — a table card from the printable pack ── */}
      <Step step={STEPS[1]}>
        <div
          aria-hidden="true"
          className={`${VIGNETTE_CARD} flex h-72 items-center justify-center bg-primary/5`}
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
      </Step>

      {/* ── Watch — the poll answering its question, live ── */}
      <Step step={STEPS[2]}>
        <div
          aria-hidden="true"
          className={`${VIGNETTE_CARD} h-72 space-y-4 p-5`}
        >
          <PollHeading topicTitle="Colour" size="md" />
          <RankingList
            initialItems={DEMO_ITEMS}
            favpollPollId="how-demo"
            topicId="how-demo-topic"
          />
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
      {children}
    </div>
  )
}
