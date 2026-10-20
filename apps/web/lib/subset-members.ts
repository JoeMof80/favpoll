import type { createAdminClient } from "@/lib/supabase/admin"

/**
 * WHY THIS IS NOT IN A "use server" FILE (#1109, 2026-10-20).
 *
 * It lived in `app/favpolls/new/actions.ts` and was exported from it, so
 * Next published it as an HTTP endpoint — one that can never do anything,
 * because its first parameter is a Supabase client and a client cannot
 * cross the wire. Validating it would have been guarding a door into a
 * wall. Moving it closes the door instead: three action files import it
 * (new, edit, manage) and all three are server-side callers, which is
 * what it was always for.
 */

/** The subset's members, as the poll's rows (favpoll-topic-rules §1). */
export async function insertSubsetMembers(
  supabase: ReturnType<typeof createAdminClient>,
  favpollPollId: string,
  subsetId: string,
  userId: string
) {
  const { data: members } = await supabase
    .from("topic_subset_items")
    .select("favourite_id")
    .eq("subset_id", subsetId)
  const ids = (members ?? []).map((m) => m.favourite_id as string)
  if (ids.length === 0) return
  await supabase.from("favpoll_poll_favourites").insert(
    ids.map((favourite_id) => ({
      favpoll_poll_id: favpollPollId,
      favourite_id,
      is_guest_added: false,
      added_by: userId,
    }))
  )
}
