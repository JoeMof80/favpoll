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
    <div className="sticky top-14 z-30 border-b border-border bg-muted print:hidden">
      <div className={cn("mx-auto max-w-330 px-4 py-2.5", className)}>
        {children}
      </div>
      {below}
    </div>
  )
}
