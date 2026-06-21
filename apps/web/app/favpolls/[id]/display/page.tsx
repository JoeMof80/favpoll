import { notFound } from "next/navigation"
import { headers } from "next/headers"
import { createAdminClient } from "@/lib/supabase/admin"
import { DisplayScreen } from "@/components/display-screen"
import type { Favourite } from "@favpoll/types"

type Props = {
  params: Promise<{ id: string }>
}

export default async function DisplayPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      "*, protagonists!favpolls_protagonist_id_fkey(*), favpoll_charities(charities(name))"
    )
    .eq("id", id)
    .single()

  if (!favpoll) notFound()

  const { data: rawPoll } = await supabase
    .from("favpoll_polls")
    .select("*, topics(id, title)")
    .eq("favpoll_id", id)
    .maybeSingle()

  const pollId = rawPoll?.id ?? null

  const { data: allItems } = rawPoll?.topic_id
    ? await supabase
        .from("favourites")
        .select("*")
        .eq("topic_id", rawPoll.topic_id)
    : { data: null }

  // Total raised
  const { data: pledges } = await supabase
    .from("pledges")
    .select("total_amount")
    .eq("favpoll_poll_id", pollId ?? "")
    .is("withdrawn_at", null)

  const initialTotalRaised = (pledges ?? []).reduce(
    (s, p) => s + p.total_amount,
    0
  )

  const charityName =
    (favpoll.favpoll_charities as { charities: { name: string } }[])?.[0]
      ?.charities?.name ?? null

  const displayPoll = rawPoll
    ? {
        id: rawPoll.id,
        personal_reveal: rawPoll.personal_reveal ?? null,
        topic: {
          id:
            (rawPoll.topics as { id: string; title: string } | null)?.id ??
            rawPoll.topic_id,
          title:
            (rawPoll.topics as { id: string; title: string } | null)?.title ??
            "",
        },
        items: (allItems ?? []) as Favourite[],
      }
    : null

  // Derive base URL for QR code
  const headersList = await headers()
  const host = headersList.get("host") ?? ""
  const proto = headersList.get("x-forwarded-proto") ?? "https"
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? `${proto}://${host}`

  return (
    <DisplayScreen
      favpollId={id}
      protagonistName={favpoll.protagonists.name}
      dateLabel={favpoll.protagonists.context ?? null}
      openingLine={favpoll.opening_line ?? null}
      description={favpoll.description ?? null}
      occasionType={favpoll.occasion_type ?? null}
      charityName={charityName}
      poll={displayPoll}
      initialTotalRaised={initialTotalRaised}
      pollId={pollId}
      favpollUrl={`${baseUrl}/favpolls/${id}`}
    />
  )
}
