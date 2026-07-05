"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function setExemplar(
  favpollId: string,
  value: boolean,
): Promise<{ error: string | null }> {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("favpolls")
    .update({ is_exemplar: value })
    .eq("id", favpollId);

  if (error) return { error: error.message };

  revalidatePath("/favpolls");
  return { error: null };
}
