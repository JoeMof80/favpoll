import Link from "next/link"
import { HeroDemoPanel } from "@/components/hero-demo-panel"
import { LiveFavpollsCarousel } from "@/components/live-favpolls-carousel"
import { HowItWorksThreeBeat } from "@/components/landing/how-it-works-three-beat"
import HonourCharityLoveVenn from "@/components/landing-v2/honour-charity-love-venn"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { RankingBar } from "@/components/ui/ranking-bar"
import { createAdminClient } from "@/lib/supabase/admin"
import { formatCurrency, MARKET_DEFAULTS, t } from "@/lib/i18n"

// Minimum total pledged (in £) before the record section is shown.
// Keeps the section from appearing with thin or misleading figures.
// Coupled to the same threshold problem as /rankings (see TODO in PROJECT.md).
const RECORD_THRESHOLD_GBP = 500

export default async function HomePage() {
  const supabase = createAdminClient()

  const [{ data: favpolls }, { data: topFavourites }, { data: charities }] =
    await Promise.all([
      supabase
        .from("favpolls")
        .select(
          `
          id,
          opening_line,
          description,
          closes_at,
          occasion_type,
          total_raised,
          subject,
          cause_label,
          protagonist:protagonists ( name ),
          charities:favpoll_charities (
            charity:charities ( id, name, logo_url, registered_number )
          ),
          favpoll_polls (
            id,
            topic_id,
            topics (
              title,
              is_finite,
              favourites ( id, label )
            ),
            favpoll_poll_favourites (
              favourites ( id, label )
            )
          )
        `
        )
        .eq("is_private", false)
        .eq("is_listed", true)
        .is("closed_at", null)
        .gt("closes_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(6),

      // Top favourites for the record section
      supabase
        .from("favourites")
        .select("id, label, all_time_pledged, all_time_count, topics(title)")
        .gt("all_time_pledged", 0)
        .order("all_time_pledged", { ascending: false })
        .limit(6),

      // A small set of active charities for Section 5
      supabase
        .from("charities")
        .select("id, name")
        .eq("is_active", true)
        .limit(3),
    ])

  type RawFavourite = { id: string; label: string }
  type RawEpf = { favourites: RawFavourite }
  type RawPoll = {
    id: string
    topic_id: string | null
    topics: {
      title: string
      is_finite: boolean
      favourites: RawFavourite[]
    } | null
    favpoll_poll_favourites: RawEpf[]
  }
  type RawFavpoll = {
    id: string
    opening_line: string
    description: string | null
    closes_at: string
    occasion_type: string | null
    total_raised: number
    subject: string | null
    cause_label: string | null
    protagonist: { name: string }
    charities: { charity: import("@favpoll/types").Charity }[]
    favpoll_polls: RawPoll | null
  }

  const normalised = ((favpolls ?? []) as unknown as RawFavpoll[]).map((ev) => {
    const rawPoll = ev.favpoll_polls ?? null
    let poll: {
      id: string
      topic_id: string | null
      topic: { title: string; favourites: RawFavourite[] } | null
    } | null = null
    if (rawPoll) {
      const isFinite = rawPoll.topics?.is_finite ?? false
      const favourites = isFinite
        ? (rawPoll.topics?.favourites ?? [])
        : (rawPoll.favpoll_poll_favourites ?? [])
            .map((epf) => epf.favourites)
            .filter(Boolean)
      poll = {
        id: rawPoll.id,
        topic_id: rawPoll.topic_id,
        topic: rawPoll.topics
          ? { title: rawPoll.topics.title, favourites }
          : null,
      }
    }
    return { ...ev, poll }
  })

  // Record section: only shown when the total pledged meets the threshold
  type TopFavourite = {
    id: string
    label: string
    all_time_pledged: number
    all_time_count: number
    topics: { title: string } | null
  }
  const recordItems = (topFavourites ?? []) as unknown as TopFavourite[]
  const recordTotal = recordItems.reduce(
    (sum, f) => sum + f.all_time_pledged,
    0
  )
  const showRecord =
    recordTotal >= RECORD_THRESHOLD_GBP && recordItems.length >= 3
  const recordMax = recordItems[0]?.all_time_pledged ?? 1

  return (
    <main className="flex flex-col">
      {/* ── Section 1: Hero ── */}
      <HeroDemoPanel />

      {/* ── Section 2: How it works ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <SectionEyebrow className="mb-2">How it works</SectionEyebrow>
          <h2 className="mb-3 text-[28px] font-light tracking-tight text-foreground">
            A question that withholds. A reveal that discloses.
          </h2>
          <p className="mb-10 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            The withhold-then-disclose mechanic is what makes a favpoll
            different from a collection. Guests give something first. Then they
            receive.
          </p>
          <HowItWorksThreeBeat />
        </div>
      </section>

      {/* ── Section 3: Live favpolls ── */}
      <section className="border-b border-border bg-primary/5 py-16">
        <div className="mx-auto max-w-330 px-6">
          <div className="mb-8 flex items-baseline justify-between">
            <SectionEyebrow>Live right now</SectionEyebrow>
            <Button variant="ghost" asChild>
              <Link href="/favpolls">See all →</Link>
            </Button>
          </div>

          {normalised.length > 0 ? (
            <LiveFavpollsCarousel favpolls={normalised} />
          ) : (
            <div className="py-16 text-center">
              <p className="mb-2 text-[15px] font-medium text-foreground">
                No live favpolls yet
              </p>
              <p className="mx-auto mb-6 max-w-70 text-[13px] leading-relaxed text-muted-foreground">
                Create the first favpoll and it will appear here.
              </p>
              <Button asChild size="lg">
                <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Section 4: The record (gated on data sufficiency) ── */}
      {showRecord && (
        <section className="border-b border-border py-16">
          <div className="mx-auto max-w-330 px-6">
            <SectionEyebrow className="mb-2">The record</SectionEyebrow>
            <h2 className="mb-3 text-[28px] font-light tracking-tight text-foreground">
              A lasting, collectively funded measure of what people love most.
            </h2>
            <p className="mb-10 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
              Every pledge contributes to a permanent ranking of human
              favourites. Not a dataset — a record, built through acts of
              generosity.
            </p>
            <ol
              className="max-w-lg space-y-3"
              aria-label="Top all-time favourites"
            >
              {recordItems.map((item) => (
                <li key={item.id}>
                  <RankingBar
                    label={item.label}
                    amount={formatCurrency(
                      item.all_time_pledged,
                      MARKET_DEFAULTS["en-GB"]
                    )}
                    widthPercent={Math.round(
                      (item.all_time_pledged / recordMax) * 100
                    )}
                    barStyle={{ background: "#7F77DD" }}
                  />
                  {item.topics?.title && (
                    <p className="mt-0.5 text-[11px] tracking-[0.07em] text-muted-foreground uppercase">
                      {item.topics.title}
                    </p>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-6">
              <Button variant="ghost" asChild>
                <Link href="/rankings">See the full record →</Link>
              </Button>
            </p>
          </div>
        </section>
      )}

      {/* ── Section 5: Where the money goes ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <SectionEyebrow className="mb-2">Where the money goes</SectionEyebrow>
          <h2 className="mb-3 text-[28px] font-light tracking-tight text-foreground">
            95% reaches your chosen charity.
          </h2>
          <p className="mb-6 max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            A 5% platform fee covers favpoll's costs. The remaining 95% reaches
            your chosen charity in full, processed directly through Stripe. You
            choose up to three charities per favpoll — the pledged total is
            split equally between them.
          </p>
          {charities && charities.length > 0 && (
            <p className="text-[13px] text-muted-foreground">
              Charities on favpoll include{" "}
              {charities.map((c) => (c as { name: string }).name).join(", ")}{" "}
              and more.
            </p>
          )}
        </div>
      </section>

      {/* ── Section 6: Written in advance ── */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-330 px-6">
          <SectionEyebrow className="mb-2">Written in advance</SectionEyebrow>
          <h2 className="mb-3 text-[28px] font-light tracking-tight text-foreground">
            A favpoll can be part of a will.
          </h2>
          <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            The questions and the reveals can be written in advance — by you, in
            your own words — and kept in a will or letter of wishes. An executor
            creates the favpoll when the time comes. Guests receive your answer
            in your voice, after they have pledged. It is one of the quietest
            and most lasting things this platform makes possible.
          </p>
        </div>
      </section>

      {/* ── Section 7: Honour · Charity · Love + final CTA ── */}
      <section className="py-16">
        <div className="mx-auto max-w-330 px-6">
          <div className="grid items-center gap-12 md:grid-cols-[1fr_auto]">
            <div>
              <SectionEyebrow className="mb-2">
                Honour · Charity · Love
              </SectionEyebrow>
              <h2 className="mb-4 text-[28px] font-light tracking-tight text-foreground">
                {t("landing.subheader")}
              </h2>
              <p className="mb-8 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
                Every favpoll sits at the intersection of three things that
                rarely appear together. That is what makes it different.
              </p>
              <div className="flex flex-wrap items-center gap-3.5">
                <Button asChild size="lg">
                  <Link href="/favpolls/new">{t("landing.cta.primary")}</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href="/favpolls">See live favpolls →</Link>
                </Button>
              </div>
              <p className="mt-4 text-[12px] text-muted-foreground">
                {t("landing.cta.caption")}
              </p>
            </div>

            <div className="hidden md:block">
              <HonourCharityLoveVenn
                size={280}
                animate
                className="opacity-90"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
