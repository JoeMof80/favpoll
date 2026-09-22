import { PageGround, PRIMARY_WASH } from "@/components/page-ground"
import { ShellScroller } from "@/components/shell-scroller"

type Props = {
  left: React.ReactNode
  right?: React.ReactNode
  /** The desktop app shell (2026-09-22): <main> becomes a fixed-height
      box and each column scrolls independently, so the rail reaches the
      page bottom without the sticky-rail workaround that #919 parked.
      DESKTOP ONLY — on mobile the document stays the scroller. An inner
      scroller breaks the whole mobile surface: StickyIdentityBar and
      useHideOnScroll read window.scrollY (which never fires), and every
      `sticky top-*` offset is measured from the scroller's own box, so
      the header clearance lands twice (PollSection's topic header stuck
      107px too low).
      OPT IN, not out: the favpoll page is the only surface designed for
      it. Every other PageLayout page keeps ordinary document scroll. */
  appShell?: boolean
  /** Shell mode: the rail is expanded to an equal split, so a wide
      surface (the guest book, showing comments) can be read in place
      rather than in a modal that hides the standings. */
  railExpanded?: boolean
  /** Non-shell pages only: the rail pins below the header. Destination
      pages that use the rail as a header-row element (charity facts,
      appeal facts) opt out. */
  rightSticky?: boolean
  children?: React.ReactNode
}

export function PageLayout({
  left,
  right,
  appShell = false,
  railExpanded = false,
  rightSticky = true,
  children,
}: Props) {
  const gutter = "px-6 md:px-16"
  // Shell mode: the sheet-edge gutter stays 64px, but the one facing the
  // rail divider drops to 32px so the widened rail costs the standings
  // nothing (founder, 2026-09-22). Explicit pl/pr rather than px-16 plus
  // an override — Tailwind orders generated CSS by property, so a later
  // class in the attribute is no guarantee of winning.
  const shellGutter = "px-6 md:pr-8 md:pl-16"
  const mobilePadBottom =
    "pb-[max(6rem,calc(var(--charity-footer-h,0px)+1.5rem))]"

  const rail = appShell
    ? // 376px column with pl-8/pr-16 gutters (2026-09-22). pr-16 is the
      // left column's own sheet-edge gutter, so the sheet's two outer
      // margins match. The pre-shell rail was a 300px column sitting
      // 64px off the sheet edge with a 40px gap; the shell's flush
      // 300px-including-padding column read as cramped, and 344 was
      // still narrow. The extra width comes out of the left column's
      // inner gutter (shellGutter), not its content. The gutters live on
      // the COLUMN, not the rows, so rows, dividers and the guest book's
      // scroll list all line up without each having to agree separately.
      "hidden min-h-0 flex-col divide-y divide-border overflow-y-auto border-l border-border pt-16 pr-16 pl-8 md:flex"
    : rightSticky
      ? "sticky top-14 z-10 hidden max-h-[calc(100vh-3.5rem)] flex-col space-y-4 self-start overflow-y-auto bg-background md:flex md:pt-16"
      : "hidden flex-col space-y-4 self-start md:flex md:pt-16"

  return (
    // [overflow-anchor:none] (2026-09-05): the hero band SHRINKS during
    // scroll (the about/context clips collapse), and the browser's
    // scroll anchoring compensates for layout shrink above its anchor —
    // fighting the scroll-linked collapse in discrete jumps (founder:
    // "glitching"). Anchoring off for this scroller, and for the left
    // column below, which becomes the scroller in shell mode.
    <div className="overflow-x-clip bg-primary/5 [overflow-anchor:none]">
      <PageGround color={PRIMARY_WASH} />
      <main
        // clip-path (#921) clips the drop shadow above the sheet, which
        // is otherwise visible on overscroll.
        className={[
          "mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl bg-background",
          "md:drop-shadow-lg md:[clip-path:inset(-1px_-24px_-24px_-24px)]",
          // In shell mode the gutter moves onto the left column, which is
          // the scroller — padding there keeps its scrollbar at the rail
          // divider instead of 4rem inside it.
          appShell
            ? "md:h-[calc(100vh-3.5rem)] md:min-h-0"
            : `${gutter} ${mobilePadBottom} md:pb-24`,
        ].join(" ")}
      >
        <div
          className={[
            // grid-template-columns interpolates (Chrome 107+, Safari
            // 16+), so the expand is a transition rather than a jump;
            // motion-reduce drops it to a snap.
            `grid ${
              appShell
                ? railExpanded
                  ? "md:grid-cols-2"
                  : "md:grid-cols-[1fr_376px]"
                : "md:grid-cols-[1fr_300px]"
            }`,
            appShell
              ? "md:h-full md:transition-[grid-template-columns] md:duration-300 md:ease-out motion-reduce:md:transition-none"
              : "gap-10",
          ].join(" ")}
        >
          {/* min-w-0: grid items default to min-width auto, so any wide
              intrinsic content (the rank-history chart's 520px SVG) forces
              the whole column past the viewport on phones — hero avatar
              off-screen, right margin gone (found on iOS, 2026-07-26).
              Mobile bottom padding clears the fixed charity footer by
              1.5rem when one is mounted (it publishes --charity-footer-h),
              and is the old 6rem otherwise. md:pb-0 in shell mode: the
              sticky charity footer is the scroller's last flow element
              and supplies its own end. */}
          {appShell ? (
            // ShellScroller publishes itself as the scroll root, so
            // scroll-linked children (the hero) read THIS element rather
            // than the window, which never scrolls in shell mode.
            <ShellScroller
              className={`min-w-0 ${shellGutter} ${mobilePadBottom} md:min-h-0 md:overflow-y-auto md:pb-0 md:[overflow-anchor:none]`}
            >
              {left}
            </ShellScroller>
          ) : (
            <div className="min-w-0">{left}</div>
          )}
          {right !== undefined && <div className={rail}>{right}</div>}
        </div>
        {/* Full-width tail below the grid, spanning the whole sheet
            (charity/appeal member grids). In shell mode this sits outside
            the scroller, so it carries fixed-position mobile chrome only
            — the pages with real tail content opt out of the shell. */}
        {children}
      </main>
    </div>
  )
}
