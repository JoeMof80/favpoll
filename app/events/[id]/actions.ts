'use server'

import { auth } from '@clerk/nextjs/server'
import { createAdminClient } from '@/lib/supabase/admin'

type PledgeAllocationInput = {
  topicItemId: string
  amount: number
}

type CreatePledgeInput = {
  eventPollId: string
  potAllocationId: string | null
  totalAmount: number
  allocations: PledgeAllocationInput[]
}

const FEE_RATE = 0.03

export async function createPledge(input: CreatePledgeInput) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const fee = Math.round(input.totalAmount * FEE_RATE * 100) / 100
  const supabase = createAdminClient()

  const { data: pledge, error: pledgeErr } = await supabase
    .from('pledges')
    .insert({
      event_poll_id: input.eventPollId,
      clerk_user_id: userId,
      pot_allocation_id: input.potAllocationId,
      total_amount: input.totalAmount,
      fee,
    })
    .select('id')
    .single()

  if (pledgeErr || !pledge) throw new Error(pledgeErr?.message ?? 'Failed to create pledge')

  const { error: allocErr } = await supabase
    .from('pledge_allocations')
    .insert(
      input.allocations
        .filter((a) => a.amount > 0)
        .map((a) => ({
          pledge_id: pledge.id,
          topic_item_id: a.topicItemId,
          amount: a.amount,
        })),
    )

  if (allocErr) throw new Error(allocErr.message)
}

export async function addGuestItem(eventPollId: string, topicId: string, label: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAdminClient()
  const trimmed = label.trim()
  if (!trimmed) throw new Error('Label is required')

  // Re-use existing topic_item if label matches (case-insensitive)
  const { data: existing } = await supabase
    .from('topic_items')
    .select('id')
    .eq('topic_id', topicId)
    .ilike('label', trimmed)
    .maybeSingle()

  let topicItemId: string

  if (existing) {
    topicItemId = existing.id
  } else {
    const { data: newItem, error } = await supabase
      .from('topic_items')
      .insert({ topic_id: topicId, label: trimmed, source: 'guest', is_master: false })
      .select('id')
      .single()
    if (error || !newItem) throw new Error(error?.message ?? 'Failed to create item')
    topicItemId = newItem.id
  }

  const { error: epiErr } = await supabase.from('event_poll_items').insert({
    event_poll_id: eventPollId,
    topic_item_id: topicItemId,
    is_guest_added: true,
    added_by: userId,
  })
  if (epiErr) throw new Error(epiErr.message)
}

export async function removeEventPollItem(id: string) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAdminClient()
  const { error } = await supabase.from('event_poll_items').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function topUpFund(eventId: string, amount: number) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const supabase = createAdminClient()

  const { data: pot } = await supabase
    .from('event_pots')
    .select('id, total_deposited')
    .eq('event_id', eventId)
    .single()

  if (!pot) throw new Error('No fund found for this event')

  const { error } = await supabase
    .from('event_pots')
    .update({ total_deposited: pot.total_deposited + amount })
    .eq('id', pot.id)

  if (error) throw new Error(error.message)
}
