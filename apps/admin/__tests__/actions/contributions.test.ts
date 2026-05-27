// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeSupabaseMock } from '@/tests/mocks/supabase-admin'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

let mock = makeSupabaseMock()
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => mock.supabase }))

import {
  getPendingContributions,
  getReviewedContributions,
  acceptContribution,
  rejectContribution,
} from '@/lib/actions/contributions'

beforeEach(() => {
  mock = makeSupabaseMock()
})

const makeRawItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'item-1',
  label: 'Pineapple',
  topic_id: 'topic-1',
  review_status: 'pending',
  rejection_reason: null,
  reviewed_at: null,
  reviewed_by: null,
  created_at: '2026-01-01T00:00:00Z',
  topics: {
    title: 'Food',
    event_polls: [
      {
        event_id: 'event-1',
        events: {
          id: 'event-1',
          opening_line: 'Birthday',
          protagonists: { name: 'Alex' },
        },
      },
    ],
  },
  ...overrides,
})

// ─────────────────────────────────────────────────────────────────────────────
// getPendingContributions
// ─────────────────────────────────────────────────────────────────────────────

describe('getPendingContributions', () => {
  it('returns mapped pending contributions', async () => {
    mock.queue([makeRawItem()])

    const { data, error } = await getPendingContributions()

    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect(data![0]).toMatchObject({
      id: 'item-1',
      label: 'Pineapple',
      topic_title: 'Food',
      event_id: 'event-1',
      protagonist_name: 'Alex',
      review_status: 'pending',
    })
  })

  it('returns error string on DB failure', async () => {
    mock.queue(null, { message: 'DB error' })

    const { data, error } = await getPendingContributions()

    expect(data).toBeNull()
    expect(error).toBe('DB error')
  })

  it('returns empty array when no pending items', async () => {
    mock.queue([])

    const { data, error } = await getPendingContributions()

    expect(error).toBeNull()
    expect(data).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// getReviewedContributions
// ─────────────────────────────────────────────────────────────────────────────

describe('getReviewedContributions', () => {
  it('returns accepted and rejected contributions', async () => {
    mock.queue([
      makeRawItem({ review_status: 'accepted', reviewed_at: '2026-01-02T00:00:00Z' }),
      makeRawItem({ id: 'item-2', review_status: 'rejected', rejection_reason: 'Inappropriate' }),
    ])

    const { data, error } = await getReviewedContributions()

    expect(error).toBeNull()
    expect(data).toHaveLength(2)
    expect(data![0].review_status).toBe('accepted')
    expect(data![1].review_status).toBe('rejected')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// acceptContribution
// ─────────────────────────────────────────────────────────────────────────────

describe('acceptContribution', () => {
  it('updates review_status to accepted and sets is_canonical true', async () => {
    mock.queue(null) // update → await

    const { error } = await acceptContribution('item-1')

    expect(error).toBeNull()
    const updateCall = mock.callsFor('topic_items').find((c) => c.method === 'update')!
    expect(updateCall.args[0]).toMatchObject({
      review_status: 'accepted',
      is_canonical: true,
      rejection_reason: null,
    })
    expect(typeof updateCall.args[0].reviewed_at).toBe('string')
  })

  it('returns error on DB failure', async () => {
    mock.queue(null, { message: 'update failed' })

    const { error } = await acceptContribution('item-1')

    expect(error).toBe('update failed')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// rejectContribution
// ─────────────────────────────────────────────────────────────────────────────

describe('rejectContribution', () => {
  it('returns error when reason is empty', async () => {
    const { error } = await rejectContribution('item-1', '   ')
    expect(error).toBe('A rejection reason is required.')
  })

  it('hides event_poll_items and sets review_status to rejected', async () => {
    mock.queue(null) // event_poll_items update → await
    mock.queue(null) // topic_items update → await

    const { error } = await rejectContribution('item-1', 'Spam')

    expect(error).toBeNull()

    const epiUpdate = mock.callsFor('event_poll_items').find((c) => c.method === 'update')!
    expect(epiUpdate.args[0]).toMatchObject({ is_hidden: true })

    const tiUpdate = mock.callsFor('topic_items').find((c) => c.method === 'update')!
    expect(tiUpdate.args[0]).toMatchObject({
      review_status: 'rejected',
      rejection_reason: 'Spam',
    })
  })

  it('returns error when event_poll_items hide fails', async () => {
    mock.queue(null, { message: 'hide failed' })

    const { error } = await rejectContribution('item-1', 'Spam')

    expect(error).toBe('hide failed')
  })

  it('returns error when topic_items update fails', async () => {
    mock.queue(null)                         // hide succeeds
    mock.queue(null, { message: 'reject failed' }) // update fails

    const { error } = await rejectContribution('item-1', 'Spam')

    expect(error).toBe('reject failed')
  })
})
