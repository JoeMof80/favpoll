import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { BadgeCheck, Plus } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { canManageAppeals } from "@/lib/appeals-admin"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PageLayout } from "@/components/page-layout"
import { FavpollHeader } from "@/components/favpoll-card/favpoll-header"
import { ClosingLabel } from "@/components/closing-label"
import { heroNameSizeClass } from "@/lib/display"
import { withQuietTail } from "@/components/landing/quiet-tail"
import {
  FavpollSummaryCard,
  type FavpollSummaryCardFavpoll,
} from "@/components/favpoll-summary-card"
import { formatPounds } from "@/lib/i18n"
import { isCharityVerified } from "@favpoll/types"
import {
  loadPrivateCharityPage,
  profileKeyFromParam,
} from "@/lib/charity-profile-page"
import { PrivateCharityPage } from "@/components/private-charity-page"

type Props = { params: Promise<{ id: string }> }

const contactEmail = () =>
  process.env.PARTNERSHIPS_EMAIL ??
  process.env.SUPPORT_EMAIL ??
  "hello@favpoll.com"

// THE NUMBER ROUTE (step 3 of references/charity-profiles-2026-09-27.md).
// This segment takes either an account's id or a REGISTERED NUMBER, and
// the number is the general case the account page is a special case of:
// every registered charity has a page that can render, from the mirror row
// plus its profile if there is one.
//
// A page that is not public must not be indexed, whatever else goes wrong.
export async function generateMetadata({ params }: Props) {
  const { id } = await params
  if (!profileKeyFromParam(id)) return {}
  return { robots: { index: false, follow: false } }
}

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

  // A registered number: the private page, unless the charity has earned a
  // public one. Visibility follows the consent doctrine exactly as the
  // account page does — approved and listed is public, everything else is
  // staff-only, because a public page implies an endorsement we have not
  // got. (The charity's own link into this page carries a token; that
  // belongs with onboarding and is not built yet, so the audience today is
  // the team — the same allowlist the appeals pages use, which becomes a
  // role check when charity accounts exist.)
  const numberKey = profileKeyFromParam(id)
  if (numberKey) {
    const page = await loadPrivateCharityPage(numberKey)
    // One canonical URL per charity: an account that is on the shelf is
    // served by its own public page.
    if (page?.account?.isActive) redirect(`/charities/${page.account.id}`)
    if (!canManage || !page) notFound()
    return <PrivateCharityPage page={page} contactEmail={contactEmail()} />
  }

  const { data: charity } = await supabase
    .from("charities")
    .select(
      "id, name, description, impact_statement, logo_url, registered_number, verification_status, verified_name, name_accepted_at, name_accepted_name, is_active"
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
        favpoll_polls ( topics ( title ), topic_subsets ( title ) )
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
      // favpoll_polls is a TO-ONE join here — PostgREST returns an
      // object, not an array (verified against staging; indexing [0]
      // silently nulled the topic and the card hid its topic row).
      poll: {
        topic:
          (Array.isArray(f.favpoll_polls)
            ? (f.favpoll_polls[0]?.topic_subsets ?? f.favpoll_polls[0]?.topics)
            : (f.favpoll_polls?.topic_subsets ?? f.favpoll_polls?.topics)) ??
          null,
      },
    }
  })

  // The tick means "the number is live and the name is accounted for" —
  // by the register, or by an admin who accepted a difference the register
  // explains no further (our WWF against their "WWF - UK"). The rule is
  // shared so the index, this page and the admin all agree.
  const isVerified = isCharityVerified(charity)

  // The card fills the avatar's own height (md:h-33) so the header row
  // reads as one unit: text stack, logo, facts (founder, 2026-09-06 —
  // and no stickiness: it is a header element, not a rail companion).
  const factsCard = (
    <div className="flex flex-col justify-center space-y-1 rounded-lg border border-border bg-card px-5 py-4 md:h-33">
      <SectionEyebrow variant="muted" className="font-semibold">
        Raised through favpoll
      </SectionEyebrow>
      <p className="text-3xl font-light text-primary tabular-nums">
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
            Charity
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
          {charity.registered_number && (
            <p className="mt-4 truncate text-xl font-normal whitespace-normal text-primary md:text-2xl">
              Registered charity {charity.registered_number}
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

      {/* The description wears the favpoll About's classes, in the
          About's slot below the header (static — no clip machinery). */}
      {charity.description && (
        <p className="mt-6 line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground">
          {charity.description}
        </p>
      )}

      {charity.impact_statement && (
        <p className="mt-6 inline-block rounded-md bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          {charity.impact_statement}
        </p>
      )}

      {/* The facts live in the rail on md+ (the favpoll page's own
          column); the rail hides on mobile, so surface them here. */}
      <div className="mt-6 md:hidden">{factsCard}</div>
    </>
  )

  // Full-width row beneath the header columns (founder, 2026-09-06:
  // "Appeals and Open favpolls should be on a new row, without
  // columns") — PageLayout children render below the grid, spanning
  // the whole sheet.
  const fullWidth = (
    <>
      {/* ── Appeals ── */}
      {(openAppeals.length > 0 || canManage) && (
        <section className="mt-12">
          <SectionEyebrow as="h2" className="mb-5">
            Appeals for {charity.name}
          </SectionEyebrow>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* The create door IS a card, first in the list (founder,
                2026-09-06) — the dashed add-tile, the wizard photo
                square's own grammar. */}
            {canManage && (
              <Link
                href={`/appeals/new?charity=${charity.id}`}
                className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-background p-5 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              >
                <Plus className="size-6" aria-hidden="true" />
                <span className="text-sm font-medium">Create an appeal</span>
              </Link>
            )}
            {openAppeals.map((a) => {
              const agg = aggByAppeal.get(a.id)
              return (
                // The favpoll card's grammar (founder, 2026-09-06):
                // APPEAL in the eyebrow slot, name as the card title,
                // facts in the border-t row with the closing label on
                // the right — no blurb (cards are identity, not story;
                // it lives on the appeal page).
                <Link
                  key={a.id}
                  href={`/appeals/${a.slug}`}
                  className="flex flex-col rounded-xl border border-border bg-background shadow-sm transition-all duration-300 hover:border-border-strong hover:shadow-lg motion-safe:hover:-translate-y-1"
                >
                  {/* Three bordered rows — the favpoll card's own
                      structure: header, then count+countdown where the
                      topic row sits, then the £ where the charity row
                      sits, right-aligned (founder, 2026-09-06). */}
                  <div className="flex-1 p-3">
                    <FavpollHeader
                      hideEmptyAvatar
                      protagonist={{ name: a.name, photo_url: null }}
                      eyebrow="Appeal"
                      size="md"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-border px-3 py-2 text-sm text-muted-foreground">
                    <span>
                      {agg?.member_count ?? 0} favpoll
                      {(agg?.member_count ?? 0) === 1 ? "" : "s"}
                    </span>
                    {a.closes_at && (
                      <ClosingLabel
                        closesAt={a.closes_at}
                        className="whitespace-nowrap"
                      />
                    )}
                  </div>
                  <div className="border-t border-border px-3 py-2">
                    <p className="text-right text-sm font-medium text-primary tabular-nums">
                      {formatPounds(Number(agg?.raised ?? 0))}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── The shelf: a grid, deliberately not a carousel ── */}
      <section className="mt-12">
        <SectionEyebrow as="h2" className="mb-5">
          Open favpolls supporting {charity.name}
        </SectionEyebrow>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href={`/favpolls/new?charity=${charity.id}`}
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-background p-5 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-6" aria-hidden="true" />
            <span className="text-sm font-medium">
              {withQuietTail("Create a favpoll — always free")}
            </span>
          </Link>
          {liveFavpolls.map((favpoll) => (
            <FavpollSummaryCard key={favpoll.id} favpoll={favpoll} />
          ))}
        </div>
        {/* Charity claim — the manual first step before a portal */}
        <p className="mt-8 text-sm text-muted-foreground">
          Is this your charity?{" "}
          <a
            href={`mailto:${contactEmail()}?subject=${encodeURIComponent(
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
    </>
  )

  return (
    <PageLayout left={left} right={factsCard} rightSticky={false}>
      {fullWidth}
    </PageLayout>
  )
}
