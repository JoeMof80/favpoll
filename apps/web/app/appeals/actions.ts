"use server"

import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { canManageAppeals } from "@/lib/appeals-admin"

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type AppealInput = {
  name: string
  slug: string
  charityId: string
  blurb?: string
  photoUrl?: string
  closesAt?: string | null
  isListed?: boolean
}

async function requireManager() {
  const { userId } = await auth()
  if (!canManageAppeals(userId)) throw new Error("Not authorised")
  return userId as string
}

export async function createAppeal(
  input: AppealInput
): Promise<{ slug?: string; error?: string }> {
  const userId = await requireManager()
  const name = input.name.trim()
  const slug = input.slug.trim().toLowerCase()
  if (!name) return { error: "Name is required." }
  if (!SLUG_RE.test(slug))
    return { error: "Slug must be lowercase words joined by hyphens." }
  if (!input.charityId) return { error: "Charity is required." }

  const supabase = createAdminClient()
  const { error } = await supabase.from("appeals").insert({
    name,
    slug,
    charity_id: input.charityId,
    blurb: input.blurb?.trim() || null,
    photo_url: input.photoUrl?.trim() || null,
    closes_at: input.closesAt || null,
    is_listed: input.isListed ?? false,
    created_by: userId,
  })
  if (error) return { error: error.message }
  revalidatePath(`/appeals/${slug}`)
  return { slug }
}

export async function updateAppeal(
  id: string,
  input: Omit<AppealInput, "slug" | "charityId">
): Promise<{ error?: string }> {
  await requireManager()
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
      name: input.name.trim(),
      blurb: input.blurb?.trim() || null,
      photo_url: input.photoUrl?.trim() || null,
      closes_at: input.closesAt || null,
      is_listed: input.isListed ?? false,
    })
    .eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/appeals/${existing.slug}`)
  return {}
}
