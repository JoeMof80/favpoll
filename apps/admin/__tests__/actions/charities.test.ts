// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeSupabaseMock } from '@/tests/mocks/supabase-admin'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

let mock = makeSupabaseMock()
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => mock.supabase }))

import {
  getCharities,
  createCharity,
  updateCharity,
  deactivateCharity,
} from '@/lib/actions/charities'

beforeEach(() => {
  mock = makeSupabaseMock()
})

const makeCharity = (overrides: Record<string, unknown> = {}) => ({
  id: 'charity-1',
  name: 'Cancer Research UK',
  description: null,
  logo_url: null,
  registered_number: '1089464',
  is_active: true,
  market: 'en-GB',
  created_at: '2026-01-01T00:00:00Z',
  ...overrides,
})

// ─────────────────────────────────────────────────────────────────────────────
// getCharities
// ─────────────────────────────────────────────────────────────────────────────

describe('getCharities', () => {
  it('returns all charities ordered by name', async () => {
    mock.queue([makeCharity(), makeCharity({ id: 'charity-2', name: 'Diabetes UK' })])

    const { data, error } = await getCharities()

    expect(error).toBeNull()
    expect(data).toHaveLength(2)
  })

  it('filters by market when provided', async () => {
    mock.queue([makeCharity()])

    await getCharities('en-GB')

    const eqCalls = mock.callsFor('charities').filter((c) => c.method === 'eq')
    expect(eqCalls.some((c) => c.args[0] === 'market' && c.args[1] === 'en-GB')).toBe(true)
  })

  it('does not add market filter when market is not provided', async () => {
    mock.queue([makeCharity()])

    await getCharities()

    const eqCalls = mock.callsFor('charities').filter((c) => c.method === 'eq')
    expect(eqCalls.some((c) => c.args[0] === 'market')).toBe(false)
  })

  it('returns error on DB failure', async () => {
    mock.queue(null, { message: 'DB error' })

    const { data, error } = await getCharities()

    expect(data).toBeNull()
    expect(error).toBe('DB error')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// createCharity
// ─────────────────────────────────────────────────────────────────────────────

describe('createCharity', () => {
  it('returns error if name is empty', async () => {
    const { error } = await createCharity({ name: '   ', market: 'en-GB' })
    expect(error).toBe('Name is required.')
  })

  it('returns error if name is empty string', async () => {
    const { error } = await createCharity({ name: '', market: 'en-GB' })
    expect(error).toBe('Name is required.')
  })

  it('returns error if market is not a known value', async () => {
    const { error } = await createCharity({ name: 'Test Charity', market: 'en-US' })
    expect(error).toMatch(/Invalid market/)
  })

  it('inserts charity with is_active true on success', async () => {
    mock.queue(null) // insert

    const { error } = await createCharity({ name: 'Macmillan', market: 'en-GB' })

    expect(error).toBeNull()
    const insertCall = mock.callsFor('charities').find((c) => c.method === 'insert')!
    expect(insertCall.args[0]).toMatchObject({ name: 'Macmillan', is_active: true, market: 'en-GB' })
  })

  it('returns error on DB failure', async () => {
    mock.queue(null, { message: 'insert failed' })

    const { error } = await createCharity({ name: 'Macmillan', market: 'en-GB' })

    expect(error).toBe('insert failed')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// updateCharity
// ─────────────────────────────────────────────────────────────────────────────

describe('updateCharity', () => {
  it('returns error if name is set to empty string', async () => {
    const { error } = await updateCharity('charity-1', { name: '' })
    expect(error).toBe('Name cannot be empty.')
  })

  it('returns error if name is set to whitespace', async () => {
    const { error } = await updateCharity('charity-1', { name: '   ' })
    expect(error).toBe('Name cannot be empty.')
  })

  it('updates provided fields on success', async () => {
    mock.queue(null) // update

    const { error } = await updateCharity('charity-1', { name: 'Updated Name', description: 'New desc' })

    expect(error).toBeNull()
    const updateCall = mock.callsFor('charities').find((c) => c.method === 'update')!
    expect(updateCall.args[0]).toMatchObject({ name: 'Updated Name', description: 'New desc' })
  })

  it('returns error on DB failure', async () => {
    mock.queue(null, { message: 'update failed' })

    const { error } = await updateCharity('charity-1', { name: 'Valid Name' })

    expect(error).toBe('update failed')
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// deactivateCharity
// ─────────────────────────────────────────────────────────────────────────────

describe('deactivateCharity', () => {
  it('returns success without warning if charity is used in zero events', async () => {
    mock.queue([])   // event_charities select → empty
    mock.queue(null) // charities update

    const { error, warning } = await deactivateCharity('charity-1')

    expect(error).toBeNull()
    expect(warning).toBeUndefined()
  })

  it('returns success with warning if charity is used in one or more events', async () => {
    mock.queue([{ id: 'ec-1' }, { id: 'ec-2' }]) // event_charities select → 2 rows
    mock.queue(null)                               // charities update

    const { error, warning } = await deactivateCharity('charity-1')

    expect(error).toBeNull()
    expect(warning).toMatch(/2 events/)
  })

  it('uses singular "event" when used in exactly one event', async () => {
    mock.queue([{ id: 'ec-1' }]) // event_charities select → 1 row
    mock.queue(null)              // charities update

    const { warning } = await deactivateCharity('charity-1')

    expect(warning).toMatch(/1 event[^s]/)
  })

  it('returns error if event_charities query fails', async () => {
    mock.queue(null, { message: 'count failed' })

    const { error } = await deactivateCharity('charity-1')

    expect(error).toBe('count failed')
  })

  it('returns error if charities update fails', async () => {
    mock.queue([])   // event_charities succeeds
    mock.queue(null, { message: 'update failed' }) // charities update fails

    const { error } = await deactivateCharity('charity-1')

    expect(error).toBe('update failed')
  })
})
