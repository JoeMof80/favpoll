"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

// IN-PLACE EDITING on the manage page (founder, 2026-09-29: "this
// should become where we change things in place"): one field at a
// time, each row its own save. The wizard's whole-payload update keeps
// creation; these mirror its writes and guards for the fields a row
// can hold. Structural things — topic, favourites, charities, the who
// axis — stay with the wizard's locks until their rows arrive.

import { favpollLocks, readLockInputs, lockReason } from "@/lib/favpoll-locks"

export type StoryField =
  | "opening_line"
  | "name"
  | "context"
  | "about"
  | "note"
  | "goal_amount"
  | "photo_url"

// The wizard's own limits (wizard-info-step, wizard-story-step).
const LIMITS: Record<
  Exclude<StoryField, "goal_amount" | "photo_url">,
  number
> = {
  opening_line: 50,
  name: 40,
  context: 40,
  about: 300,
  note: 280,
}

async function ownedOpenFavpoll(favpollId: string) {
  const { userId } = await auth()
  if (!userId) throw new Error("Not authenticated")
  const supabase = createAdminClient()
  const { data: favpoll } = await supabase
    .from("favpolls")
    .select("created_by, closed_at, closes_at, subject, protagonist_id")
    .eq("id", favpollId)
    .single()
  if (!favpoll || favpoll.created_by !== userId) throw new Error("Unauthorized")
  // A settled favpoll is a record (audit, 2026-09-06): nothing is
  // editable after close. Same truth as the wizard's update.
  if (favpoll.closed_at || new Date(favpoll.closes_at) < new Date())
    throw new Error("This favpoll has closed and can no longer be edited.")
  return { supabase, favpoll }
}

export async function updateStoryField(
  favpollId: string,
  field: StoryField,
  value: string | number | null
) {
  const { supabase, favpoll } = await ownedOpenFavpoll(favpollId)
  const isCause = favpoll.subject === "cause"

  if (field === "photo_url") {
    const url = value ? String(value) : null
    const { error } = isCause
      ? await supabase
          .from("favpolls")
          .update({ photo_url: url })
          .eq("id", favpollId)
      : await supabase
          .from("protagonists")
          .update({ photo_url: url })
          .eq("id", favpoll.protagonist_id!)
    if (error) throw new Error(error.message)
    return
  }

  if (field === "goal_amount") {
    const n = value === null || value === "" ? null : Number(value)
    if (n !== null && (!Number.isFinite(n) || n < 0))
      throw new Error("The goal must be a positive amount.")
    const { error } = await supabase
      .from("favpolls")
      .update({ goal_amount: n === 0 ? null : n })
      .eq("id", favpollId)
    if (error) throw new Error(error.message)
    return
  }

  const text = String(value ?? "").trim()
  if (text.length > LIMITS[field])
    throw new Error(`Keep it under ${LIMITS[field]} characters.`)
  if (field === "name" && !text)
    throw new Error(isCause ? "A cause name is required" : "A name is required")
  if (field === "about" && !text) throw new Error("The About is required.")

  const write = async (
    table: "favpolls" | "protagonists" | "favpoll_polls",
    patch: Record<string, string | null>
  ) => {
    let q = supabase.from(table).update(patch)
    q =
      table === "favpolls"
        ? q.eq("id", favpollId)
        : table === "protagonists"
          ? q.eq("id", favpoll.protagonist_id!)
          : q.eq("favpoll_id", favpollId)
    const { error } = await q
    if (error) throw new Error(error.message)
  }

  // Cause favpolls keep name/context/about on the favpoll row; person
  // favpolls store them on the protagonist (the wizard's split).
  switch (field) {
    case "opening_line":
      return write("favpolls", { opening_line: text })
    case "name":
      return isCause
        ? write("favpolls", { cause_label: text })
        : write("protagonists", { name: text })
    case "context":
      return isCause
        ? write("favpolls", { context: text || null })
        : write("protagonists", { context: text || null })
    case "about":
      return isCause
        ? write("favpolls", { description: text })
        : write("protagonists", { about: text })
    case "note":
      return write("favpoll_polls", { personal_note: text || null })
  }
}

// THE CHARITY, replaced in place (step 3, 2026-09-29): the wizard's
// single-select picker in an overlay on the Charities section; this
// carries the whole-favpoll update's guards for the set — the lock
// once anyone else's money is in, and an appeal's fixed charity.
export async function setFavpollCharities(
  favpollId: string,
  charityIds: string[]
) {
  const { supabase, favpoll } = await ownedOpenFavpoll(favpollId)
  const ids = [...new Set(charityIds.filter(Boolean))]
  if (ids.length < 1 || ids.length > 3)
    throw new Error("Pick between one and three charities.")

  const { data: row } = await supabase
    .from("favpolls")
    .select("appeal_id, appeals(charity_id), favpoll_charities(charity_id)")
    .eq("id", favpollId)
    .single()
  const appeal = row?.appeal_id
    ? ((row as unknown as { appeals: { charity_id: string } | null }).appeals ??
      null)
    : null
  if (appeal && ids.join(",") !== appeal.charity_id)
    throw new Error("This favpoll's charity is set by its appeal.")

  const current = ((row?.favpoll_charities ?? []) as { charity_id: string }[])
    .map((c) => c.charity_id)
    .sort()
    .join(",")
  if (current === [...ids].sort().join(",")) return

  const { data: poll } = await supabase
    .from("favpoll_polls")
    .select("id")
    .eq("favpoll_id", favpollId)
    .maybeSingle()
  const locks = favpollLocks(
    await readLockInputs(
      supabase,
      favpollId,
      poll?.id ?? null,
      favpoll.created_by
    )
  )
  if (locks.charity) throw new Error(lockReason(locks, "charity"))

  await supabase.from("favpoll_charities").delete().eq("favpoll_id", favpollId)
  const { error } = await supabase.from("favpoll_charities").insert(
    ids.map((charityId, i) => ({
      favpoll_id: favpollId,
      charity_id: charityId,
      display_order: i,
    }))
  )
  if (error) throw new Error(error.message)
}
