// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWizardState } from "../use-wizard-state"
import type { WizardData, WizardDraftValues } from "../use-wizard-state"

const mockPush = vi.hoisted(() => vi.fn())
const mockReplace = vi.hoisted(() => vi.fn())
const mockCreateFavpoll = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ favpollId: "f1" })
)

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}))
vi.mock("@/app/favpolls/new/actions", () => ({
  createFavpoll: mockCreateFavpoll,
  uploadPersonPhoto: vi.fn(),
}))
vi.mock("@/lib/actions/generate-draft", () => ({
  safeGenerateDraft: vi.fn(),
  getCachedDraftGhosts: vi.fn().mockResolvedValue(null),
  pairingIsEnacted: vi.fn().mockResolvedValue(false),
}))
vi.mock("@/app/favpolls/[id]/edit/actions", () => ({
  updateFavpoll: vi.fn(),
}))

const DATA: WizardData = {
  charities: [
    {
      id: "c1",
      name: "Shelter",
      registered_number: "263710",
      logo_url: null,
      created_at: "",
      description: null,
    },
  ],
  topics: [
    {
      id: "t1",
      title: "Colour",
      slug: "colour",
      is_finite: true,
      is_active: true,
      category_ids: [],
      favourites: [{ id: "i1", label: "Purple", is_canonical: true }],
    } as unknown as WizardData["topics"][number],
  ],
  categories: [],
}

/** Everything the wizard held when Publish sent them to Clerk. */
const COMPLETE_DRAFT: WizardDraftValues = {
  category: "celebration",
  grouping: "individual",
  subject: "someone",
  pronoun: undefined,
  charityIds: ["c1"],
  topics: [
    {
      topicId: "t1",
      title: "Colour",
      items: [],
      customLabels: [],
    } as unknown as WizardDraftValues["topics"][number],
  ],
  openingLine: "Celebrating",
  name: "Poppy Chen",
  context: "Sweet Sixteen",
  photoUrl: null,
  about: "Sixteen on Saturday.",
  note: "Mint choc chip.",
  isPrivate: false,
  isListed: true,
  allowGuestItems: true,
  showGuestAmounts: true,
  goalAmount: undefined,
  closesAt: "2026-12-01T22:59:00.000Z",
  step: "details",
}

function render(
  opts: {
    draft?: WizardDraftValues | null
    isSignedIn?: boolean
    publishOnReturn?: boolean
  } = {}
) {
  return renderHook(() =>
    useWizardState(
      DATA,
      undefined,
      null,
      null,
      null,
      opts.draft ?? null,
      opts.isSignedIn ?? true,
      opts.publishOnReturn ?? false
    )
  )
}

beforeEach(() => {
  mockPush.mockReset()
  mockReplace.mockReset()
  mockCreateFavpoll.mockClear()
  window.history.replaceState({}, "", "/favpolls/new?publish=1")
})

describe("useWizardState — the return from Clerk", () => {
  // THE WHOLE POINT OF THE LABEL (founder, 2026-10-27). The button says
  // "Publish", so what comes back must be the publish finishing, never
  // the wizard they are done with. This state is what the shell shows
  // instead of the steps while the create is in flight.
  it("is publishing from the first frame, before any effect has run", () => {
    const { result } = render({
      draft: COMPLETE_DRAFT,
      publishOnReturn: true,
    })
    expect(result.current.returningToPublish).toBe(true)
  })

  it("publishes on arrival and lands on the shared pot, not the wizard", async () => {
    const { result } = render({
      draft: COMPLETE_DRAFT,
      publishOnReturn: true,
    })
    await act(async () => {})

    expect(mockCreateFavpoll).toHaveBeenCalledOnce()
    const input = mockCreateFavpoll.mock.calls[0][0]
    expect(input.protagonistName).toBe("Poppy Chen")
    expect(result.current.seedFavpollId).toBe("f1")
    // The marker is spent: a refresh must not publish a second favpoll.
    expect(mockReplace).toHaveBeenCalledWith("/favpolls/new", {
      scroll: false,
    })
    // And the hold is released, so an error would show the wizard again.
    expect(result.current.returningToPublish).toBe(false)
  })

  it("shows the wizard, not a publishing state, with no marker", () => {
    const { result } = render({ draft: COMPLETE_DRAFT })
    expect(result.current.returningToPublish).toBe(false)
    expect(mockCreateFavpoll).not.toHaveBeenCalled()
  })

  // Nothing can publish without an account, so a marker arriving signed
  // out is somebody's hand-edited URL, not a return trip.
  it("ignores the marker when there is no account", () => {
    const { result } = render({
      draft: COMPLETE_DRAFT,
      publishOnReturn: true,
      isSignedIn: false,
    })
    expect(result.current.returningToPublish).toBe(false)
    expect(mockCreateFavpoll).not.toHaveBeenCalled()
  })

  // A gap means the draft no longer validates. handleFinish walks back to
  // the step that is missing, which needs the wizard on screen.
  it("hands the wizard back when the draft no longer validates", async () => {
    const { result } = render({
      draft: { ...COMPLETE_DRAFT, name: "" },
      publishOnReturn: true,
    })
    await act(async () => {})

    expect(mockCreateFavpoll).not.toHaveBeenCalled()
    expect(result.current.returningToPublish).toBe(false)
    expect(result.current.step).toBe("info")
    expect(result.current.error).toBe("A name is required before publishing.")
  })
})
