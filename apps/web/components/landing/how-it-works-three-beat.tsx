import { SectionEyebrow } from "@/components/ui/section-eyebrow"

// The ORGANISER's three steps — the landing speaks to the prospective
// organiser (three-surface model); the guest's pick → pledge → reveal arc is
// already shown by the hero demo, so it is not re-told here.
const STEPS = [
  {
    n: 1,
    heading: "Create.",
    body: "Who or what it's for, the question, up to three charities. Minutes.",
  },
  {
    n: 2,
    heading: "Share.",
    body: "One link — or the printable pack of QR posters and table cards.",
  },
  {
    n: 3,
    heading: "It runs itself.",
    body: "Live rankings, a reveal waiting for each guest, and 100% to your charities at close.",
  },
]

export function HowItWorksThreeBeat() {
  return (
    <div className="grid gap-8 md:grid-cols-3">
      {STEPS.map((step) => (
        <div key={step.n} className="flex flex-col gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary text-sm font-medium text-primary">
            {step.n}
          </div>
          <h3 className="text-lg font-medium tracking-tight text-foreground">
            {step.heading}
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {step.body}
          </p>
        </div>
      ))}
    </div>
  )
}
