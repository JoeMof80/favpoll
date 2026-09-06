import { notFound } from "next/navigation"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { canManageAppeals } from "@/lib/appeals-admin"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PageLayout } from "@/components/page-layout"
import { heroNameSizeClass } from "@/lib/display"
import { withQuietTail } from "@/components/landing/quiet-tail"
import {
  FavpollSummaryCard,
  type FavpollSummaryCardFavpoll,
} from "@/components/favpoll-summary-card"
import { formatPounds } from "@/lib/i18n"

type Props = { params: Promise<{ id: string }> }

type CharityStats = {
  total_raised: number
  favpoll_count: number
  live_count: number
}

// REBUILT AGAIN 2026-09-06 (founder: "base the design of the charity
// page on the favpoll page — especially the width, border and
// header"): this page now stands on the favpoll page's own sheet
// (PageSheet — max-w-5xl white on the wash, drop-shadow edge) with the
// hero's STATIC composition: eyebrow, name, facts line, the logo where
// the avatar sits (rounded-xl, the avatar's own shape). No pinning, no
// settle machinery — that stays favpoll-only. The shelf is a GRID, not
// a carousel (deliberate: the homepage carousel is a showcase, this is
// an inventory — a carousel of two cards is machinery apologising for
// itself). Earlier verdicts still in force: NEUTRAL palette (registers
// belong to occasions, not organisations); appeals band; the claim
// mailto as the manual step before a charity portal.
export default async function CharityPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  const canManage = canManageAppeals(userId)
  const supabase = createAdminClient()

  const { data: charity } = await supabase
    .from("charities")
    .select(
      "id, name, description, impact_statement, logo_url, registered_number, verification_status, is_active"
    )
    .eq("id", id)
    .single()

  if (!charity || !charity.is_active) notFound()

  const { data: statsData } = await supabase.rpc("charity_stats", {
    p_charity_id: id,
  })
  const stats = (statsData as CharityStats | null) ?? {
    total_raised: 0,
    favpoll_count: 0,
    live_count: 0,
  }

  const { data: rawAppeals } = await supabase
    .from("appeals")
    .select("id, slug, name, blurb, closes_at, opens_at")
    .eq("charity_id", id)
    .eq("is_listed", true)
  const now = new Date()
  const openAppeals = (rawAppeals ?? []).filter(
    (a) =>
      new Date(a.opens_at) <= now &&
      (!a.closes_at || new Date(a.closes_at) > now)
  )
  const { data: appealAgg } = openAppeals.length
    ? await supabase.rpc("appeal_live_totals", {
        p_appeal_ids: openAppeals.map((a) => a.id),
      })
    : { data: [] }
  const aggByAppeal = new Map(
    (
      (appealAgg ?? []) as {
        appeal_id: string
        raised: number
        member_count: number
      }[]
    ).map((r) => [r.appeal_id, r])
  )

  const { data: rawLive } = await supabase
    .from("favpoll_charities")
    .select(
      `favpolls!inner (
        id, occasion_type, subject, cause_label, category, opening_line, closes_at,
        closed_at, total_raised, is_listed, is_private,
        protagonist:protagonists!favpolls_protagonist_id_fkey ( name ),
        favpoll_charities ( charity:charities ( id, name, logo_url, registered_number ) ),
        favpoll_polls ( topics ( title ) )
      )`
    )
    .eq("charity_id", id)
    .is("favpolls.closed_at", null)
    .eq("favpolls.is_listed", true)
    .eq("favpolls.is_private", false)
    .limit(12)

  const liveFavpolls: FavpollSummaryCardFavpoll[] = (rawLive ?? []).map((r) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const f = (r as any).favpolls
    return {
      id: f.id,
      occasion_type: f.occasion_type,
      subject: f.subject,
      cause_label: f.cause_label,
      category: f.category,
      opening_line: f.opening_line ?? "",
      closes_at: f.closes_at,
      closed_at: f.closed_at,
      total_raised: f.total_raised ?? 0,
      protagonist: f.protagonist,
      charities: (f.favpoll_charities ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => ({ charity: c.charity })
      ),
      poll: { topic: f.favpoll_polls?.[0]?.topics ?? null },
    }
  })

  const isVerified = charity.verification_status === "verified"
  const contactEmail =
    process.env.PARTNERSHIPS_EMAIL ??
    process.env.SUPPORT_EMAIL ??
    "hello@favpoll.com"

  const factsCard = (
    <div className="space-y-1 rounded-lg border border-border bg-card px-5 py-4">
      <SectionEyebrow variant="muted" className="font-semibold">
        Raised through favpoll
      </SectionEyebrow>
      <p className="text-xl font-medium text-primary tabular-nums">
        {formatPounds(stats.total_raised)}
      </p>
      <p className="text-xs text-muted-foreground">
        <span className="tabular-nums">{stats.favpoll_count}</span> favpoll
        {stats.favpoll_count === 1 ? "" : "s"} in their name ·{" "}
        <span className="tabular-nums">{stats.live_count}</span> open now
      </p>
    </div>
  )

  const left = (
    <>
      {/* ── Header: the favpoll hero, static — same eyebrow / name /
          context classes as BaseFavpollHero, logo in the avatar box ── */}
      <header className="flex items-start gap-4 pt-6 md:gap-6 md:pt-16">
        <div className="min-w-0 flex-1">
          <SectionEyebrow
            variant="muted"
            className="mb-2 flex h-8 items-center truncate wrap-break-word"
          >
            {charity.registered_number
              ? `Registered charity ${charity.registered_number}`
              : "Charity"}
          </SectionEyebrow>
          <h1
            className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${heroNameSizeClass(charity.name)}`}
          >
            {charity.name}
            {isVerified && (
              <BadgeCheck
                className="ml-2 inline size-6 shrink-0 align-baseline text-primary"
                role="img"
                aria-label="Verified with the Charity Commission"
              />
            )}
          </h1>
          {charity.description && (
            <p className="mt-4 truncate text-xl font-normal whitespace-normal text-primary md:text-2xl">
              {charity.description}
            </p>
          )}
        </div>
        {charity.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={charity.logo_url}
            alt={charity.name}
            className="h-26 w-26 shrink-0 rounded-xl border border-border bg-background object-contain p-2 md:h-33 md:w-33"
          />
        ) : (
          <div
            className="flex h-26 w-26 shrink-0 items-center justify-center rounded-xl border border-border bg-primary/10 text-3xl font-medium text-primary md:h-33 md:w-33"
            aria-hidden="true"
          >
            {charity.name.charAt(0)}
          </div>
        )}
      </header>

      {charity.impact_statement && (
        <p className="mt-6 inline-block rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {charity.impact_statement}
        </p>
      )}

      {/* The facts live in the rail on md+ (the favpoll page's own
          column); the rail hides on mobile, so surface them here. */}
      <div className="mt-6 md:hidden">{factsCard}</div>

      {/* ── Appeals ── */}
      {(openAppeals.length > 0 || canManage) && (
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between gap-3">
            <SectionEyebrow as="h2">Appeals for {charity.name}</SectionEyebrow>
            {canManage && (
              <Button asChild variant="outline" size="sm">
                <Link href={`/appeals/new?charity=${charity.id}`}>
                  Create an appeal
                </Link>
              </Button>
            )}
          </div>
          {openAppeals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appeals yet.</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {openAppeals.map((a) => {
                const agg = aggByAppeal.get(a.id)
                return (
                  <Link
                    key={a.id}
                    href={`/appeals/${a.slug}`}
                    className="group rounded-xl border border-border bg-background p-5 transition-shadow hover:shadow-md"
                  >
                    <p className="truncate text-lg font-medium text-foreground group-hover:text-primary">
                      {a.name}
                    </p>
                    {a.blurb && (
                      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {a.blurb}
                      </p>
                    )}
                    <p className="mt-3 text-sm text-muted-foreground">
                      <span className="font-medium text-primary tabular-nums">
                        {formatPounds(Number(agg?.raised ?? 0))}
                      </span>{" "}
                      · {agg?.member_count ?? 0} favpoll
                      {(agg?.member_count ?? 0) === 1 ? "" : "s"}
                      {a.closes_at &&
                        ` · closes ${new Date(a.closes_at).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "long" }
                        )}`}
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ── The shelf: a grid, deliberately not a carousel ── */}
      <section className="mt-12">
        <SectionEyebrow as="h2" className="mb-5">
          Open favpolls supporting {charity.name}
        </SectionEyebrow>
        {liveFavpolls.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No open favpolls right now — start one and every pledge reaches{" "}
            {charity.name} in full.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {liveFavpolls.map((favpoll) => (
              <FavpollSummaryCard key={favpoll.id} favpoll={favpoll} />
            ))}
          </div>
        )}
        {/* Charity claim — the manual first step before a portal */}
        <p className="mt-8 text-sm text-muted-foreground">
          Is this your charity?{" "}
          <a
            href={`mailto:${contactEmail}?subject=${encodeURIComponent(
              `Charity page — ${charity.name}`
            )}&body=${encodeURIComponent(
              `We'd like to help keep ${charity.name}'s favpoll page up to date (logo, description, impact statement).\n\nCharity: ${charity.name}\nReference: ${charity.id}`
            )}`}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Get in touch
          </a>{" "}
          to help keep this page up to date.
        </p>
      </section>

      {/* ── Close — quiet, inside the sheet ── */}
      <section className="mt-14 border-t border-border pt-10">
        <p className="mb-5 text-2xl leading-tight font-light tracking-tight text-foreground md:text-3xl">
          Honour someone, and support {charity.name}.
        </p>
        <Button
          asChild
          size="lg"
          className="h-auto min-h-11 px-6 py-2 text-base"
        >
          <Link href="/favpolls/new">
            {withQuietTail("Create a favpoll — always free")}
          </Link>
        </Button>
      </section>
    </>
  )

  return <PageLayout left={left} right={factsCard} />
}
