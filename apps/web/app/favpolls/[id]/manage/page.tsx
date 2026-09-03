import { auth } from "@clerk/nextjs/server"
import { notFound, redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import { RegisterScope } from "@/components/register-scope"
import { paletteForFavpoll } from "@/lib/register-palette"
import {
  ORGANIZER_FAVPOLL_COLUMNS,
  mapOrganizerFavpoll,
  type RawOrganizerRow,
} from "@/lib/organizer-favpolls"
import type { FavpollCategory, FavpollSubject } from "@favpoll/types"
import type { WallEntry } from "@/components/wall-of-favourites"
import { ManageClient, type ManageFavpoll } from "./manage-client"

export const metadata = {
  title: "Manage favpoll — favpoll",
}

// THE MANAGE PAGE: the favpoll's COMPLETE RECORD in administrative
// context — every authored thing in full (including the reveal, visible
// at rest nowhere else), every setting with its control, the share kit.
// Content is read-only here with the toolbar's Edit door into the
// wizard: the wizard stays THE editor. Owner-only.
//
// The base select and mapping are the organiser surfaces' shared ones
// (lib/organizer-favpolls); this page extends them with the ledger
// fields and wider joins.
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
      `${ORGANIZER_FAVPOLL_COLUMNS},
      created_by,
      description,
      photo_url,
      is_private,
      protagonists!favpolls_protagonist_id_fkey ( name, context, about, photo_url ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number, description, created_at ) ),
      favpoll_polls (
        id,
        personal_reveal,
        topics ( title ),
        pledges ( count ),
        favpoll_poll_favourites ( is_hidden, is_guest_added, favourites ( id, label ) )
      ),
      favpoll_pots ( total_deposited, total_allocated )`
    )
    .eq("id", id)
    .single()

  if (!raw) notFound()
  if ((raw as { created_by?: string }).created_by !== userId) {
    redirect("/my-favpolls")
  }

  // The shared row, widened with this page's extras. The join overrides
  // are structural supersets, so mapOrganizerFavpoll takes the row as-is.
  type RawRow = Omit<RawOrganizerRow, "protagonists" | "favpoll_polls"> & {
    created_by: string
    description: string | null
    photo_url: string | null
    is_private: boolean | null
    protagonists: {
      name: string
      context: string | null
      about: string | null
      photo_url: string | null
    } | null
    favpoll_polls:
      | (NonNullable<RawOrganizerRow["favpoll_polls"]> & {
          favpoll_poll_favourites: {
            is_hidden: boolean | null
            is_guest_added: boolean | null
            favourites: { id: string; label: string } | null
          }[]
        })
      | null
  }

  const [ev] = await withLiveTotals(supabase, [raw as unknown as RawRow])

  // The guest wall, the guest page's own query (capped at 24, newest
  // first) — but the organiser is always entitled, so labels always
  // resolve. Names follow the anonymity model: anonymous → null →
  // "Someone"; amounts never appear.
  type WallRow = {
    id: string
    display_name: string | null
    is_anonymous: boolean | null
    clerk_user_id: string | null
    created_at: string
    pledge_allocations: { favourites: { label: string } | null }[] | null
  }
  const pollId = ev.favpoll_polls?.id ?? null
  let wallEntries: WallEntry[] = []
  if (pollId) {
    const { data: wallRows } = await supabase
      .from("pledges")
      .select(
        `id, display_name, is_anonymous, clerk_user_id, created_at,
         pledge_allocations ( favourites ( label ) )`
      )
      .eq("favpoll_poll_id", pollId)
      .is("withdrawn_at", null)
      .order("created_at", { ascending: false })
      .limit(24)
    const rows = (wallRows ?? []) as unknown as WallRow[]
    const clerkIds = [
      ...new Set(
        rows.map((r) => r.clerk_user_id).filter((v): v is string => !!v)
      ),
    ]
    const { data: wallUsers } = clerkIds.length
      ? await supabase
          .from("users")
          .select("id, display_name")
          .in("id", clerkIds)
      : { data: [] as { id: string; display_name: string | null }[] }
    const names = Object.fromEntries(
      (wallUsers ?? []).map((u) => [u.id, u.display_name])
    )
    wallEntries = rows.map((r) => ({
      id: r.id,
      name: r.is_anonymous
        ? null
        : r.clerk_user_id
          ? (names[r.clerk_user_id] ?? null)
          : (r.display_name ?? null),
      labels: (r.pledge_allocations ?? [])
        .map((a) => a.favourites?.label)
        .filter((l): l is string => typeof l === "string"),
      created_at: r.created_at,
    }))
  }
  const isCause = ev.subject === "cause"

  const favpoll: ManageFavpoll = {
    ...mapOrganizerFavpoll(ev),
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
      {/* The guest page's own ground (PageLayout's register wash), so
          manage and the favpoll it manages read as one place
          (founder, 2026-09-03). */}
      <main className="min-h-screen bg-primary/5">
        <ManageClient favpoll={favpoll} wallEntries={wallEntries} />
      </main>
    </RegisterScope>
  )
}
