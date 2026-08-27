import Link from "next/link"
import { Menu } from "lucide-react"
import { FavpollLogo } from "@/components/favpoll-logo"

// The header's SHELL — the bar, its height, its border and the logo.
//
// Split out of Header (2026-08-07) so the demo card can wear the real one.
// A guest's first sight of a favpoll is the logo and a hamburger above the
// hero, and the demo had neither, which is most of why it read as "a card"
// rather than "a page on a phone". Drawing a lookalike would have been the
// third hand-copy of a real component in that file — the charity row is
// already one, and its comment still points at a path that moved.
//
// Header passes its nav and account controls as children. The demo passes
// nothing and gets `staticMenu`, because the real hamburger is a Clerk-aware
// client component with menu state, a scroll lock and an Escape handler —
// none of which belongs in a picture of a page.

export function HeaderBar({
  children,
  overlay,
  staticMenu = false,
  section,
}: {
  children?: React.ReactNode
  /**
   * Rendered inside <header> but below the bar — the mobile menu dropdown
   * and its scrim, which must stay within the sticky, z-40 element they are
   * positioned against.
   */
  overlay?: React.ReactNode
  /** Render the hamburger as a glyph, and the logo without its link. */
  staticMenu?: boolean
  /** Section name shown beside the mark, e.g. "For memorials". */
  section?: string
}) {
  return (
    <header
      // Marks this as SITE chrome for the print rule in globals.css. That
      // rule used to hide `header, footer` by element, which also hid the
      // keepsake's own <header> and <footer> — so the sheet printed with no
      // name and no brand line.
      data-site-chrome
      className={
        staticMenu
          ? "border-b border-border bg-background"
          : "sticky top-0 z-40 border-b border-border bg-background"
      }
    >
      <div className="mx-auto flex h-14 items-center justify-between px-6">
        {/* PROTOTYPE (2026-08-26): section marker beside the mark on the
            register pages. They share the home page's hero component, panel
            width, alignment and texture, so clicking a router card can read
            as "nothing happened". Names match the footer's. */}
        <div className="flex items-center gap-3">
          {staticMenu ? (
            <FavpollLogo />
          ) : (
            <Link href="/" aria-label="favpoll home">
              <FavpollLogo />
            </Link>
          )}
          {section && (
            <>
              <span
                aria-hidden="true"
                className="h-4 w-px shrink-0 bg-border"
              />
              <span className="text-sm font-medium text-muted-foreground">
                {section}
              </span>
            </>
          )}
        </div>

        {staticMenu ? (
          <Menu className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        ) : (
          <div className="flex items-center gap-2">{children}</div>
        )}
      </div>
      {overlay}
    </header>
  )
}
