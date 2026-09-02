import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { RegisterScope } from "@/components/register-scope"
import { paletteForFavpoll } from "@/lib/register-palette"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
import { ManageClient, type ManageFavpoll } from "./manage-client"

export const metadata = {
  title: "Manage favpoll — favpoll",
}

// THE MANAGE PAGE (candidate B, reshaped 2026-09-03): the favpoll's
// COMPLETE RECORD in administrative context — every authored thing in
// full (including the reveal, visible at rest nowhere else), every
// setting with its control, the share kit, the danger zone. Content is
// read-only here with Edit doors into the wizard: the wizard stays THE
// editor. Owner-only.
//
// DRAFT NOTE: the base select still shadows app/my-favpolls/page.tsx;
// extract a shared fetch when the design is adopted.
export default async function ManageFavpollPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()
  const { data: raw } = await supabase
    .from("favpolls")
    .select(
      `
      id,
      live_slug,
      short_code,
      opening_line,
      closes_at,
      closed_at,
      occasion_type,
      category,
      grouping,
      subject,
      cause_label,
      description,
      photo_url,
      total_raised,
      goal_amount,
      is_listed,
      is_private,
      allow_guest_items,
      created_at,
      created_by,
      protagonists!favpolls_protagonist_id_fkey ( name, context, about, photo_url ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number, description, created_at ) ),
      favpoll_polls (
        id,
        personal_reveal,
        topics ( title ),
        pledges ( count ),
        favpoll_poll_favourites ( is_hidden, is_guest_added, favourites ( id, label ) )
      ),
      favpoll_pots ( total_deposited, total_allocated )
    `
    )
    .eq("id", id)
    .single()

  if (!raw) notFound()
  if ((raw as { created_by?: string }).created_by !== userId) {
    redirect("/my-favpolls")
  }

  type RawRow = {
    id: string
    live_slug: string
    short_code: string
    opening_line: string
    closes_at: string
    closed_at: string | null
    occasion_type: string | null
    category: string | null
    grouping: string | null
    subject: string
    cause_label: string | null
    description: string | null
    photo_url: string | null
    total_raised: number
    goal_amount: number | null
    is_listed: boolean
    is_private: boolean | null
    allow_guest_items: boolean | null
    created_at: string
    protagonists: {
      name: string
      context: string | null
      about: string | null
      photo_url: string | null
    } | null
    favpoll_charities: {
      charities: ManageFavpoll["charities"][number]["charity"]
    }[]
    favpoll_polls: {
      id: string
      personal_reveal: string | null
      topics: { title: string } | null
      pledges: { count: number }[]
      favpoll_poll_favourites: {
        is_hidden: boolean | null
        is_guest_added: boolean | null
        favourites: { id: string; label: string } | null
      }[]
    } | null
    favpoll_pots: { total_deposited: number; total_allocated: number } | null
  }

  const [ev] = await withLiveTotals(supabase, [raw as unknown as RawRow])
  const isCause = ev.subject === "cause"

  const favpoll: ManageFavpoll = {
    id: ev.id,
    live_slug: ev.live_slug,
    short_code: ev.short_code,
    opening_line: ev.opening_line,
    closes_at: ev.closes_at,
    closed_at: ev.closed_at,
    occasion_type: ev.occasion_type,
    category: ev.category,
    grouping: ev.grouping,
    subject: ev.subject,
    cause_label: ev.cause_label,
    total_raised: ev.total_raised,
    goal_amount: ev.goal_amount ?? null,
    is_listed: ev.is_listed ?? true,
    allow_guest_items: ev.allow_guest_items ?? true,
    created_at: ev.created_at,
    protagonist: ev.protagonists ? { name: ev.protagonists.name } : null,
    charities: ev.favpoll_charities.map((ec) => ({ charity: ec.charities })),
    poll: ev.favpoll_polls
      ? { id: ev.favpoll_polls.id, topic: ev.favpoll_polls.topics ?? null }
      : null,
    pot: ev.favpoll_pots ?? null,
    pledge_count: ev.favpoll_polls?.pledges?.[0]?.count ?? 0,
    has_reveal: !!ev.favpoll_polls?.personal_reveal,
    // ── The record's ledger fields ──
    isPrivate: ev.is_private ?? false,
    context: ev.protagonists?.context ?? null,
    about: (isCause ? ev.description : ev.protagonists?.about) ?? null,
    reveal: ev.favpoll_polls?.personal_reveal ?? null,
    photoUrl: (isCause ? ev.photo_url : ev.protagonists?.photo_url) ?? null,
    favourites: (ev.favpoll_polls?.favpoll_poll_favourites ?? [])
      .filter((f) => f.favourites)
      .map((f) => ({
        id: f.favourites!.id,
        label: f.favourites!.label,
        isGuestAdded: !!f.is_guest_added,
        isHidden: !!f.is_hidden,
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  }

  const palette = paletteForFavpoll({
    category: (favpoll.category ?? null) as FavpollCategory | null,
    subject: (favpoll.subject ?? undefined) as FavpollSubject | undefined,
  })

  return (
    <RegisterScope palette={palette}>
      <main className="min-h-screen bg-muted">
        <ManageClient favpoll={favpoll} />
      </main>
    </RegisterScope>
  )
}
