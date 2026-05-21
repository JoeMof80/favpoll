import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { EventCanvas } from '@/components/event-canvas'
import { updateEvent } from './actions'
import { OCCASION_LABELS } from '@/lib/occasions'
import type {
  Category,
  Charity,
  Topic,
  TopicItem,
  TopicWithMeta,
  CanvasSubmitData,
  CanvasInitialData,
  CanvasPoll,
} from '@/types'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect(`/sign-in?redirect_url=/events/${id}/edit`)

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, protagonists!events_protagonist_id_fkey(*), event_charities(charity_id)')
    .eq('id', id)
    .single()

  if (!event) notFound()
  if (event.created_by !== userId) redirect(`/events/${id}`)

  const [
    { data: rawPolls },
    { data: charities },
    { data: topicsAll },
    { data: categories },
    { data: pot },
  ] = await Promise.all([
    supabase.from('event_polls').select('*').eq('event_id', id).order('created_at'),
    supabase.from('charities').select('*').order('name'),
    supabase
      .from('topics')
      .select('*, topic_items(*), topic_categories(category_id)')
      .order('title'),
    supabase.from('categories').select('*').order('label'),
    supabase.from('event_pots').select('*').eq('event_id', id).maybeSingle(),
  ])

  const polls = rawPolls ?? []

  const enrichedTopics: TopicWithMeta[] = (topicsAll ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id,
    ),
  }))

  // For infinite topics, fetch the curated event_poll_items
  const infinitePollIds = polls
    .filter((p) => {
      const topic = enrichedTopics.find((t) => t.id === p.topic_id)
      return topic && !topic.is_finite
    })
    .map((p) => p.id)

  const epiByPollId: Record<string, string[]> = {}
  if (infinitePollIds.length > 0) {
    const { data: epiData } = await supabase
      .from('event_poll_items')
      .select('event_poll_id, topic_item_id, is_prioritized')
      .in('event_poll_id', infinitePollIds)
      .eq('is_guest_added', false)
      .order('display_order', { ascending: true })

    for (const epi of epiData ?? []) {
      if (epi.is_prioritized) {
        ;(epiByPollId[epi.event_poll_id] ??= []).push(epi.topic_item_id)
      }
    }
  }

  const closesAtLocal = new Date(event.closes_at).toISOString().slice(0, 16)

  const initialPolls: CanvasPoll[] = polls.map((poll) => {
    const topic = enrichedTopics.find((t) => t.id === poll.topic_id)
    const isInfinite = topic && !topic.is_finite
    return {
      key: poll.id,
      id: poll.id,
      topicId: poll.topic_id as string,
      topicIsCustom: false,
      customTopicTitle: '',
      customTopicItems: [],
      reveal: poll.personal_reveal ?? '',
      prioritizedItemIds: isInfinite ? (epiByPollId[poll.id] ?? []) : [],
      prioritizedCustomLabels: [],
      curatedCustomLabels: [],
      pickingTopic: false,
    }
  })

  const initialData: CanvasInitialData = {
    protagonistName: event.protagonists.name,
    protagonistBio: event.protagonists.bio ?? '',
    photoUrl: event.protagonists.photo_url ?? null,
    dateLabel: event.protagonists.date_label ?? '',
    occasion: event.occasion,
    occasionLabel: event.occasion_label ?? OCCASION_LABELS[event.occasion] ?? '',
    description: event.description ?? '',
    charityIds: (event.event_charities ?? []).map(
      (ec: { charity_id: string }) => ec.charity_id,
    ),
    closesAt: closesAtLocal,
    isPrivate: event.is_private,
    potAmount: pot?.total_deposited?.toString() ?? '',
    polls: initialPolls,
  }

  async function handleSave(data: CanvasSubmitData) {
    'use server'
    await updateEvent(id, event.protagonist_id, data)
    redirect(`/events/${id}`)
  }

  return (
    <EventCanvas
      mode="edit"
      charities={(charities ?? []) as Charity[]}
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
      initialData={initialData}
      onSave={handleSave}
      eventId={id}
      extensionCount={event.extension_count ?? 0}
      hardCloseAt={event.hard_close_at ?? null}
    />
  )
}
