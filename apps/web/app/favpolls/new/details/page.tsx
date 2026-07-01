import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { createAdminClient } from "@/lib/supabase/admin"
import { FavpollForm } from "@/components/favpoll-form"
import { deriveRegister } from "@/lib/registers"
import type {
  Category,
  Charity,
  Favourite,
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
  Pronoun,
  Topic,
  TopicWithMeta,
} from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"

type Props = { searchParams: Promise<Record<string, string>> }

export default async function NewFavpollDetailsPage({ searchParams }: Props) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in?redirect_url=/favpolls/new")

  const params = await searchParams
  const category = (params.category ?? "") as FavpollCategory | ""
  const grouping = (params.grouping ?? "individual") as FavpollGrouping
  const subject = (params.subject ?? "someone") as FavpollSubject
  const pronoun = (params.pronoun ?? undefined) as Pronoun | undefined
  const topicId = params.topicId ?? ""
  const topicIsCustom = params.topicIsCustom === "true"
  const topicTitle = params.topicTitle ?? ""
  const newTopic = params.newTopic === "1"
  const hasDraftAdditions = params.draftAdditions === "1"
  const charityIds = params.charityIds
    ? params.charityIds.split(",").filter(Boolean)
    : []

  const supabase = createAdminClient()
  const [{ data: charities }, { data: topicsAll }, { data: categories }] =
    await Promise.all([
      supabase
        .from("charities")
        .select("*")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("topics")
        .select("*, favourites(*), topic_categories(category_id)")
        .eq("is_active", true)
        .order("title"),
      supabase.from("categories").select("*").order("label"),
    ])

  const enrichedTopics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    favourites: (t.favourites ?? []) as Favourite[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id
    ),
  }))

  let defaultTopics: FavpollFormValues["topics"] = []
  // draftAdditions=1 or newTopic=1: draft in sessionStorage — hydrated client-side in FormInner
  const deferToSessionStorage = hasDraftAdditions || newTopic
  if (!deferToSessionStorage && topicIsCustom && topicTitle) {
    defaultTopics = [
      {
        topicId: "",
        title: topicTitle,
        isCustom: true,
        items: [],
        customLabels: [],
      },
    ]
  } else if (!deferToSessionStorage && topicId) {
    const t = enrichedTopics.find((t) => t.id === topicId)
    if (t) {
      defaultTopics = [
        {
          topicId: t.id,
          title: t.title,
          isCustom: false,
          items: t.favourites.map((i) => ({ id: i.id, label: i.label })),
          customLabels: [],
        },
      ]
    }
  }

  const register = deriveRegister(category || null, grouping)

  const defaultValues: Partial<FavpollFormValues> = category
    ? {
        category: category as FavpollCategory,
        grouping,
        subject,
        ...(pronoun ? { pronoun } : {}),
        register,
        isListed: register !== "remembering",
        topics: defaultTopics,
        charities: charityIds,
      }
    : {}

  return (
    <FavpollForm
      mode="create"
      charities={(charities ?? []) as Charity[]}
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
      defaultValues={defaultValues}
      hasNewTopicDraft={hasDraftAdditions || newTopic}
    />
  )
}
