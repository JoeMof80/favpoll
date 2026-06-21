import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { FavpollForm } from "@/components/favpoll-form"
import type {
  Category,
  Charity,
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
  Topic,
  Favourite,
  TopicWithMeta,
} from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"
import { deriveRegister } from "@/lib/registers"

type Props = { params: Promise<{ id: string }> }

export default async function EditFavpollPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=/favpolls/${id}/edit`)

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from("favpolls")
    .select(
      "*, protagonists!favpolls_protagonist_id_fkey(*), favpoll_charities(charity_id)"
    )
    .eq("id", id)
    .single()

  if (!event) notFound()
  if (event.created_by !== userId) redirect(`/favpolls/${id}`)

  const [
    { data: rawPoll },
    { data: charities },
    { data: topicsAll },
    { data: categories },
    { data: pot },
  ] = await Promise.all([
    supabase
      .from("favpoll_polls")
      .select("*")
      .eq("favpoll_id", id)
      .maybeSingle(),
    supabase.from("charities").select("*").eq("is_active", true).order("name"),
    supabase
      .from("topics")
      .select("*, favourites(*), topic_categories(category_id)")
      .order("title"),
    supabase.from("categories").select("*").order("label"),
    supabase
      .from("favpoll_pots")
      .select("*")
      .eq("favpoll_id", id)
      .maybeSingle(),
  ])

  const enrichedTopics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    favourites: (t.favourites ?? []) as Favourite[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  // Build the pre-selected topic for the form
  let preselectedTopics: FavpollFormValues["topics"] = []
  if (rawPoll?.topic_id) {
    const topic = enrichedTopics.find((t) => t.id === rawPoll.topic_id)
    if (topic) {
      preselectedTopics = [
        {
          topicId: topic.id,
          title: topic.title,
          isCustom: false,
          items: topic.favourites.map((i) => ({ id: i.id, label: i.label })),
          customLabels: [],
        },
      ]
    }
  }

  const category = (event.category ?? null) as FavpollCategory | null
  const grouping = (event.grouping ?? "individual") as FavpollGrouping
  const isCause = event.subject === "cause"

  const defaultValues: Partial<FavpollFormValues> = {
    category: category ?? undefined,
    grouping,
    register: deriveRegister(category, grouping),
    subject: (event.subject ?? "someone") as FavpollSubject,
    name: isCause ? "" : (event.protagonists?.name ?? ""),
    context: isCause ? "" : (event.protagonists?.context ?? ""),
    openingLine: event.opening_line ?? "",
    about: isCause
      ? (event.description ?? "")
      : (event.protagonists?.about ?? ""),
    photoUrl: isCause
      ? undefined
      : (event.protagonists?.photo_url ?? undefined),
    causeLabel: isCause ? (event.cause_label ?? "") : "",
    charities: (event.favpoll_charities ?? []).map(
      (ec: { charity_id: string }) => ec.charity_id
    ),
    isListed: event.is_listed ?? true,
    reveal: rawPoll?.personal_reveal ?? "",
    topics: preselectedTopics,
  }

  return (
    <FavpollForm
      mode="edit"
      charities={(charities ?? []) as Charity[]}
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
      favpollId={id}
      protagonistId={event.protagonist_id ?? undefined}
      existingPollId={rawPoll?.id}
      defaultValues={defaultValues}
      initialClosesAt={event.closes_at}
    />
  )
}
