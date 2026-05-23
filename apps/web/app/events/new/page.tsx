import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { EventCanvas } from '@/components/event-canvas'
import type { Category, Charity, Topic, TopicItem, TopicWithMeta } from '@favpoll/types'

export default async function NewEventPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const { topic: preselectedTopicId } = await searchParams

  const supabase = createAdminClient()

  const [{ data: charities }, { data: topics }, { data: categories }] =
    await Promise.all([
      supabase.from('charities').select('*').order('name'),
      supabase
        .from('topics')
        .select('*, topic_items(*), topic_categories(category_id)')
        .eq('is_active', true)
        .order('title'),
      supabase.from('categories').select('*').order('label'),
    ])

  const enrichedTopics: TopicWithMeta[] = (topics ?? []).map((t) => ({
    ...(t as Topic),
    topic_items: (t.topic_items ?? []) as TopicItem[],
    category_ids: (t.topic_categories ?? []).map(
      (tc: { category_id: string }) => tc.category_id,
    ),
  }))

  return (
    <EventCanvas
      mode="create"
      charities={(charities ?? []) as Charity[]}
      topics={enrichedTopics}
      categories={(categories ?? []) as Category[]}
      preselectedTopicId={preselectedTopicId ?? null}
    />
  )
}
