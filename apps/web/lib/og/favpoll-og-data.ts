import { createAdminClient } from "@/lib/supabase/admin"
import type { FavpollOgSource } from "./favpoll-og"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const FAVPOLL_OG_SELECT =
  "id, subject, cause_label, occasion_type, opening_line, is_private, is_listed, photo_url, closes_at, closed_at, " +
  "protagonists!favpolls_protagonist_id_fkey(name, photo_url), " +
  "favpoll_charities(charities(name)), " +
  "favpoll_polls(topics(title))"

// The slice of a favpoll its share preview needs. Read by generateMetadata
// on the favpoll page and by its opengraph-image route — two separate
// requests, so this is a plain fetch rather than a cached one.
export async function getFavpollOgSource(
  id: string
): Promise<FavpollOgSource | null> {
  // Crawlers probe with all sorts; an invalid uuid is a 400 from PostgREST,
  // so answer it here without the round trip.
  if (!UUID_RE.test(id)) return null

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("favpolls")
    .select(FAVPOLL_OG_SELECT)
    .eq("id", id)
    .maybeSingle()

  return (data as unknown as FavpollOgSource | null) ?? null
}
