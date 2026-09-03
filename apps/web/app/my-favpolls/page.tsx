import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewFavpollButton } from "@/components/new-favpoll-button"
import { NewFavpollFab } from "@/components/new-favpoll-fab"
import { createAdminClient } from "@/lib/supabase/admin"
import { withLiveTotals } from "@/lib/live-totals"
import {
  ORGANIZER_FAVPOLL_COLUMNS,
  mapOrganizerFavpoll,
  type RawOrganizerRow,
} from "@/lib/organizer-favpolls"
import { OrganizerPageClient } from "./organizer-page-client"

export const metadata = {
  title: "Your favpolls — favpoll",
}

export default async function MyFavpollsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const supabase = createAdminClient()

  const { data: rawFavpolls } = await supabase
    .from("favpolls")
    .select(
      `${ORGANIZER_FAVPOLL_COLUMNS},
      protagonists!favpolls_protagonist_id_fkey ( name ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number, description ) ),
      favpoll_polls ( id, personal_reveal, topics ( title ), pledges ( count ) ),
      favpoll_pots ( total_deposited, total_allocated )`
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  // total_raised is settlement-only (0 until close) — overlay live sums,
  // like every other money surface (the organiser row showed £0 against a
  // pledged poll; founder catch 2026-07-29)
  const withTotals = await withLiveTotals(
    supabase,
    (rawFavpolls ?? []) as unknown as RawOrganizerRow[]
  )

  const favpolls = withTotals.map(mapOrganizerFavpoll)

  return (
    <main className="min-h-screen bg-muted">
      {favpolls.length > 0 ? (
        <OrganizerPageClient favpolls={favpolls} />
      ) : (
        <div className="mx-auto max-w-330 px-4 pt-24 pb-16 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any favpolls yet.
          </p>
          <NewFavpollButton className="mt-4">
            Create your first favpoll
          </NewFavpollButton>
        </div>
      )}
      <NewFavpollFab />
    </main>
  )
}
