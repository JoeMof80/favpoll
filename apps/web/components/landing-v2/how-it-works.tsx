import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { FavpollHeader } from "@/components/favpoll-card/favpoll-header"
import { SectionLabel } from "@/components/favpoll-card/section-label"
import { EXAMPLE } from "./example"

// ── Mini preview components ───────────────────────────────────────────────────

function PreviewCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-3",
        className
      )}
    >
      {children}
    </div>
  )
}

function Step1Preview() {
  return (
    <PreviewCard>
      <FavpollHeader
        protagonist={{ name: EXAMPLE.protagonist.name }}
        eyebrow={EXAMPLE.occasion}
        size="md"
      />
    </PreviewCard>
  )
}

function Step2Preview() {
  return (
    <PreviewCard className="space-y-2.5">
      <div>
        <div className="mb-1 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
          Charity
        </div>
        <div className="text-[15px] font-medium text-foreground">
          {EXAMPLE.charity.name}
        </div>
        <div className="text-[11px] text-muted-foreground">
          Reg. {EXAMPLE.charity.registeredNumber}
        </div>
      </div>
      <div className="border-t border-border pt-2.5">
        <SectionLabel title={EXAMPLE.topic.title} size="md" />
      </div>
    </PreviewCard>
  )
}

function Step3Preview() {
  return (
    <PreviewCard>
      <div className="mb-2 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
        Share link
      </div>
      <div className="rounded-md border border-border bg-muted px-3 py-2 font-mono">
        <span className="text-[11px] text-muted-foreground">
          favpoll.com/events/
        </span>
        <span className="text-[11px] font-medium text-foreground">
          belinda-hartley
        </span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {["WhatsApp", "Email", "QR"].map((method) => (
          <span
            key={method}
            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {method}
          </span>
        ))}
      </div>
    </PreviewCard>
  )
}

function Step4Preview() {
  const displayItems = EXAMPLE.items.slice(0, 9)
  return (
    <PreviewCard>
      <div className="mb-2 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
        Choose your favourite
      </div>
      <div className="flex flex-wrap gap-1">
        {displayItems.map((item) => (
          <span
            key={item}
            className={cn(
              "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium",
              item === EXAMPLE.selectedItem
                ? "bg-[#534AB7] text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {item}
          </span>
        ))}
        <span className="inline-flex h-6 items-center px-1 text-[11px] text-muted-foreground">
          +4
        </span>
      </div>
      <div className="mt-2.5 border-t border-border pt-2 text-[12px] text-muted-foreground">
        Pledge: <span className="font-semibold text-foreground">£10</span>
      </div>
    </PreviewCard>
  )
}

function Step5Preview() {
  return (
    <PreviewCard>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-muted-foreground">
          Poll closed
        </span>
      </div>
      <div className="mt-1 text-[12px] text-muted-foreground">
        {EXAMPLE.total} raised for {EXAMPLE.charity.name}
      </div>
    </PreviewCard>
  )
}

function Step6Preview() {
  return (
    <PreviewCard>
      <div className="mb-1.5 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
        {EXAMPLE.protagonist.name.split(" ")[0]}&apos;s reveal
      </div>
      <p className="text-[13px] leading-relaxed text-foreground italic">
        &ldquo;{EXAMPLE.reveal}&rdquo;
      </p>
    </PreviewCard>
  )
}

// ── Step data ─────────────────────────────────────────────────────────────────

type Step = {
  n: number
  title: string
  description: string
  preview: React.ReactNode
}

const PHASES: { label: string; steps: Step[] }[] = [
  {
    label: "Create",
    steps: [
      {
        n: 1,
        title: "Name the person.",
        description:
          "Create an event for someone special — a memorial, birthday, retirement, or any milestone worth celebrating.",
        preview: <Step1Preview />,
      },
      {
        n: 2,
        title: "Choose a charity and a topic.",
        description:
          "Pick the charity that receives all pledges, and a favpoll topic: their favourite colour, film, season, or anything else.",
        preview: <Step2Preview />,
      },
    ],
  },
  {
    label: "Share",
    steps: [
      {
        n: 3,
        title: "Share the link.",
        description:
          "Send it to friends, family, and colleagues. No account needed — anyone can pledge straight from the link.",
        preview: <Step3Preview />,
      },
      {
        n: 4,
        title: "Guests pledge to their favourite.",
        description:
          "Each guest picks their own favourite and makes a pledge. All funds go directly to your chosen charity.",
        preview: <Step4Preview />,
      },
    ],
  },
  {
    label: "Reveal",
    steps: [
      {
        n: 5,
        title: "The poll closes.",
        description:
          "Once the event ends, the results are locked and the total raised is confirmed. No more pledges.",
        preview: <Step5Preview />,
      },
      {
        n: 6,
        title: "Their favourite is revealed.",
        description:
          "The person's own choice is unveiled. Discover who matched them, see the rankings, and celebrate what was raised.",
        preview: <Step6Preview />,
      },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

export function HowItWorks() {
  const totalSteps = PHASES.flatMap((p) => p.steps).length

  return (
    <div>
      {PHASES.map((phase, pi) => {
        const phaseStart = PHASES.slice(0, pi).reduce(
          (acc, p) => acc + p.steps.length,
          0
        )

        return (
          <div key={phase.label}>
            {/* Phase divider */}
            <div
              className={cn(
                "mb-8 flex items-center gap-4",
                pi > 0 ? "mt-12" : "mt-0"
              )}
            >
              <SectionEyebrow>{phase.label}</SectionEyebrow>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Steps */}
            {phase.steps.map((step, si) => {
              const globalIndex = phaseStart + si
              const isLast = globalIndex === totalSteps - 1

              return (
                <div key={step.n} className="flex gap-5">
                  {/* Step number + vertical connector */}
                  <div className="flex w-8 shrink-0 flex-col items-center">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary bg-background text-[13px] font-semibold text-primary">
                      {step.n}
                    </div>
                    {!isLast && (
                      <div className="mt-2 min-h-8 w-px flex-1 bg-border" />
                    )}
                  </div>

                  {/* Content + preview */}
                  <div
                    className={cn(
                      "grid flex-1 items-start gap-5 md:grid-cols-[1fr_220px]",
                      isLast ? "pb-0" : "pb-8"
                    )}
                  >
                    <div>
                      <h3 className="text-[17px] font-medium tracking-tight text-foreground">
                        {step.title}
                      </h3>
                      <p className="mt-1.5 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                    <div className="md:pt-0">{step.preview}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
