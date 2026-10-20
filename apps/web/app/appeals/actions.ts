"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { canManageAppeals } from "@/lib/appeals-admin"
import { actionId, tryParseInput } from "@/lib/action-input"
import { z } from "zod"

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// THESE TWO RETURN, THEY DO NOT THROW (#1109). Their form renders the
// `error` string, so a thrown schema message would break the caller
// instead of informing it — hence tryParseInput rather than parseInput.
// The three hand-written checks createAppeal already had are now the
// schema's, with their own sentences unchanged: the name, the slug's
// shape, and the charity. They were the right checks in the wrong place.
const TOO_LONG = "That's longer than we can store."
const text = (max: number, message: string) =>
  z
    .string(message)
    .transform((t) => t.replace(/\s+/g, " ").trim())
    .refine((t) => t.length <= max, message)

const appealFields = {
  // WRITTEN OUT RATHER THAN BUILT FROM text(), because this field has two
  // different failures and zod answers a wrong TYPE from the CONSTRUCTOR.
  // Sharing one sentence between the constructor and the length check told
  // a caller who sent no name at all that the name was too long.
  name: z
    .string("Name is required.")
    .transform((t) => t.replace(/\s+/g, " ").trim())
    .refine((t) => t.length > 0, "Name is required.")
    .refine((t) => t.length <= 200, "That name is too long."),
  blurb: z.string(TOO_LONG).max(2000, TOO_LONG).optional(),
  photoUrl: text(2000, "That photo link is too long.").optional(),
  /** Written straight to a timestamptz column, which refused anything
   *  else with Postgres's own sentence. This is the sentence instead. */
  closesAt: z.iso
    .datetime({ offset: true, error: "That closing date didn't make sense." })
    .nullable()
    .optional(),
  isListed: z.boolean("Say whether the appeal is listed.").optional(),
  goalAmount: z
    .number("That goal isn't a number we can take.")
    .nonnegative("That goal isn't a number we can take.")
    .nullable()
    .optional(),
}

const createAppealSchema = z.object({
  ...appealFields,
  slug: z
    .string("Slug must be lowercase words joined by hyphens.")
    .transform((t) => t.trim().toLowerCase())
    .refine(
      (t) => SLUG_RE.test(t),
      "Slug must be lowercase words joined by hyphens."
    ),
  charityId: actionId("Charity is required."),
})

const updateAppealSchema = z.object(appealFields)

export type AppealInput = {
  name: string
  slug: string
  charityId: string
  blurb?: string
  photoUrl?: string
  closesAt?: string | null
  isListed?: boolean
  goalAmount?: number | null
}

async function requireManager() {
  const { userId } = await auth()
  if (!canManageAppeals(userId)) throw new Error("Not authorised")
  return userId as string
}

export async function createAppeal(
  rawInput: AppealInput
): Promise<{ slug?: string; error?: string }> {
  const userId = await requireManager()

  const parsed = tryParseInput(createAppealSchema, rawInput, "createAppeal")
  if (!parsed.ok) return { error: parsed.error }
  const input = parsed.data
  const { name, slug } = input

  const supabase = createAdminClient()
  const { error } = await supabase.from("appeals").insert({
    name,
    slug,
    charity_id: input.charityId,
    blurb: input.blurb?.trim() || null,
    photo_url: input.photoUrl || null,
    closes_at: input.closesAt || null,
    is_listed: input.isListed ?? false,
    goal_amount: input.goalAmount ?? null,
    created_by: userId,
  })
  if (error) return { error: error.message }
  revalidatePath(`/appeals/${slug}`)
  return { slug }
}

export async function updateAppeal(
  rawId: string,
  rawInput: Omit<AppealInput, "slug" | "charityId">
): Promise<{ error?: string }> {
  await requireManager()

  // `input.name.trim()` below was a TypeError waiting for an argument
  // without a name — a 500 where the form wanted a sentence.
  const parsedId = tryParseInput(
    actionId("That appeal wasn't recognised."),
    rawId,
    "updateAppeal"
  )
  if (!parsedId.ok) return { error: parsedId.error }
  const parsed = tryParseInput(updateAppealSchema, rawInput, "updateAppeal")
  if (!parsed.ok) return { error: parsed.error }
  const id = parsedId.data
  const input = parsed.data

  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from("appeals")
    .select("slug")
    .eq("id", id)
    .single()
  if (!existing) return { error: "Unknown appeal" }
  const { error } = await supabase
    .from("appeals")
    .update({
      name: input.name,
      blurb: input.blurb?.trim() || null,
      photo_url: input.photoUrl || null,
      closes_at: input.closesAt || null,
      is_listed: input.isListed ?? false,
      goal_amount: input.goalAmount ?? null,
    })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/appeals/${existing.slug}`)
  return {}
}
