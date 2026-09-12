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
  nav,
}: {
  children?: React.ReactNode
  /**
   * Rendered inside <header> but below the bar — the mobile menu dropdown
   * and its scrim, which must stay within the fixed, z-50 element they are
   * positioned against.
   */
  overlay?: React.ReactNode
  /** Render the hamburger as a glyph, and the logo without its link. */
  staticMenu?: boolean
  /**
   * Section name shown beside the mark on MOBILE, e.g. "For memorials" —
   * the orientation cue for a screen too narrow for `nav`.
   */
  section?: string
  /**
   * Desktop links beside the mark — the register links (2026-08-31). Hidden
   * below md, where `section` stands in.
   */
  nav?: React.ReactNode
}) {
  if (staticMenu) {
    return (
      <header data-site-chrome className="border-b border-border bg-background">
        <div className="mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <FavpollLogo />
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
          <Menu className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        </div>
      </header>
    )
  }

  return (
    <>
      <header
        // Fixed, not sticky: iOS Safari intermittently drops sticky on the
        // header, letting page content scroll over it (founder-caught
        // on-device, 2026-08-02 & 2026-09-12). Fixed is bulletproof. The
        // h-14 spacer below reserves the header's space in the flow.
        data-site-chrome
        className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background"
      >
        <div className="mx-auto flex h-14 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="favpoll home">
              <FavpollLogo />
            </Link>
            {nav && (
              <>
                <span
                  aria-hidden="true"
                  className="hidden h-4 w-px shrink-0 bg-border md:block"
                />
                <nav
                  aria-label="Kinds of favpoll"
                  className="hidden items-center gap-1 md:flex"
                >
                  {nav}
                </nav>
              </>
            )}
            {section && (
              <>
                <span
                  aria-hidden="true"
                  className={`h-4 w-px shrink-0 bg-border ${nav ? "md:hidden" : ""}`}
                />
                <span
                  className={`text-sm font-medium text-muted-foreground ${nav ? "md:hidden" : ""}`}
                >
                  {section}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">{children}</div>
        </div>
        {overlay}
      </header>
      {/* Spacer — fixed elements are removed from flow, so this reserves
          the header's 56px (h-14) height in the document. */}
      <div className="h-14" data-site-chrome />
    </>
  )
}
