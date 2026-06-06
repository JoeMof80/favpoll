import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { HowItWorks } from "@/components/landing-v2/how-it-works"
import { OccasionEyebrow } from "@/components/landing-v2/occasion-eyebrow"
import HonourLoveCharityVenn from "@/components/landing-v2/honour-love-charity-venn"

export default function LandingV2Page() {
  return (
    <main className="flex flex-col">
      {/* ── Section 1: Hero ── */}
      <section className="border-b border-border bg-muted">
        <div className="mx-auto max-w-330 px-6">
          <div className="grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
            {/* Pitch */}
            <div>
              <div className="mb-3 h-4">
                <OccasionEyebrow />
              </div>

              <h1 className="mb-5 text-5xl leading-[1.15] font-light tracking-tight text-foreground">
                Introducing a new way to honour them.
              </h1>

              <p className="mb-8 max-w-sm text-xl leading-relaxed text-muted-foreground">
                Expressions of joy, for charitable causes, in the name of those
                we love.
              </p>

              <div className="flex items-center gap-3.5">
                <Button asChild size="lg">
                  <Link href="/events/new">Create an event</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/events">See live events →</Link>
                </Button>
              </div>
            </div>

            {/* Venn */}
            <div className="flex items-center justify-center">
              {/* <HonourLoveCharityVenn className="w-full max-w-[440px]" /> */}
              <HonourLoveCharityVenn />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: How it works ── */}
      <section className="border-b border-border py-20">
        <div className="mx-auto max-w-330 px-6">
          <SectionEyebrow className="mb-2">How it works</SectionEyebrow>
          <h2 className="mb-14 text-3xl font-light tracking-tight text-foreground">
            From idea to impact in six steps.
          </h2>
          <HowItWorks />
        </div>
      </section>

      {/* ── Section 3: CTA ── */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-lg px-6">
          <Button asChild size="lg">
            <Link href="/events/new">Create an event</Link>
          </Button>
          <p className="mt-5 text-[13px] leading-relaxed text-muted-foreground">
            No account needed to pledge. A 5% fee keeps favpoll running — 95%
            reaches your charity.
          </p>
        </div>
      </section>
    </main>
  )
}
