import { cn } from "@/lib/utils"

// The sticky controls band, standardised (founder, 2026-08-15).
//
// Three surfaces had grown their own copy of this: the public favpolls list,
// the organiser's list, and the print workspace. They agreed on most of it
// and drifted on the rest — one padded pt-3 pb-2.5, another py-3, and the
// print one was not full-bleed at all because it lived inside a page
// container.
//
// FULL BLEED, WITH THE CONTENT CENTRED. The band spans the viewport and its
// contents sit in the same max-w-330 column as the page beneath, so the rule
// under it reads as a division of the page rather than of a card. A page
// using this must NOT wrap it in its own max-width container — that is what
// stopped the print pages bleeding.
//
// top-14 is the site header's height. Everything that sticks under the header
// sticks at the same place, which is the point of doing this once.
//
// THE REGISTER WASH (founder, 2026-09-03): a pale wash of the page's
// register colour — distinct from the white header above and from any
// body below (bg-muted blended into muted-bodied pages like manage),
// and inside the ink grammar, where the pale tint is already the hover
// language (deepened /10 → /20, founder: 'a darker version of the
// register').
//
// FROSTED, NOT MERELY TINTED (founder, 2026-10-03, pointing at X's
// toolbar). The band was stacked over an opaque bg-background because a
// lone tint let scrolled content GHOST THROUGH — two of his screenshots
// ended the hero's transparent-zone experiment on 2026-09-05 for the
// same reason. Transparency was never the problem; transparency WITHOUT
// BLUR was. A tint leaves the text behind it legible, so two layers read
// at once; a backdrop blur destroys that legibility while keeping the
// colour and the movement, which is the whole of why X's reads as glass
// rather than a bug.
//
// Behind `supports-backdrop-filter:`, so a browser without it keeps
// exactly the opaque band this had before — the fallback is the old
// design, not a degraded one. iOS Safari needs the -webkit- prefix
// (Tailwind emits it) and drops backdrop-filter silently when an
// ancestor carries a transform or filter: no ToolbarBand surface does
// today, and the hero — which does — keeps its opaque band until this
// has been seen on a device.

export function ToolbarBand({
  children,
  below,
  className,
}: {
  children: React.ReactNode
  /** Full-width content under the centred row — e.g. the occasion rail. */
  below?: React.ReactNode
  className?: string
}) {
  return (
    <div className="sticky top-14 z-40 border-b border-border bg-background supports-backdrop-filter:bg-background/65 supports-backdrop-filter:backdrop-blur-md print:hidden">
      <div className="bg-primary/20">
        <div className={cn("mx-auto max-w-330 px-4 py-2.5", className)}>
          {children}
        </div>
        {below}
      </div>
    </div>
  )
}
