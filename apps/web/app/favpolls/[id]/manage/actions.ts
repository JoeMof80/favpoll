"use server"

import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

// IN-PLACE EDITING on the manage page (founder, 2026-09-29: "this
// should become where we change things in place"): one field at a
// time, each row its own save. The wizard's whole-payload update keeps
// creation; these mirror its writes and guards for the fields a row
// can hold. Structural things — topic, favourites, charities, the who
// axis — stay with the wizard's locks until their rows arrive.

export type StoryField =
  | "opening_line"
  | "name"
  | "context"
  | "about"
  | "note"
  | "goal_amount"

// The wizard's own limits (wizard-info-step, wizard-story-step).
const LIMITS: Record<Exclude<StoryField, "goal_amount">, number> = {
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
