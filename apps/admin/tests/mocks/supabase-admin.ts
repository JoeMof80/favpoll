import { vi } from 'vitest'

/**
 * Chainable Supabase query builder mock for server action tests.
 * Mirrors the pattern from apps/web/tests/mocks/supabase-admin.ts.
 */
export function makeSupabaseMock() {
  const responses: Array<{ data: any; error: any }> = []
  const calls: Array<{ table: string; method: string; args: any[] }> = []

  function makeBuilder(table: string) {
    const rec = (method: string, args: any[]) => calls.push({ table, method, args })
    const b: any = {
      select:      (...a: any[]) => { rec('select',      a); return b },
      insert:      (...a: any[]) => { rec('insert',      a); return b },
      update:      (...a: any[]) => { rec('update',      a); return b },
      delete:      ()            => { rec('delete',      []); return b },
      eq:          (...a: any[]) => { rec('eq',          a); return b },
      neq:         (...a: any[]) => { rec('neq',         a); return b },
      is:          (...a: any[]) => { rec('is',          a); return b },
      ilike:       (...a: any[]) => { rec('ilike',       a); return b },
      lte:         (...a: any[]) => { rec('lte',         a); return b },
      gte:         (...a: any[]) => { rec('gte',         a); return b },
      in:          (...a: any[]) => { rec('in',          a); return b },
      limit:       (...a: any[]) => { rec('limit',       a); return b },
      order:       (...a: any[]) => { rec('order',       a); return b },
      single:      () => {
        rec('single', [])
        return Promise.resolve(responses.shift() ?? { data: null, error: null })
      },
      maybeSingle: () => {
        rec('maybeSingle', [])
        return Promise.resolve(responses.shift() ?? { data: null, error: null })
      },
      then: (resolve: (v: any) => any, reject: (e: any) => any) => {
        rec('await', [])
        return Promise.resolve(responses.shift() ?? { data: null, error: null }).then(resolve, reject)
      },
    }
    return b
  }

  const from = vi.fn().mockImplementation((table: string) => makeBuilder(table))

  return {
    supabase: { from },
    from,
    queue: (data: any, error: any = null) => { responses.push({ data, error }) },
    callsFor: (table: string) => calls.filter((c) => c.table === table),
    calls,
  }
}
