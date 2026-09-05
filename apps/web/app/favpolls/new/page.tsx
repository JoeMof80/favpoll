import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewFavpollWizard } from "@/components/new-favpoll-wizard"
import type { FavpollCategory } from "@favpoll/types"
import { getWizardData } from "./wizard-data"

const CATEGORIES: FavpollCategory[] = ["celebration", "memorial", "fundraiser"]

export default async function NewFavpollPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; appeal?: string }>
}) {
  const { category, appeal: appealSlug } = await searchParams
  // The register CTAs preselect their event (founder, 2026-09-04:
  // "Create a celebration favpoll" must deliver exactly that). Anything
  // else in the param is ignored, not erred on.
  const initialCategory = CATEGORIES.includes(category as FavpollCategory)
    ? (category as FavpollCategory)
    : undefined

  const { userId } = await auth()
  if (!userId) {
    // Keep the preselects through the sign-in round trip.
    const params = new URLSearchParams()
    if (initialCategory) params.set("category", initialCategory)
    if (appealSlug) params.set("appeal", appealSlug)
    const qs = params.toString()
    const dest = qs ? `/favpolls/new?${qs}` : "/favpolls/new"
    redirect(`/sign-in?redirect_url=${encodeURIComponent(dest)}`)
  }

  const data = await getWizardData()

  // The appeal join link (concept, 2026-09-05): resolve the slug to a
  // live appeal; a stale or unknown slug degrades to a plain wizard.
  let appeal = undefined
  if (appealSlug) {
    const supabase = (await import("@/lib/supabase/admin")).createAdminClient()
    const { data: a } = await supabase
      .from("appeals")
      .select("id, name, charity_id, closes_at, opens_at, charities(name)")
      .eq("slug", appealSlug)
      .maybeSingle()
    const open =
      a &&
      new Date(a.opens_at) <= new Date() &&
      (!a.closes_at || new Date(a.closes_at) > new Date())
    if (a && open) {
      appeal = {
        id: a.id,
        name: a.name,
        charityId: a.charity_id,
        charityName:
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (a.charities as any)?.name ?? "",
        closesAt: a.closes_at,
      }
    }
  }

  return (
    <NewFavpollWizard
      data={data}
      initialCategory={initialCategory}
      appeal={appeal}
    />
  )
}
