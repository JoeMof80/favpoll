'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'

export async function withdrawPledge(formData: FormData) {
  const token = formData.get('token') as string
  if (!token) return

  const supabase = createAdminClient()

  // Verify pledge still exists, not withdrawn, and event is still open
  const { data: pledge } = await supabase
    .from('pledges')
    .select('id, withdrawn_at, event_polls(events(closes_at, id))')
    .eq('guest_token', token)
    .is('withdrawn_at', null)
    .maybeSingle()

  if (!pledge) redirect('/pledges/withdraw/invalid')

  const eventData = (pledge.event_polls as any)?.events
  const closesAt = eventData?.closes_at
  const eventId = eventData?.id

  if (closesAt && new Date(closesAt) < new Date()) {
    redirect(`/events/${eventId}`)
  }

  await supabase
    .from('pledges')
    .update({ withdrawn_at: new Date().toISOString(), guest_token: null })
    .eq('id', pledge.id)

  redirect(`/events/${eventId}?withdrawn=1`)
}
