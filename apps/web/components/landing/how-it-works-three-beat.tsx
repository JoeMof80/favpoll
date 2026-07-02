import { SectionEyebrow } from "@/components/ui/section-eyebrow"

const STEPS = [
  {
    n: 1,
    heading: "Introduce them.",
    body: "Write about the person being honoured — their story, their occasion — without giving away their answer. The withholding is the point.",
  },
  {
    n: 2,
    heading: "Guests pledge.",
    body: "Each guest shares their own favourite and gives to charity in your person's name. The answer is still unread.",
  },
  {
    n: 3,
    heading: "The reveal.",
    body: "Only now do guests learn what your person loved, and why. Their own voice, their own words — disclosed after the giving.",
  },
]

export function HowItWorksThreeBeat() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {STEPS.map((step) => (
        <div key={step.n} className="flex flex-col gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary text-[13px] font-medium text-primary">
            {step.n}
          </div>
          <h3 className="text-[17px] font-medium tracking-tight text-foreground">
            {step.heading}
          </h3>
          <p className="text-[14px] leading-relaxed text-muted-foreground">
            {step.body}
          </p>
        </div>
      ))}
    </div>
  )
}
