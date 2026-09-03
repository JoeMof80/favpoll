import { cn } from "@/lib/utils"

// The frame every /features artefact sits in.
//
// Extracted when the page went from three artefacts to seven (founder,
// 2026-08-09). Three could each carry their own chrome; seven could not —
// the two that already existed had drifted apart (one had a border and a
// tint, one had neither and ran the full width of the content column, which
// is what made the topic picker read as too wide).
//
// A width, a tint and a border, in one place. Everything inside is decorative
// by definition: inert to pointer, hidden from the accessibility tree, and
// never the only place a fact appears — the section lead says it in words.
//
// THE VISIBLE CHROME CAME OFF (founder, 2026-09-03: "they feel
// pointless"). The register pages had already stripped the border, tint,
// radius AND the overflow-hidden per-page — the last of those because an
// invisible clip kept cutting the live display's wall shadow. What
// remains is the component's real work: the shared max-width, the
// inert/aria-hidden boundary, and the data-vignette hook the layout e2e
// asserts on. Artefacts now sit directly on the page.

export function Vignette({
  children,
  className,
  /** Wider than the default, for scenes rather than single objects. */
  wide = false,
  /** Skip the padding — for artefacts that bleed to the frame's edge. */
  bleed = false,
  /**
   * Let pointer events through. Only for vignettes that respond to hover:
   * inert and pointer-events-none both remove the subtree from hit testing,
   * so :hover stops matching and a group-hover effect silently never fires.
   * Such a vignette must manage its own inert/aria-hidden.
   */
  interactive = false,
}: {
  children: React.ReactNode
  className?: string
  wide?: boolean
  bleed?: boolean
  interactive?: boolean
}) {
  const Inner = (
    // h-full when bleeding: a fixed-height frame (the wizard's h-80) has to
    // reach its children, or their own h-full resolves against nothing.
    <div className={bleed ? "relative h-full" : "relative px-6 py-10"}>
      {children}
    </div>
  )
  return (
    <div
      // Marks the frame for the layout e2e, which asserts every section has
      // exactly one and that none has collapsed.
      data-vignette
      aria-hidden={interactive ? undefined : "true"}
      className={cn(
        "relative select-none",
        !interactive && "pointer-events-none",
        wide ? "max-w-4xl" : "max-w-2xl",
        className
      )}
    >
      {/* inert as well as pointer-events-none: the former stops focus reaching
          the real Buttons and Chips these are built from, which are genuinely
          focusable and would otherwise be tab stops that do nothing. */}
      {interactive ? (
        Inner
      ) : (
        <div inert className="h-full">
          {Inner}
        </div>
      )}
    </div>
  )
}
