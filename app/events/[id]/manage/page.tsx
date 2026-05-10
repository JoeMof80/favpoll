import { notFound, redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import type { EventWithDetails } from '@/types'

type Props = {
  params: Promise<{ id: string }>
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(amount)
}

export default async function ManageEventPage({ params }: Props) {
  const { id } = await params
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createAdminClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, persons(*), charities(*)')
    .eq('id', id)
    .single()

  if (!event) notFound()
  if (event.created_by !== userId) {
    redirect(`/events/${id}`)
  }

  const typedEvent = event as EventWithDetails

  // Fetch polls
  const { data: polls } = await supabase
    .from('event_polls')
    .select('*, topics(*)')
    .eq('event_id', id)
    .order('created_at')

  // Fetch pledge totals per poll
  const pollIds = (polls ?? []).map((p) => p.id)
  const { data: pledges } = await supabase
    .from('pledges')
    .select('event_poll_id, total_amount')
    .in('event_poll_id', pollIds)
    .is('withdrawn_at', null)

  const pledgeTotalsByPoll: Record<string, number> = {}
  pledges?.forEach((p) => {
    pledgeTotalsByPoll[p.event_poll_id] =
      (pledgeTotalsByPoll[p.event_poll_id] ?? 0) + p.total_amount
  })

  const totalRaised = Object.values(pledgeTotalsByPoll).reduce((s, v) => s + v, 0)
  const isClosed = new Date(event.closes_at) < new Date()

  // Fetch pot info
  const { data: pot } = await supabase
    .from('event_pots')
    .select('*')
    .eq('event_id', id)
    .maybeSingle()

  return (
    <main className="mx-auto max-w-2xl px-4 pb-16 pt-10">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Link href="/events" className="hover:text-foreground">
          Your events
        </Link>
        <span aria-hidden="true">›</span>
        <span>Manage</span>
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">
            {typedEvent.persons.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {typedEvent.charities.name}
          </p>
        </div>
        <Link
          href={`/events/${id}`}
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
        >
          View event
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted-foreground">Total raised</p>
          <p className="mt-1 text-xl font-medium text-primary">
            {formatCurrency(totalRaised)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted-foreground">Status</p>
          <p className="mt-1 text-xl font-medium text-foreground">
            {isClosed ? 'Closed' : 'Active'}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-4">
          <p className="text-xs text-muted-foreground">Polls</p>
          <p className="mt-1 text-xl font-medium text-foreground">
            {polls?.length ?? 0}
          </p>
        </div>
      </div>

      <section className="mt-8" aria-labelledby="polls-heading">
        <h2 id="polls-heading" className="mb-3 text-base font-medium text-foreground">
          Polls
        </h2>
        {polls && polls.length > 0 ? (
          <ul className="space-y-2" role="list">
            {polls.map((poll) => (
              <li
                key={poll.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3"
              >
                <p className="text-sm text-foreground">
                  {poll.personal_framing ?? poll.topics?.title ?? '—'}
                </p>
                <p className="text-sm tabular-nums text-muted-foreground">
                  {formatCurrency(pledgeTotalsByPoll[poll.id] ?? 0)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No polls set up.</p>
        )}
      </section>

      {pot && (
        <section className="mt-8" aria-labelledby="pot-heading">
          <h2 id="pot-heading" className="mb-3 text-base font-medium text-foreground">
            Shared pot
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Total deposited</p>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(pot.total_deposited)}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Allocated to guests</p>
              <p className="text-sm font-medium text-foreground">
                {formatCurrency(pot.total_allocated)}
              </p>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-sm font-medium text-primary">
                {formatCurrency(pot.total_deposited - pot.total_allocated)}
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-base font-medium text-foreground">Share link</h2>
        <div className="flex gap-2">
          <code className="flex-1 truncate rounded-md border border-border bg-muted/30 px-3 py-2 text-sm font-mono text-foreground">
            {typeof window !== 'undefined'
              ? `${window.location.origin}/events/${id}`
              : `/events/${id}`}
          </code>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Share this link with guests so they can view the event and make pledges.
        </p>
      </section>
    </main>
  )
}
