import { createClient } from "@supabase/supabase-js"

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        // Supabase reads are GETs through Next's patched fetch, which the
        // Data Cache stores — and its entries SURVIVE DEPLOYS. The ISR
        // landing regenerated every 60s against a response frozen at
        // "1 favpoll" (found on prod, 2026-07-29). Database reads must
        // never be cached by the fetch layer; ISR still caches the
        // rendered page, so static speed is unaffected.
        fetch: (url, init) => fetch(url, { ...init, cache: "no-store" }),
      },
    }
  )
}
