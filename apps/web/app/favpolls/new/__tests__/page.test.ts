// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
const mockRedirect = vi.hoisted(() =>
  vi.fn().mockImplementation((url: string) => {
    throw new Error(url)
  })
)

vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))
vi.mock("next/navigation", () => ({ redirect: mockRedirect }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

// Stub out the client component — server component test only cares about auth + data fetch
vi.mock("@/components/new-favpoll-wizard", () => ({
  NewFavpollWizard: () => null,
}))

import NewFavpollPage from "@/app/favpolls/new/page"

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("NewFavpollPage — /favpolls/new", () => {
  it("redirects to /sign-in when the user is not authenticated", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })

    await expect(NewFavpollPage()).rejects.toThrow(
      "/sign-in?redirect_url=/favpolls/new"
    )
  })

  it("fetches wizard data and renders without throwing when authenticated", async () => {
    // Promise.all fires 3 queries: charities, topics, categories
    mock.queue([]) // charities
    mock.queue([]) // topics (with favourites + topic_categories joins)
    mock.queue([]) // categories

    await expect(NewFavpollPage()).resolves.not.toThrow()
  })
})
