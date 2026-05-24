'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export type Contribution = {
  id: string
  label: string
  topic_id: string
  topic_title: string
  event_title: string
  event_id: string
  protagonist_name: string
  review_status: 'pending' | 'accepted' | 'rejected'
  rejection_reason: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
}

export async function getPendingContributions(): Promise<{
  data: Contribution[] | null
  error: string | null
}> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('topic_items')
    .select(
      `id, label, topic_id, review_status, rejection_reason, reviewed_at, reviewed_by, created_at,
       topics!inner(title, event_polls!inner(event_id, events!inner(id, occasion_label, protagonists!events_protagonist_id_fkey(name))))`,
    )
    .eq('review_status', 'pending')
    .eq('source', 'guest')
    .order('created_at', { ascending: true })

  if (error) return { data: null, error: error.message }

  const rows = (data ?? []).map((item: any) => ({
    id: item.id,
    label: item.label,
    topic_id: item.topic_id,
    topic_title: item.topics?.title ?? '',
    event_id: item.topics?.event_polls?.[0]?.events?.id ?? '',
    event_title: item.topics?.event_polls?.[0]?.events?.occasion_label ?? '',
    protagonist_name: item.topics?.event_polls?.[0]?.events?.protagonists?.name ?? '',
    review_status: item.review_status,
    rejection_reason: item.rejection_reason,
    reviewed_at: item.reviewed_at,
    reviewed_by: item.reviewed_by,
    created_at: item.created_at,
  }))

  return { data: rows, error: null }
}

export async function getReviewedContributions(): Promise<{
  data: Contribution[] | null
  error: string | null
}> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('topic_items')
    .select(
      `id, label, topic_id, review_status, rejection_reason, reviewed_at, reviewed_by, created_at,
       topics!inner(title, event_polls!inner(event_id, events!inner(id, occasion_label, protagonists!events_protagonist_id_fkey(name))))`,
    )
    .neq('review_status', 'pending')
    .eq('source', 'guest')
    .order('reviewed_at', { ascending: false })

  if (error) return { data: null, error: error.message }

  const rows = (data ?? []).map((item: any) => ({
    id: item.id,
    label: item.label,
    topic_id: item.topic_id,
    topic_title: item.topics?.title ?? '',
    event_id: item.topics?.event_polls?.[0]?.events?.id ?? '',
    event_title: item.topics?.event_polls?.[0]?.events?.occasion_label ?? '',
    protagonist_name: item.topics?.event_polls?.[0]?.events?.protagonists?.name ?? '',
    review_status: item.review_status,
    rejection_reason: item.rejection_reason,
    reviewed_at: item.reviewed_at,
    reviewed_by: item.reviewed_by,
    created_at: item.created_at,
  }))

  return { data: rows, error: null }
}

export async function acceptContribution(itemId: string): Promise<{ error: string | null }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('topic_items')
    .update({
      review_status: 'accepted',
      is_canonical: true,
      rejection_reason: null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('review_status', 'pending')

  if (error) return { error: error.message }

  revalidatePath('/contributions')
  return { error: null }
}

export async function rejectContribution(
  itemId: string,
  reason: string,
): Promise<{ error: string | null }> {
  const trimmedReason = reason.trim()
  if (!trimmedReason) return { error: 'A rejection reason is required.' }

  const supabase = createAdminClient()

  // Hide on all event poll items for this topic item so it's not shown to guests
  const { error: hideError } = await supabase
    .from('event_poll_items')
    .update({ is_hidden: true, hidden_at: new Date().toISOString() })
    .eq('topic_item_id', itemId)

  if (hideError) return { error: hideError.message }

  const { error } = await supabase
    .from('topic_items')
    .update({
      review_status: 'rejected',
      rejection_reason: trimmedReason,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', itemId)
    .eq('review_status', 'pending')

  if (error) return { error: error.message }

  revalidatePath('/contributions')
  return { error: null }
}
