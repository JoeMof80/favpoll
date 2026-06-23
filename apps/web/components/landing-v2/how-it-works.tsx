import { cn } from "@/lib/utils"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { Step1Preview } from "./how-it-works-step1-preview"
import { Step2Preview } from "./how-it-works-step2-preview"
import { Step3Preview } from "./how-it-works-step3-preview"
import { Step4Preview } from "./how-it-works-step4-preview"
import { Step5Preview } from "./how-it-works-step5-preview"
import { Step6Preview } from "./how-it-works-step6-preview"

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
          "Create a favpoll for someone special — a memorial, birthday, retirement, or any milestone worth celebrating.",
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
          "Once the favpoll ends, the results are locked and the total raised is confirmed. No more pledges.",
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
