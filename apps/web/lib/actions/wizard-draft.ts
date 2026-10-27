"use server"

// THE WIZARD'S WAITING ROOM.
//
// Pressing Publish while signed out sends the visitor to /sign-in, which is
// a full navigation: the wizard's React state is gone and so is any File it
// held. This module is what survives that — a row keyed by an id the visitor
// carries in an httpOnly cookie, written on the way out and read on the way
// back. See supabase/migrations/20261027120000_wizard_drafts.sql for why it
// is a table and not browser storage.
//
// Nothing here trusts the caller to say WHICH draft. The id comes from the
// cookie and only from the cookie: a draft holds a name, a photo and the
// About text before anyone has agreed to publish them, so taking an id from
// an argument would let anyone who guessed a uuid read one.

import { cookies } from "next/headers"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { asResult, type ActionResult } from "@/lib/action-result"
import type { WizardDraft } from "./wizard-draft-types"

/** The cookie that carries the draft between the wizard and the sign-in. */
const COOKIE = "favpoll_wizard_draft"

// Long enough to survive a verification email read on a phone an hour
// later, short enough that an abandoned draft is not kept for ever. The
// row is pruned on age; this only governs how long the browser keeps
// pointing at it.
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 7

async function draftIdFromCookie(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null
}

/**
 * Write the wizard's values, creating the draft on first call.
 *
 * Returns the draft id, which the caller does not need — it is in the
 * cookie — but which makes the action testable and the logs legible.
 */
export async function saveWizardDraft(
  payload: unknown,
  photoPath?: string | null
): Promise<ActionResult<string>> {
  return asResult(async () => {
    const supabase = createAdminClient()
    const jar = await cookies()
    const existing = jar.get(COOKIE)?.value ?? null

    // An UPDATE that matches nothing is not an error, so a cookie pointing
    // at a pruned draft would silently save nothing. Ask whether the row
    // is still there rather than assume the cookie is good.
    if (existing) {
      const { data } = await supabase
        .from("wizard_drafts")
        .update({
          payload,
          ...(photoPath === undefined ? {} : { photo_path: photoPath }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing)
        .is("claimed_at", null)
        .select("id")
        .maybeSingle()
      if (data?.id) return data.id
    }

    const { data, error } = await supabase
      .from("wizard_drafts")
      .insert({ payload, photo_path: photoPath ?? null })
      .select("id")
      .single()
    if (error) throw new Error(error.message)

    jar.set(COOKIE, data.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: COOKIE_MAX_AGE_S,
    })
    return data.id
  })
}

/**
 * The draft this browser is carrying, or null.
 *
 * A claimed draft reads as absent. It has already become a favpoll, and
 * returning it would reopen the wizard on something published.
 */
export async function loadWizardDraft(): Promise<WizardDraft | null> {
  const id = await draftIdFromCookie()
  if (!id) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("wizard_drafts")
    .select("id, payload, photo_path")
    .eq("id", id)
    .is("claimed_at", null)
    .maybeSingle()

  if (!data) return null
  return { id: data.id, payload: data.payload, photoPath: data.photo_path }
}

/**
 * Mark the draft published and stop the browser pointing at it.
 *
 * Returns false when there was nothing to claim — no cookie, a pruned row,
 * or a draft already claimed. That last one is the double-submit case, and
 * false is how the caller knows not to create a second favpoll.
 */
export async function claimWizardDraft(): Promise<ActionResult<boolean>> {
  return asResult(async () => {
    const { userId } = await auth()
    if (!userId) throw new Error("Not authenticated")

    const jar = await cookies()
    const id = jar.get(COOKIE)?.value
    if (!id) return false

    // Claiming is the UPDATE itself: `is("claimed_at", null)` makes two
    // simultaneous publishes race for one row, and the loser matches
    // nothing rather than both going through.
    const { data } = await createAdminClient()
      .from("wizard_drafts")
      .update({ claimed_at: new Date().toISOString(), claimed_by: userId })
      .eq("id", id)
      .is("claimed_at", null)
      .select("id")
      .maybeSingle()

    jar.delete(COOKIE)
    return !!data
  })
}

/** Abandon the draft: the visitor started again, or published elsewhere. */
export async function discardWizardDraft(): Promise<ActionResult<void>> {
  return asResult(async () => {
    const jar = await cookies()
    const id = jar.get(COOKIE)?.value
    jar.delete(COOKIE)
    if (!id) return
    await createAdminClient().from("wizard_drafts").delete().eq("id", id)
  })
}
