"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Appeals administration — create and tend appeals BY HAND until the
// charity portal exists (the hand-over path the concept note names:
// references/appeals-concept-2026-09-05.md). No delete: an appeal with
// members is a live commitment; retire by unlisting and letting it
// close.

export type Appeal = {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  photo_url: string | null;
  charity_id: string;
  charity_name: string;
  opens_at: string;
  closes_at: string | null;
  is_listed: boolean;
  created_at: string;
};

export async function getAppeals(): Promise<{
  data: Appeal[] | null;
  error: string | null;
}> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appeals")
    .select(
      "id, slug, name, blurb, photo_url, charity_id, opens_at, closes_at, is_listed, created_at, charities(name)",
    )
    .order("created_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return {
    data: (data ?? []).map((a) => ({
      ...a,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      charity_name: (a as any).charities?.name ?? "",
    })) as Appeal[],
    error: null,
  };
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function createAppeal(input: {
  name: string;
  slug: string;
  charity_id: string;
  blurb?: string;
  photo_url?: string;
  closes_at?: string;
  is_listed?: boolean;
}): Promise<{ error: string | null }> {
  const name = input.name.trim();
  const slug = input.slug.trim().toLowerCase();
  if (!name) return { error: "Name is required." };
  if (!SLUG_RE.test(slug))
    return { error: "Slug must be lowercase words joined by hyphens." };
  if (!input.charity_id) return { error: "Charity is required." };

  const supabase = createAdminClient();
  const { error } = await supabase.from("appeals").insert({
    name,
    slug,
    charity_id: input.charity_id,
    blurb: input.blurb?.trim() || null,
    photo_url: input.photo_url?.trim() || null,
    closes_at: input.closes_at || null,
    is_listed: input.is_listed ?? false,
    created_by: "admin",
  });
  if (error) return { error: error.message };
  revalidatePath("/appeals");
  return { error: null };
}

export async function updateAppeal(
  id: string,
  input: {
    name?: string;
    blurb?: string;
    photo_url?: string;
    closes_at?: string | null;
    is_listed?: boolean;
  },
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();
  const patch: Record<string, unknown> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.blurb !== undefined) patch.blurb = input.blurb.trim() || null;
  if (input.photo_url !== undefined)
    patch.photo_url = input.photo_url.trim() || null;
  if (input.closes_at !== undefined) patch.closes_at = input.closes_at || null;
  if (input.is_listed !== undefined) patch.is_listed = input.is_listed;
  const { error } = await supabase.from("appeals").update(patch).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/appeals");
  return { error: null };
}
