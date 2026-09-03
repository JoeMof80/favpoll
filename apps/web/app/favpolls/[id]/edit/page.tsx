import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NewFavpollWizard } from "@/components/new-favpoll-wizard"
import type { WizardEditConfig } from "@/components/new-favpoll-wizard/use-wizard-state"
import { getWizardData } from "@/app/favpolls/new/wizard-data"
import type {
  FavpollCategory,
  FavpollGrouping,
  FavpollSubject,
  Pronoun,
} from "@favpoll/types"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"

type Props = { params: Promise<{ id: string }> }

// The wizard edits (extended-wizard Phase 2): the same six steps render
// prefilled, the rail is clickable, the final button is Save. Once any
// money has moved — a pledge or a shared-fund deposit — Event, Charity
// and Topic lock (read-only here; updateFavpoll enforces the same rule).
export default async function EditFavpollPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=/favpolls/${id}/edit`)

  const supabase = createAdminClient()

  const { data: favpoll } = await supabase
    .from("favpolls")
    .select(
      "*, protagonists!favpolls_protagonist_id_fkey(*), favpoll_charities(charity_id)"
    )
    .eq("id", id)
    .single()

  if (!favpoll) notFound()
  if (favpoll.created_by !== userId) redirect(`/favpolls/${id}`)

  const [data, { data: rawPoll }, { data: pot }] = await Promise.all([
    getWizardData(),
    supabase
      .from("favpoll_polls")
      .select("*")
      .eq("favpoll_id", id)
      .maybeSingle(),
    supabase
      .from("favpoll_pots")
      .select("total_deposited")
      .eq("favpoll_id", id)
      .maybeSingle(),
  ])

  let pledgeCount = 0
  if (rawPoll?.id) {
    const { count } = await supabase
      .from("pledges")
      .select("id", { count: "exact", head: true })
      .eq("favpoll_poll_id", rawPoll.id)
    pledgeCount = count ?? 0
  }
  const locked = pledgeCount > 0 || (pot?.total_deposited ?? 0) > 0

  let preselectedTopics: FavpollFormValues["topics"] = []
  if (rawPoll?.topic_id) {
    const topic = data.topics.find((t) => t.id === rawPoll.topic_id)
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

  const category = (favpoll.category ?? null) as FavpollCategory | null
  const grouping = (favpoll.grouping ?? "individual") as FavpollGrouping
  const subject = (favpoll.subject ?? "someone") as FavpollSubject
  const isCause = subject === "cause"

  const edit: WizardEditConfig = {
    favpollId: id,
    protagonistId: favpoll.protagonist_id ?? null,
    existingPollId: rawPoll?.id ?? null,
    locked,
    initialClosesAt: favpoll.closes_at ?? null,
    initial: {
      category,
      grouping,
      subject,
      pronoun: isCause
        ? undefined
        : ((favpoll.protagonists?.pronoun ?? undefined) as Pronoun | undefined),
      charityIds: (favpoll.favpoll_charities ?? []).map(
        (ec: { charity_id: string }) => ec.charity_id
      ),
      topics: preselectedTopics,
      openingLine: favpoll.opening_line ?? "",
      // The cause's label lives in the Name field in the wizard.
      name: isCause
        ? (favpoll.cause_label ?? "")
        : (favpoll.protagonists?.name ?? ""),
      context: isCause
        ? (favpoll.context ?? "")
        : (favpoll.protagonists?.context ?? ""),
      photoUrl: isCause
        ? (favpoll.photo_url ?? null)
        : (favpoll.protagonists?.photo_url ?? null),
      about: isCause
        ? (favpoll.description ?? "")
        : (favpoll.protagonists?.about ?? ""),
      reveal: rawPoll?.personal_reveal ?? "",
      goalAmount: favpoll.goal_amount ?? undefined,
      isListed: favpoll.is_listed ?? true,
      isPrivate: favpoll.is_private ?? false,
      allowGuestItems: favpoll.allow_guest_items !== false,
    },
  }

  return <NewFavpollWizard data={data} edit={edit} />
}
