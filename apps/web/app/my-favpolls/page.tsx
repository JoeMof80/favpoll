import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NewFavpollButton } from "@/components/new-favpoll-button"
import { createAdminClient } from "@/lib/supabase/admin"
import { OrganizerPageClient } from "./organizer-page-client"
import type { OrganizerCardFavpoll } from "@/components/organizer-card/utils"

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
      `
      id,
      opening_line,
      closes_at,
      closed_at,
      occasion_type,
      category,
      grouping,
      subject,
      cause_label,
      total_raised,
      is_listed,
      created_at,
      protagonists!favpolls_protagonist_id_fkey ( name ),
      favpoll_charities ( charities ( id, name, logo_url, registered_number, description ) ),
      favpoll_polls ( id, topics ( title ) ),
      favpoll_pots ( total_deposited, total_allocated )
    `
    )
    .eq("created_by", userId)
    .order("created_at", { ascending: false })

  type RawPot = { total_deposited: number; total_allocated: number }
  type RawFavpoll = {
    id: string
    opening_line: string
    closes_at: string
    closed_at: string | null
    occasion_type: string | null
    category: string | null
    grouping: string | null
    subject: string
    cause_label: string | null
    total_raised: number
    is_listed: boolean
    created_at: string
    protagonists: { name: string } | null
    favpoll_charities: {
      charities: {
        id: string
        name: string
        logo_url: string | null
        registered_number: string | null
        description: string | null
        created_at: string
      }
    }[]
    favpoll_polls: { id: string; topics: { title: string } | null } | null
    favpoll_pots: RawPot | null
  }

  const favpolls: OrganizerCardFavpoll[] = (
    (rawFavpolls ?? []) as unknown as RawFavpoll[]
  ).map((ev) => ({
    id: ev.id,
    opening_line: ev.opening_line,
    closes_at: ev.closes_at,
    closed_at: ev.closed_at,
    occasion_type: ev.occasion_type,
    category: ev.category,
    grouping: ev.grouping,
    subject: ev.subject,
    cause_label: ev.cause_label,
    total_raised: ev.total_raised,
    is_listed: ev.is_listed ?? true,
    created_at: ev.created_at,
    protagonist: ev.protagonists ?? null,
    charities: ev.favpoll_charities.map((ec) => ({ charity: ec.charities })),
    poll: ev.favpoll_polls
      ? { id: ev.favpoll_polls.id, topic: ev.favpoll_polls.topics ?? null }
      : null,
    pot: ev.favpoll_pots ?? null,
  }))

  return (
    <main className="mx-auto max-w-330 px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-medium text-foreground">Your favpolls</h1>
        <NewFavpollButton size="lg">New favpoll</NewFavpollButton>
      </div>

      {favpolls.length > 0 ? (
        <OrganizerPageClient favpolls={favpolls} />
      ) : (
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            You haven&apos;t created any favpolls yet.
          </p>
          <NewFavpollButton className="mt-4">
            Create your first favpoll
          </NewFavpollButton>
        </div>
      )}
    </main>
  )
}
