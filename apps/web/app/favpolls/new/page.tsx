import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewFavpollWizard } from "@/components/new-favpoll-wizard"
import type { FavpollCategory } from "@favpoll/types"
import { getWizardData } from "./wizard-data"

const CATEGORIES: FavpollCategory[] = ["celebration", "memorial", "fundraiser"]

export default async function NewFavpollPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  // The register CTAs preselect their event (founder, 2026-09-04:
  // "Create a celebration favpoll" must deliver exactly that). Anything
  // else in the param is ignored, not erred on.
  const initialCategory = CATEGORIES.includes(category as FavpollCategory)
    ? (category as FavpollCategory)
    : undefined

  const { userId } = await auth()
  if (!userId) {
    // Keep the preselect through the sign-in round trip.
    const dest = initialCategory
      ? `/favpolls/new?category=${initialCategory}`
      : "/favpolls/new"
    redirect(`/sign-in?redirect_url=${encodeURIComponent(dest)}`)
  }

  const data = await getWizardData()

  return <NewFavpollWizard data={data} initialCategory={initialCategory} />
}
