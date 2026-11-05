import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { FadeIn } from "@/components/landing/fade-in"
import { FavpollListCard } from "@/components/favpoll-list-card"
import type { FavpollCard } from "@/lib/favpoll-cards"
import { cn } from "@/lib/utils"

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
 * bg-muted, not bg-primary/5: real favpoll cards always sit on the brand
 * pastel, matching /favpolls and the home shelf. The fainter tint belongs to
 * the illustration vignettes.
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
  ground = "muted",
}: {
  favpolls: FavpollCard[]
  title?: string
  minimum?: number
  /** On a register page bg-muted IS the register's tint, the same one
   *  the cards' band and footer wear, so the cards vanished into the
   *  ground (founder, 2026-11-05). Those pages sit the shelf on white;
   *  home keeps the brand pastel. There is no token for "the default
   *  tint inside a register page", so this is a prop, not a class. */
  ground?: "muted" | "background"
}) {
  if (favpolls.length < minimum) return null

  return (
    <section
      id="live"
      className={cn(
        "w-full scroll-mt-20",
        ground === "muted" ? "bg-muted" : "bg-background"
      )}
    >
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
