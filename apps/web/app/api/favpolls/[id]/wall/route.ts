import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Live guest wall: newest pledges for a favpoll, in GuestWallEntry shape.
// Polled by the realtime wall hook when a pledge lands.
//
// Label gating mirrors the favpoll page's standings gate: backed-favourite
// labels are included only for entitled viewers (organiser, a pledger, or
// anyone once closed) — or for the live display, which authenticates with
// the favpoll's unguessable live_slug (?display_key=…, the same capability
// that opens /live/[slug]). Anonymity is absolute either way: anonymous
// pledges never expose a name on any surface.

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(request.url)
  const displayKey = url.searchParams.get("display_key")
  const guestToken = url.searchParams.get("guest_token")

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("id, created_by, closed_at, closes_at, live_slug")
    .eq("id", id)
    .single()

  if (!favpoll) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const { data: poll } = await supabase
    .from("favpoll_polls")
    .select("id")
    .eq("favpoll_id", id)
    .maybeSingle()

  if (!poll) {
    return NextResponse.json({ entries: [] })
  }

  const isClosed =
    !!favpoll.closed_at || new Date(favpoll.closes_at) < new Date()

  // Entitlement for backed-labels (never affects names/anonymity)
  let entitled = (!!displayKey && displayKey === favpoll.live_slug) || isClosed
  if (!entitled) {
    const { userId } = await auth()
    if (userId) {
      if (userId === favpoll.created_by) {
        entitled = true
      } else {
        const { data } = await supabase
          .from("pledges")
          .select("id")
          .eq("favpoll_poll_id", poll.id)
          .eq("clerk_user_id", userId)
          .is("withdrawn_at", null)
          .limit(1)
        entitled = (data?.length ?? 0) > 0
      }
    }
    if (!entitled && guestToken) {
      const { data } = await supabase
        .from("pledges")
        .select("id")
        .eq("favpoll_poll_id", poll.id)
        .eq("guest_token", guestToken)
        .is("withdrawn_at", null)
        .limit(1)
      entitled = (data?.length ?? 0) > 0
    }
  }

  // Same query + shaping as the favpoll page's server-rendered wall
  const { data: wallRows } = await supabase
    .from("pledges")
    .select(
      `id, display_name, is_anonymous, clerk_user_id, created_at,
       pledge_allocations ( favourites ( label ) )`
    )
    .eq("favpoll_poll_id", poll.id)
    .is("withdrawn_at", null)
    .order("created_at", { ascending: false })
    .limit(24)

  const clerkIds = [
    ...new Set(
      (wallRows ?? [])
        .map((r) => r.clerk_user_id)
        .filter((v): v is string => !!v)
    ),
  ]
  const { data: users } = clerkIds.length
    ? await supabase.from("users").select("id, display_name").in("id", clerkIds)
    : { data: [] }
  const userNames = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u.display_name])
  )

  const entries = (wallRows ?? []).map((r) => ({
    id: r.id,
    name: r.is_anonymous
      ? null
      : r.clerk_user_id
        ? (userNames[r.clerk_user_id] ?? null)
        : (r.display_name ?? null),
    labels: entitled
      ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (r.pledge_allocations ?? [])
          .map((a: any) => a.favourites?.label)
          .filter((l: unknown): l is string => typeof l === "string")
      : [],
    created_at: r.created_at,
  }))

  return NextResponse.json({ entries })
}
