import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { FadeIn } from "@/components/landing/fade-in"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import type { LiveFavpoll } from "@/lib/live-favpolls"

/**
 * The "Open right now" shelf, as the home page has carried since #—, now
 * shared with the register pages filtered to their own register (founder,
 * 2026-08-28).
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
}: {
  favpolls: LiveFavpoll[]
  title?: string
  minimum?: number
}) {
  if (favpolls.length < minimum) return null

  return (
    <section id="live" className="w-full scroll-mt-20 bg-muted">
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
          <LiveFavpollsCarousel favpolls={favpolls} />
        </FadeIn>
      </div>
    </section>
  )
}
