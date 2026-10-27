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

import { cookies, headers } from "next/headers"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { asResult, type ActionResult } from "@/lib/action-result"
import { ipFromHeaders, isRateLimited } from "@/lib/rate-limit"
import { parseFormData } from "@/lib/action-input"
import {
  personPhotoSchema,
  photoExtension,
} from "@/app/favpolls/new/create-favpoll-input"
import type { WizardDraft, DraftClaim } from "./wizard-draft-types"

/** The cookie that carries the draft between the wizard and the sign-in. */
const COOKIE = "favpoll_wizard_draft"

// Long enough to survive a verification email read on a phone an hour
// later, short enough that an abandoned draft is not kept for ever. The
// row is pruned on age; this only governs how long the browser keeps
// pointing at it.
const COOKIE_MAX_AGE_S = 60 * 60 * 24 * 7

/** The same bucket published photos live in — see uploadDraftPhoto. */
const PHOTO_BUCKET = "protagonists"

// An unauthenticated upload endpoint with no ceiling is an invitation, and
// this one writes files. Per address, because an anonymous visitor has
// nothing else to key on. Generous enough that nobody recropping a photo
// meets it: lib/actions/generate-draft.ts uses the same shape.
const PHOTO_LIMITS = [
  { name: "5m", max: 10, windowSeconds: 300 },
  { name: "1h", max: 30, windowSeconds: 3600 },
]

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
export async function claimWizardDraft(): Promise<ActionResult<DraftClaim>> {
  return asResult(async () => {
    const { userId } = await auth()
    if (!userId) throw new Error("Not authenticated")

    const jar = await cookies()
    const id = jar.get(COOKIE)?.value
    if (!id) return { claimed: false, photoUrl: null }

    // Claiming is the UPDATE itself: `is("claimed_at", null)` makes two
    // simultaneous publishes race for one row, and the loser matches
    // nothing rather than both going through.
    const supabase = createAdminClient()
    const { data } = await supabase
      .from("wizard_drafts")
      .update({ claimed_at: new Date().toISOString(), claimed_by: userId })
      .eq("id", id)
      .is("claimed_at", null)
      .select("id, photo_path")
      .maybeSingle()

    jar.delete(COOKIE)
    if (!data) return { claimed: false, photoUrl: null }

    const photoUrl = data.photo_path
      ? await moveDraftPhotoToOrganiser(data.photo_path, userId)
      : null
    return { claimed: true, photoUrl }
  })
}

/**
 * Move a draft's photo under the organiser who just claimed it.
 *
 * ON FAILURE THIS RETURNS THE DRAFT URL RATHER THAN THROWING. The file is
 * public and readable either way, so a tidy-up that fails is not a reason
 * to refuse someone their favpoll after they have signed up for it. The
 * pruner is what makes that safe: it skips rows with `claimed_at` set, so a
 * photo still sitting under `drafts/` is not swept out from under a
 * published favpoll.
 */
async function moveDraftPhotoToOrganiser(
  fromPath: string,
  userId: string
): Promise<string> {
  const supabase = createAdminClient()
  const to = `${userId}/${fromPath.split("/").pop()}`

  const { error } = await supabase.storage.from(PHOTO_BUCKET).move(fromPath, to)

  const path = error ? fromPath : to
  return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
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

/**
 * Upload a photo for a draft, with no account.
 *
 * `uploadPersonPhoto` keys storage by `userId` and refuses without one, so
 * an anonymous wizard cannot use it. This writes to `drafts/<draftId>/`
 * instead, and claimWizardDraft moves the file under the organiser when the
 * favpoll is published.
 *
 * NO NEW EXPOSURE. The bucket is public and the signed-in path already
 * uploads before `createFavpoll` runs, so a photo has always been readable
 * at its URL before the favpoll existed. The key carries a uuid, so it is
 * not enumerable.
 *
 * Creates the draft row if this is the first thing the visitor does, since
 * a photo needs a draft id to belong to.
 */
export async function uploadDraftPhoto(
  formData: FormData
): Promise<ActionResult<string>> {
  return asResult(async () => {
    const ip = ipFromHeaders(await headers())
    if (await isRateLimited("draft-photo-ip", ip, PHOTO_LIMITS))
      throw new Error("Too many uploads — please try again in a few minutes.")

    // The same schema the signed-in path uses: size, emptiness and type,
    // none of which `formData.get("photo") as File` would have caught
    // (#1109).
    const { photo: file } = parseFormData(
      personPhotoSchema,
      formData,
      "uploadDraftPhoto"
    )

    const jar = await cookies()
    let draftId = jar.get(COOKIE)?.value ?? null
    if (!draftId) {
      const created = await saveWizardDraft({})
      if (!created.ok) throw new Error(created.error)
      draftId = created.value
    }

    const supabase = createAdminClient()
    await supabase.storage
      .createBucket(PHOTO_BUCKET, { public: true })
      .catch(() => null)

    // The extension comes from the TYPE, never the filename — a name of
    // "../../../etc/passwd" would otherwise choose part of the key.
    const path = `drafts/${draftId}/${Date.now()}.${photoExtension(file.type)}`
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: true,
      })
    if (error) throw new Error(`Upload failed: ${error.message}`)

    // Remember it on the row, so the claim knows what to move even if the
    // visitor never saves again.
    await supabase
      .from("wizard_drafts")
      .update({ photo_path: path, updated_at: new Date().toISOString() })
      .eq("id", draftId)

    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl
  })
}
