import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { FadeIn } from "@/components/landing/fade-in"
import { FavpollListCard } from "@/components/favpoll-list-card"
import type { FavpollCard } from "@/lib/favpoll-cards"

/**
 * The "Open right now" shelf, as the home page has carried since #—, now
 * shared with the register pages filtered to their own register (founder,
 * 2026-08-28). A grid of the /favpolls cards since 2026-11-05; the embla
 * carousel of summary cards it replaced is in git before that date.
 *
 * A MINIMUM, NOT A "> 0" (founder discussion, 2026-08-28). Home renders its
 * shelf whenever there is anything at all, which is right for a page showing
 * EVERY open favpoll. A register page is showing a slice of that, and the
 * slice can be thin long after the whole is healthy: six open favpolls with
 * one memorial among them would put a single card under a plural heading,
 * on the one section whose whole claim is that things are happening.
 *
 * So it renders nothing below the threshold. Pre-launch that means the
 * section simply does not exist — no empty state to design, no seeded test
 * rows on a marketing page, and no launch-day switch to remember. It appears
 * on its own once there is something worth showing.
 *
 * White ground since 2026-11-06 (it was the brand pastel, "real favpoll
 * cards always sit on bg-muted"); the cards carry their own edges.
 */

/**
 * The register pages' floor. Home passes 1: it shows EVERY open favpoll, so
 * one is still the truth about the platform — where one memorial among six
 * open favpolls is not the truth about memorials.
 */
export const OPEN_NOW_MINIMUM = 3

export function OpenRightNow({
  favpolls,
  title = "Open right now",
  minimum = OPEN_NOW_MINIMUM,
}: {
  favpolls: FavpollCard[]
  title?: string
  minimum?: number
}) {
  if (favpolls.length < minimum) return null

  // WHITE since 2026-11-06. The shelf sat on the brand pastel, and on a
  // register page on that register's tint, where the cards vanished into
  // it (2026-11-05, a one-day prop). The founder then took the tint off
  // every surface: register as ink, never as a background.
  return (
    <section id="live" className="w-full scroll-mt-20 bg-background">
      <div className="mx-auto w-full max-w-330 px-6 py-16">
        <FadeIn>
          <div className="mb-6 flex items-baseline justify-between">
            <SectionEyebrow>{title}</SectionEyebrow>
            <Button variant="ghost" asChild>
              <Link href="/favpolls">See all →</Link>
            </Button>
          </div>
        </FadeIn>
        <FadeIn>
          {/* A sample of /favpolls in its own grid, in place of the
              summary-card carousel (founder, 2026-11-05: the flip card's
              body is the part that explains favpoll to a cold reader, and
              the home page was the one place it was hidden). Two rows:
              eight on a wide screen, four at two columns, two on the
              phone, where eight flip cards stacked would be eight screens
              of scroll before the next section. */}
          <ul
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 [&>*:nth-child(n+3)]:max-sm:hidden [&>*:nth-child(n+5)]:max-lg:hidden"
            role="list"
          >
            {favpolls.map((fp) => (
              <FavpollListCard key={fp.id} favpoll={fp} clerkUserId={null} />
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  )
}
