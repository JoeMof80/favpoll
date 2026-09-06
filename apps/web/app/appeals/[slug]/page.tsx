import { notFound } from "next/navigation"
import Link from "next/link"
import { Plus, Settings2 } from "lucide-react"
import { createAdminClient } from "@/lib/supabase/admin"
import { Button } from "@/components/ui/button"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { PageLayout } from "@/components/page-layout"
import { heroNameSizeClass, formatAmount } from "@/lib/display"
import { GoalProgress } from "@/components/goal-progress"
import { ShareFavpollButton } from "@/components/share-favpoll-button"
import { withQuietTail } from "@/components/landing/quiet-tail"
import { auth } from "@clerk/nextjs/server"
import { canManageAppeals } from "@/lib/appeals-admin"
import {
  FavpollSummaryCard,
  type FavpollSummaryCardFavpoll,
} from "@/components/favpoll-summary-card"

// THE APPEAL PAGE (concept: references/appeals-concept-2026-09-05.md).
// An appeal is an AGGREGATION VIEW — one charity, many member favpolls,
// one total. The blurb is the one place long-form story legitimately
// lives (the 08-06 verdict keeps it off favpolls).
//
// 2026-09-06, mirroring the charity page (founder: "Redesign the
// Appeals page in the same way"): PageLayout columns — hero-grammar
// header (eyebrow / name / close date as the context line / photo in
// the avatar box) beside the avatar-height Raised-so-far card — then
// the members as a full-width 3-up FavpollSummaryCard grid led by the
// dashed start door. Members stay ALPHABETICAL and the cards carry no
// money — the aggregate lives in the facts card alone, keeping the
// 2026-09-05 not-a-leaderboard doctrine on memorial-adjacent appeals.
export default async function AppealPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const { userId } = await auth()
  const canManage = canManageAppeals(userId)
  const supabase = createAdminClient()

  const { data: appeal } = await supabase
    .from("appeals")
    .select(
      "id, slug, name, blurb, photo_url, closes_at, opens_at, charity_id, goal_amount, charities(name)"
    )
    .eq("slug", slug)
    .maybeSingle()
  if (!appeal) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charityName = (appeal.charities as any)?.name ?? ""
  const isOpen =
    new Date(appeal.opens_at) <= new Date() &&
    (!appeal.closes_at || new Date(appeal.closes_at) > new Date())

  const { data: agg } = await supabase.rpc("appeal_live_totals", {
    p_appeal_ids: [appeal.id],
  })
  const raised = Number(agg?.[0]?.raised ?? 0)
  const goal = appeal.goal_amount ? Number(appeal.goal_amount) : null

  const { data: rawMembers } = await supabase
    .from("favpolls")
    .select(
      `id, occasion_type, subject, cause_label, category, opening_line,
       closes_at, closed_at, total_raised,
       protagonist:protagonists!favpolls_protagonist_id_fkey ( name, photo_url ),
       favpoll_charities ( charity:charities ( id, name, logo_url, registered_number ) ),
       favpoll_polls ( id, topics ( title ) )`
    )
    .eq("appeal_id", appeal.id)

  const members: FavpollSummaryCardFavpoll[] = (rawMembers ?? [])
    .map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const f = r as any
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
        poll: {
          // favpoll_polls is a TO-ONE join — object, not array (the
          // charity-shelf lesson, 2026-09-06).
          topic:
            (Array.isArray(f.favpoll_polls)
              ? f.favpoll_polls[0]?.topics
              : f.favpoll_polls?.topics) ?? null,
        },
      }
    })
    // Quiet, alphabetical — deliberately not a leaderboard.
    .sort((a, b) => {
      const name = (m: FavpollSummaryCardFavpoll) =>
        m.subject === "cause"
          ? (m.cause_label ?? "")
          : (m.protagonist?.name ?? "")
      return name(a).localeCompare(name(b))
    })

  // Supporter count — charities think in pledges, not rows
  // (founder, 2026-09-06). favpoll_polls is a TO-ONE join: object.
  const pollIds = (rawMembers ?? [])
    .map((r) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fp = (r as any).favpoll_polls
      return Array.isArray(fp) ? fp[0]?.id : fp?.id
    })
    .filter(Boolean)
  let pledgeCount = 0
  if (pollIds.length > 0) {
    const { count } = await supabase
      .from("pledges")
      .select("id", { count: "exact", head: true })
      .in("favpoll_poll_id", pollIds)
    pledgeCount = count ?? 0
  }

  const factsCard = (
    <div className="flex flex-col justify-center space-y-1 rounded-lg border border-border bg-card px-5 py-4 md:min-h-33">
      <SectionEyebrow variant="muted" className="font-semibold">
        Raised so far
      </SectionEyebrow>
      <p className="text-3xl font-light text-primary tabular-nums">
        {formatAmount(raised)}
      </p>
      {goal && (
        <>
          <GoalProgress
            totalRaised={raised}
            goalAmount={goal}
            className="mt-1 h-1"
          />
          <p className="text-xs text-muted-foreground">
            {raised >= goal
              ? `${formatAmount(goal)} goal reached`
              : `of the ${formatAmount(goal)} goal`}
          </p>
        </>
      )}
      <p className="text-xs text-muted-foreground">
        <span className="tabular-nums">{pledgeCount}</span> pledge
        {pledgeCount === 1 ? "" : "s"} across{" "}
        <span className="tabular-nums">{members.length}</span> favpoll
        {members.length === 1 ? "" : "s"}
      </p>
    </div>
  )

  // The rail column: the card, the share door (the charity's whole job
  // is promoting this link), and the trust line — the sentence a
  // charity most wants its supporters to read.
  const rightColumn = (
    <>
      {factsCard}
      <ShareFavpollButton
        label="Share this appeal"
        shareTitle={`${appeal.name} — favpoll appeal`}
        className="w-full"
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        favpoll takes no platform fee — every pledge goes to {charityName}.
      </p>
    </>
  )

  const left = (
    <>
      {/* ── Header: the favpoll hero's composition, static ── */}
      <header className="flex items-start gap-4 pt-6 md:gap-6 md:pt-16">
        <div className="min-w-0 flex-1">
          <SectionEyebrow
            variant="muted"
            className="mb-2 flex h-8 items-center truncate wrap-break-word"
          >
            An appeal for{" "}
            <Link
              href={`/charities/${appeal.charity_id}`}
              className="ml-1 text-primary underline-offset-4 hover:underline"
            >
              {charityName}
            </Link>
          </SectionEyebrow>
          <h1
            className={`line-clamp-2 leading-tight font-medium tracking-tight wrap-break-word text-foreground ${heroNameSizeClass(appeal.name)}`}
          >
            {appeal.name}
          </h1>
          {appeal.closes_at && (
            <p className="mt-4 truncate text-xl font-normal whitespace-normal text-primary md:text-2xl">
              Closes{" "}
              {new Date(appeal.closes_at).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        {/* The photo sits where the favpoll avatar sits — same shape */}
        {appeal.photo_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={appeal.photo_url}
            alt=""
            className="h-26 w-26 shrink-0 rounded-xl object-cover md:h-33 md:w-33"
          />
        )}
      </header>

      {/* The blurb wears the favpoll About's classes, in its slot */}
      {appeal.blurb && (
        <p className="mt-6 text-base leading-relaxed wrap-break-word text-muted-foreground">
          {appeal.blurb}
        </p>
      )}

      <div className="mt-6 space-y-4 md:hidden">{rightColumn}</div>
    </>
  )

  const fullWidth = (
    <section className="mt-12">
      <SectionEyebrow as="h2" className="mb-5">
        Favpolls in this appeal
      </SectionEyebrow>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isOpen && (
          <Link
            href={`/favpolls/new?appeal=${appeal.slug}`}
            className="flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-background p-5 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="size-6" aria-hidden="true" />
            <span className="text-sm font-medium">
              {withQuietTail("Start your favpoll — always free")}
            </span>
          </Link>
        )}
        {members.map((favpoll) => (
          <FavpollSummaryCard key={favpoll.id} favpoll={favpoll} />
        ))}
      </div>
    </section>
  )

  return (
    <>
      <PageLayout left={left} right={rightColumn} rightSticky={false}>
        {fullWidth}
      </PageLayout>
      {/* The gated manage door is the bottom-right circle everywhere
          (founder, 2026-09-06) — the favpoll page's own FAB. OUTSIDE
          PageLayout: the sheet's drop-shadow filter makes it a
          containing block, so a fixed FAB inside it pins to the sheet
          corner, not the viewport (founder screenshot) — the same
          reason FavpollSubheader renders beside PageLayout, not in it. */}
      {canManage && (
        <Button
          asChild
          size="icon"
          aria-label="Manage appeal"
          className="fixed right-5 bottom-5 z-30 size-14 rounded-full shadow-lg [&_svg]:size-6"
        >
          <Link href={`/appeals/${appeal.slug}/manage`}>
            <Settings2 aria-hidden="true" />
          </Link>
        </Button>
      )}
    </>
  )
}
