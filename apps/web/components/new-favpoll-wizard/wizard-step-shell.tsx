"use client"

// The heading wears the RAIL'S TYPE — uppercase, tracking-widest, primary
// — not the rail's icon (founder, 2026-08-25, from four rendered
// variants).
//
// The heading and the rail's active label sit 14px apart vertically and
// 373px apart horizontally: level, to the eye. Repeating the mark there
// duplicates an object that is already on the same line; repeating the
// TREATMENT pairs the two without it. Colour and case carry the link, so
// the icon has no work left to do.
//
// The guidance stays, and it is the only QUESTION on the step: the rail
// line states the options ("Celebration, memorial or fundraiser."), this
// asks. Those two asking different questions is what got the heading
// removed earlier; the heading is back, the double question is not.
type Props = {
  title: string
  guidance: string
  children: React.ReactNode
}

export function WizardStepShell({ title, guidance, children }: Props) {
  return (
    <div className="flex flex-col gap-3 py-6">
      <h3 className="text-lg font-medium tracking-widest text-primary uppercase">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{guidance}</p>
      {children}
    </div>
  )
}
