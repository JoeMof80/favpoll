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

const jar = vi.hoisted(() => {
  const store = new Map<string, string>()
  return {
    store,
    get: (k: string) =>
      store.has(k) ? { name: k, value: store.get(k)! } : undefined,
    set: () => {},
    delete: (k: string) => {
      store.delete(k)
    },
  }
})
vi.mock("next/headers", () => ({ cookies: async () => jar }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

// Stub the client component: this is a server component test, and it cares
// about what reaches the wizard, not what the wizard draws.
const wizardProps = vi.hoisted(() => ({
  last: null as Record<string, unknown> | null,
}))
vi.mock("@/components/new-favpoll-wizard", () => ({
  NewFavpollWizard: (props: Record<string, unknown>) => {
    wizardProps.last = props
    return null
  },
}))

import NewFavpollPage from "@/app/favpolls/new/page"

function queueWizardData() {
  mock.queue([]) // charities
  mock.queue([]) // topics
  mock.queue([]) // categories
}

beforeEach(() => {
  mock = makeSupabaseMock()
  jar.store.clear()
  wizardProps.last = null
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ userId: "user-1" })
})

describe("NewFavpollPage — /favpolls/new", () => {
  // THE POINT OF THE WHOLE CHANGE. "Create a favpoll" names an invented
  // noun, so a login in front of it asks a first-time visitor to make a
  // thing nothing has defined yet. The account is asked for at Publish.
  it("renders for a visitor with no account, rather than redirecting", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    queueWizardData()

    const el = await NewFavpollPage({ searchParams: Promise.resolve({}) })

    expect(mockRedirect).not.toHaveBeenCalled()
    expect(el).toBeTruthy()
  })

  it("tells the wizard whether there is an account yet", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    queueWizardData()

    const el = await NewFavpollPage({ searchParams: Promise.resolve({}) })
    // Rendering the element runs the stub, which records the props.
    ;(el.type as (p: Record<string, unknown>) => null)(el.props)

    expect(wizardProps.last?.isSignedIn).toBe(false)
  })

  it("hands back the draft the browser is carrying", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    jar.store.set("favpoll_wizard_draft", "draft-1")
    mock.queue({
      id: "draft-1",
      payload: { name: "Belinda" },
      photo_path: null,
    })
    queueWizardData()

    const el = await NewFavpollPage({ searchParams: Promise.resolve({}) })
    ;(el.type as (p: Record<string, unknown>) => null)(el.props)

    expect(wizardProps.last?.draft).toEqual({ name: "Belinda" })
  })

  it("asks the database for no draft when the browser carries none", async () => {
    mockAuth.mockResolvedValue({ userId: null })
    queueWizardData()

    await NewFavpollPage({ searchParams: Promise.resolve({}) })

    expect(mock.callsFor("wizard_drafts")).toHaveLength(0)
  })

  it("fetches wizard data and renders without throwing when signed in", async () => {
    queueWizardData()

    await expect(
      NewFavpollPage({ searchParams: Promise.resolve({}) })
    ).resolves.not.toThrow()
  })
})
