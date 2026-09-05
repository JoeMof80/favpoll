import { notFound } from "next/navigation"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { canManageAppeals } from "@/lib/appeals-admin"
import { RegisterScope } from "@/components/register-scope"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
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

// REDESIGNED 2026-09-06 to the house grammar (founder: "consistent
// with the design of the rest of the app"): the hero's eyebrow/name
// idiom for identity, the register wash ground (fundraiser palette —
// a charity page is money-led, the cause register's own reasoning),
// the manage page's Card idiom for the money block, and poster-scale
// CTAs with the quiet tail. Real components only.
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

  // The charity's own appeals — listed and open only. Gate-passers get
  // the creation door here, prefilled (founder, 2026-09-06).
  const { data: rawAppeals } = await supabase
    .from("appeals")
    .select("id, slug, name, closes_at, opens_at")
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

  return (
    <RegisterScope palette="fundraiser">
      <main className="min-h-screen bg-primary/5">
        <div className="mx-auto w-full max-w-330 px-6 py-14">
          {/* ── Identity, in the hero grammar: eyebrow · name · context,
              logo in the avatar slot ── */}
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0 flex-1">
              <SectionEyebrow variant="muted">
                {charity.registered_number
                  ? `Registered charity ${charity.registered_number}`
                  : "Charity"}
              </SectionEyebrow>
              <h1 className="mt-2 flex items-center gap-3 text-4xl leading-tight font-light tracking-tight text-foreground">
                {charity.name}
                {isVerified && (
                  <BadgeCheck
                    className="size-6 shrink-0 text-primary"
                    role="img"
                    aria-label="Verified with the Charity Commission"
                  />
                )}
              </h1>
              {charity.description && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                  {charity.description}
                </p>
              )}
              {charity.impact_statement && (
                <p className="mt-4 inline-block rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                  {charity.impact_statement}
                </p>
              )}
            </div>
            {charity.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={charity.logo_url}
                alt={charity.name}
                className="size-24 shrink-0 rounded-2xl border border-border bg-background object-contain p-2 md:size-33"
              />
            ) : (
              <div
                className="flex size-24 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-3xl font-medium text-primary md:size-33"
                aria-hidden="true"
              >
                {charity.name.charAt(0)}
              </div>
            )}
          </div>

          {/* ── The lanes: money + appeals left, favpolls right of the
              fold — same two-lane weighting as the manage page ── */}
          <div className="mt-10 grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-6">
              {/* Money — the manage Money-card grammar */}
              <section className="rounded-xl border border-border bg-background p-5">
                <SectionEyebrow as="h2" className="mb-4">
                  Through favpoll
                </SectionEyebrow>
                <p className="text-4xl font-light text-primary tabular-nums">
                  {formatPounds(stats.total_raised)}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Favpolls</p>
                    <p className="mt-0.5 text-sm text-foreground tabular-nums">
                      {stats.favpoll_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Open now</p>
                    <p className="mt-0.5 text-sm text-foreground tabular-nums">
                      {stats.live_count}
                    </p>
                  </div>
                </div>
              </section>

              {/* Appeals — the charity's parent campaigns; gate-passers
                  get the creation door here, prefilled */}
              {(openAppeals.length > 0 || canManage) && (
                <section className="rounded-xl border border-border bg-background p-5">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <SectionEyebrow as="h2">Appeals</SectionEyebrow>
                    {canManage && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/appeals/new?charity=${charity.id}`}>
                          Create an appeal
                        </Link>
                      </Button>
                    )}
                  </div>
                  {openAppeals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No appeals yet.
                    </p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {openAppeals.map((a) => {
                        const agg = aggByAppeal.get(a.id)
                        return (
                          <li key={a.id}>
                            <Link
                              href={`/appeals/${a.slug}`}
                              className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-primary/5"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-foreground">
                                  {a.name}
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                  {agg?.member_count ?? 0} favpoll
                                  {(agg?.member_count ?? 0) === 1 ? "" : "s"}
                                  {a.closes_at &&
                                    ` · closes ${new Date(
                                      a.closes_at
                                    ).toLocaleDateString("en-GB", {
                                      day: "numeric",
                                      month: "long",
                                    })}`}
                                </span>
                              </span>
                              <span className="shrink-0 text-sm font-medium text-primary tabular-nums">
                                {formatPounds(Number(agg?.raised ?? 0))}
                              </span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </section>
              )}

              {/* The organiser CTA — a card, poster CTA, quiet tail */}
              <section className="rounded-xl border border-border bg-background p-5">
                <SectionEyebrow as="h2" className="mb-3">
                  Start something
                </SectionEyebrow>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Create a favpoll in someone&apos;s name and turn your
                  guests&apos; favourites into funds — 100% reaches{" "}
                  {charity.name}.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="mt-4 h-auto min-h-11 px-6 py-2 text-base"
                >
                  <Link href="/favpolls/new">
                    {withQuietTail("Create a favpoll — always free")}
                  </Link>
                </Button>
              </section>
            </div>

            {/* Open favpolls — the real cards */}
            <section>
              <SectionEyebrow as="h2" className="mb-4">
                Open favpolls supporting {charity.name}
              </SectionEyebrow>
              {liveFavpolls.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No open favpolls right now — start one and every pledge
                  reaches {charity.name} in full.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {liveFavpolls.map((favpoll) => (
                    <FavpollSummaryCard key={favpoll.id} favpoll={favpoll} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Charity claim — the manual first step before a portal */}
          <p className="mt-12 text-sm text-muted-foreground">
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
        </div>
      </main>
    </RegisterScope>
  )
}
