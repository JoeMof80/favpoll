// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWizardState, DRAFT_ADDITIONS_KEY } from "../use-wizard-state"
import type { WizardData } from "../use-wizard-state"

const mockPush = vi.hoisted(() => vi.fn())
const mockCreateFavpoll = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ favpollId: "f1" })
)
const mockUploadPersonPhoto = vi.hoisted(() =>
  vi.fn().mockResolvedValue("https://cdn/photo.jpg")
)
const mockSafeGenerateDraft = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    about: "Generated about.",
    reveal: "Generated reveal.",
    fromCache: false,
  })
)

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))
vi.mock("@/app/favpolls/new/actions", () => ({
  createFavpoll: mockCreateFavpoll,
  uploadPersonPhoto: mockUploadPersonPhoto,
}))
vi.mock("@/lib/actions/generate-draft", () => ({
  safeGenerateDraft: mockSafeGenerateDraft,
}))
const mockUpdateFavpoll = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
vi.mock("@/app/favpolls/[id]/edit/actions", () => ({
  updateFavpoll: mockUpdateFavpoll,
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
    {
      id: "c2",
      name: "Crisis",
      registered_number: "1061789",
      logo_url: null,
      created_at: "",
      description: null,
    },
  ],
  topics: [
    {
      id: "t1",
      title: "Colour",
      is_finite: true,
      is_active: true,
      created_at: "",
      description: null,
      created_by: null,
      placeholders: {},
      favourites: [
        {
          id: "i1",
          label: "Red",
          display_order: 1,
          is_canonical: true,
          topic_id: "t1",
          created_at: "",
          markets: ["en-GB"],
          source: "seed" as const,
          all_time_pledged: 0,
          all_time_count: 0,
          favpoll_count: 0,
          total_pledge_count: 0,
        },
      ],
      category_ids: [],
    },
  ],
  categories: [],
  suggestedTopicIds: { c1: ["t1"] },
}

type HookResult = ReturnType<
  typeof renderHook<ReturnType<typeof useWizardState>, WizardData>
>["result"]

const EXISTING_TOPIC = {
  topicId: "t1",
  title: "Colour",
  isCustom: false,
  items: [],
  customLabels: [],
}

function advanceToTopic(
  result: HookResult,
  category: "celebration" | "fundraiser" | "memorial" = "celebration"
) {
  act(() => result.current.handleCategory(category))
  act(() => result.current.handleNext())
  act(() => result.current.setCharityIds(["c1"]))
  act(() => result.current.handleNext())
}

function advanceToDetails(
  result: HookResult,
  category: "celebration" | "fundraiser" | "memorial" = "celebration"
) {
  advanceToTopic(result, category)
  act(() => result.current.setTopics([EXISTING_TOPIC]))
  act(() => result.current.handleNext())
  act(() => result.current.setName("Poppy Chen"))
  act(() => result.current.handleNext())
  act(() => result.current.setAbout("Sixteen on Saturday."))
  act(() => result.current.handleNext())
}

beforeEach(() => {
  mockPush.mockReset()
  mockUpdateFavpoll.mockClear()
  mockCreateFavpoll.mockClear()
  mockUploadPersonPhoto.mockClear()
  mockSafeGenerateDraft.mockClear()
  sessionStorage.clear()
})

describe("useWizardState — initial state", () => {
  it("starts on the event step", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    expect(result.current.step).toBe("event")
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
  })

  it("nextDisabled is true when category is null", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    expect(result.current.nextDisabled).toBe(true)
  })
})

describe("useWizardState — event step nextDisabled gate", () => {
  it("nextDisabled false once a category is set", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.handleCategory("celebration"))
    expect(result.current.nextDisabled).toBe(false)
  })

  // The gate used to pass on `subject === "cause"` with no category. The
  // type is the step's only question and there is no escape from it.
  it("nextDisabled true for a cause subject with no category", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.setSubject("cause"))
    expect(result.current.nextDisabled).toBe(true)
  })
})

describe("useWizardState — step navigation", () => {
  it("advances to charity on handleNext from event", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.handleCategory("celebration")
      result.current.handleNext()
    })
    expect(result.current.step).toBe("charity")
    expect(result.current.isFirst).toBe(false)
  })

  it("topic is a middle step — details is the last", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToTopic(result)
    expect(result.current.step).toBe("topic")
    expect(result.current.isLast).toBe(false)
    advanceToDetails(result)
    expect(result.current.step).toBe("details")
    expect(result.current.isLast).toBe(true)
  })

  it("goes back from charity to event", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.handleCategory("celebration"))
    act(() => result.current.handleNext())
    act(() => result.current.handleBack())
    expect(result.current.step).toBe("event")
  })

  it("goToStep jumps directly", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.goToStep("story"))
    expect(result.current.step).toBe("story")
  })

  it("canJumpTo: create mode opens only steps already passed", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.handleCategory("celebration"))
    act(() => result.current.handleNext())
    expect(result.current.canJumpTo("event")).toBe(true)
    expect(result.current.canJumpTo("charity")).toBe(false)
    expect(result.current.canJumpTo("topic")).toBe(false)
  })
})

describe("useWizardState — charity step nextDisabled gate", () => {
  it("nextDisabled true when no charities selected", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.handleCategory("celebration")
      result.current.handleNext()
    })
    expect(result.current.nextDisabled).toBe(true)
  })

  it("nextDisabled false once a charity is selected", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.handleCategory("celebration")
      result.current.handleNext()
      result.current.setCharityIds(["c1"])
    })
    expect(result.current.nextDisabled).toBe(false)
  })
})

describe("useWizardState — topic step nextDisabled gate", () => {
  it("nextDisabled true when no topic selected", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToTopic(result)
    expect(result.current.nextDisabled).toBe(true)
  })

  it("nextDisabled false with existing topic", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToTopic(result)
    act(() => result.current.setTopics([EXISTING_TOPIC]))
    expect(result.current.nextDisabled).toBe(false)
  })

  it("nextDisabled true for custom topic with fewer than 2 labels", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToTopic(result)
    act(() => {
      result.current.setTopics([
        {
          topicId: "",
          title: "Memories",
          isCustom: true,
          items: [],
          customLabels: ["One item"],
        },
      ])
    })
    expect(result.current.nextDisabled).toBe(true)
  })

  it("nextDisabled false for custom topic with 2+ labels", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToTopic(result)
    act(() => {
      result.current.setTopics([
        {
          topicId: "",
          title: "Memories",
          isCustom: true,
          items: [],
          customLabels: ["First", "Second"],
        },
      ])
    })
    expect(result.current.nextDisabled).toBe(false)
  })
})

describe("useWizardState — info and story gates", () => {
  it("info gates on name; story gates on about", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToTopic(result)
    act(() => result.current.setTopics([EXISTING_TOPIC]))
    act(() => result.current.handleNext())
    expect(result.current.step).toBe("info")
    expect(result.current.nextDisabled).toBe(true)
    act(() => result.current.setName("Poppy Chen"))
    expect(result.current.nextDisabled).toBe(false)
    act(() => result.current.handleNext())
    expect(result.current.step).toBe("story")
    expect(result.current.nextDisabled).toBe(true)
    act(() => result.current.setAbout("Sixteen on Saturday."))
    expect(result.current.nextDisabled).toBe(false)
  })
})

describe("useWizardState — the who axis", () => {
  it("handleWho commits grouping, subject and pronoun", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.handleWho("she"))
    expect(result.current.who).toBe("she")
    expect(result.current.pronoun).toBe("she")
    expect(result.current.grouping).toBe("individual")
    expect(result.current.subject).toBe("someone")
    act(() => result.current.handleWho("couple"))
    expect(result.current.grouping).toBe("couple")
    expect(result.current.pronoun).toBeUndefined()
    act(() => result.current.handleWho("cause"))
    expect(result.current.subject).toBe("cause")
    expect(result.current.isCause).toBe(true)
  })

  it("switching the type away from fundraiser resets a cause who", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.handleCategory("fundraiser"))
    act(() => result.current.handleWho("cause"))
    act(() => result.current.handleCategory("memorial"))
    expect(result.current.who).toBe("")
    expect(result.current.subject).toBe("someone")
    expect(result.current.grouping).toBe("individual")
    expect(result.current.pronoun).toBeUndefined()
    // A non-cause who survives the same switch.
    act(() => result.current.handleWho("she"))
    act(() => result.current.handleCategory("celebration"))
    expect(result.current.who).toBe("she")
  })
})

describe("useWizardState — the rail tracks the answers", () => {
  it("summaries and ticks accumulate", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    expect(result.current.railDone.event).toBe(false)
    act(() => result.current.handleCategory("memorial"))
    act(() => result.current.setCharityIds(["c1", "c2"]))
    act(() => result.current.setTopics([EXISTING_TOPIC]))
    act(() => result.current.setName("Margaret"))
    expect(result.current.railDone.event).toBe(true)
    expect(result.current.railSummary.event).toEqual(["Memorial"])
    expect(result.current.railSummary.charity).toEqual(["Shelter", "Crisis"])
    expect(result.current.railSummary.topic[0]).toBe("Colour")
    expect(result.current.railSummary.info).toEqual(["Margaret"])
    act(() => result.current.setContext("Grandmother of six"))
    act(() => result.current.setOpeningLine("In loving memory"))
    expect(result.current.railSummary.info).toEqual([
      "In loving memory",
      "Margaret",
      "Grandmother of six",
    ])
    act(() => result.current.setAbout("She loved every colour."))
    act(() => result.current.setReveal("Purple. She wore it always."))
    expect(result.current.railSummary.story).toEqual([
      "She loved every colour.",
      "Purple. She wore it always.",
    ])
    expect(result.current.railDone.details).toBe(false)
    act(() => result.current.setGoalAmount(250))
    act(() => result.current.setVisibility("unlisted"))
    expect(result.current.railDone.details).toBe(true)
    expect(result.current.railSummary.details).toContain("£250 goal")
    expect(result.current.railSummary.details).toContain("Link only")
  })
})

describe("useWizardState — generateExample", () => {
  it("calibrates from the wizard's own answers and fills the story", async () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.handleCategory("memorial"))
    act(() => result.current.setCharityIds(["c1"]))
    act(() => result.current.setTopics([EXISTING_TOPIC]))
    act(() => result.current.setName("Margaret"))
    act(() => result.current.handleWho("she"))
    await act(async () => {
      await result.current.generateExample()
    })
    expect(mockSafeGenerateDraft).toHaveBeenCalledOnce()
    const input = mockSafeGenerateDraft.mock.calls[0][0]
    expect(input.register).toBe("remembering")
    expect(input.topicId).toBe("t1")
    expect(input.primaryCharityId).toBe("c1")
    expect(input.pronoun).toBe("she")
    expect(input.displayName).toBe("Margaret")
    expect(result.current.about).toBe("Generated about.")
    expect(result.current.reveal).toBe("Generated reveal.")
  })
})

describe("useWizardState — handleFinish publishes", () => {
  it("creates the favpoll with the full payload and offers the fund", async () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToDetails(result)
    act(() => result.current.setOpeningLine("Celebrating"))
    act(() => result.current.setContext("Sweet Sixteen"))
    act(() => result.current.setReveal("Mint choc chip."))
    act(() => result.current.setGoalAmount(250))
    await act(async () => {
      await result.current.handleFinish()
    })
    expect(mockCreateFavpoll).toHaveBeenCalledOnce()
    const input = mockCreateFavpoll.mock.calls[0][0]
    expect(input.protagonistName).toBe("Poppy Chen")
    expect(input.protagonistAbout).toBe("Sixteen on Saturday.")
    expect(input.openingLine).toBe("Celebrating")
    expect(input.dateLabel).toBe("Sweet Sixteen")
    expect(input.category).toBe("celebration")
    expect(input.charityIds).toEqual(["c1"])
    expect(input.goalAmount).toBe(250)
    expect(input.isListed).toBe(true)
    expect(input.poll.topicId).toBe("t1")
    expect(input.poll.reveal).toBe("Mint choc chip.")
    expect(typeof input.closesAt).toBe("string")
    // The fund step comes before navigation — a payment needs the page.
    expect(result.current.seedFavpollId).toBe("f1")
    expect(mockPush).not.toHaveBeenCalled()
    act(() => result.current.completeSeed())
    expect(mockPush).toHaveBeenCalledWith("/favpolls/f1")
  })

  it("a cause publishes causeLabel and description, never a protagonist", async () => {
    // Cause is only offered under Fundraiser, and the who axis lives on
    // the Info step — after the category. Any other category resets a
    // cause who (handleCategory).
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToDetails(result, "fundraiser")
    act(() => result.current.handleWho("cause"))
    await act(async () => {
      await result.current.handleFinish()
    })
    const input = mockCreateFavpoll.mock.calls[0][0]
    expect(input.subject).toBe("cause")
    expect(input.protagonistName).toBe("")
    expect(input.causeLabel).toBe("Poppy Chen")
    expect(input.description).toBe("Sixteen on Saturday.")
    expect(input.pronoun).toBeNull()
  })

  it("private visibility publishes isPrivate and not listed", async () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToDetails(result)
    act(() => result.current.setVisibility("private"))
    await act(async () => {
      await result.current.handleFinish()
    })
    const input = mockCreateFavpoll.mock.calls[0][0]
    expect(input.isPrivate).toBe(true)
    expect(input.isListed).toBe(false)
  })

  it("a custom topic publishes customTopic and clears the draft key", async () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToTopic(result)
    act(() =>
      result.current.setTopics([
        {
          topicId: "",
          title: "Memories",
          isCustom: true,
          items: [],
          customLabels: ["First", "Second"],
        },
      ])
    )
    act(() => result.current.handleNext())
    act(() => result.current.setName("Poppy"))
    act(() => result.current.handleNext())
    act(() => result.current.setAbout("About."))
    act(() => result.current.handleNext())
    sessionStorage.setItem(DRAFT_ADDITIONS_KEY, "{}")
    await act(async () => {
      await result.current.handleFinish()
    })
    const input = mockCreateFavpoll.mock.calls[0][0]
    expect(input.poll.topicId).toBeNull()
    expect(input.poll.customTopic).toEqual({
      title: "Memories",
      items: ["First", "Second"],
    })
    expect(sessionStorage.getItem(DRAFT_ADDITIONS_KEY)).toBeNull()
  })

  it("uploads the photo before publishing", async () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToDetails(result)
    act(() =>
      result.current.setPhoto(new File(["x"], "p.jpg", { type: "image/jpeg" }))
    )
    await act(async () => {
      await result.current.handleFinish()
    })
    expect(mockUploadPersonPhoto).toHaveBeenCalledOnce()
    const input = mockCreateFavpoll.mock.calls[0][0]
    expect(input.photoUrl).toBe("https://cdn/photo.jpg")
  })

  it("surfaces a create failure as error, no navigation", async () => {
    mockCreateFavpoll.mockRejectedValueOnce(new Error("boom"))
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToDetails(result)
    await act(async () => {
      await result.current.handleFinish()
    })
    expect(result.current.error).toBe("boom")
    expect(result.current.seedFavpollId).toBeNull()
    expect(mockPush).not.toHaveBeenCalled()
  })
})

describe("useWizardState — visibility follows the register", () => {
  it("a memorial defaults to link only; the control overrides", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    expect(result.current.visibility).toBe("listed")
    act(() => result.current.handleCategory("memorial"))
    expect(result.current.visibility).toBe("unlisted")
    act(() => result.current.setVisibility("listed"))
    expect(result.current.visibility).toBe("listed")
  })
})

describe("useWizardState — edit mode (Phase 2)", () => {
  const EDIT = {
    favpollId: "f9",
    protagonistId: "p9",
    existingPollId: "poll9",
    locked: false,
    initialClosesAt: "2026-10-01T22:59:00.000Z",
    initial: {
      category: "memorial" as const,
      grouping: "individual" as const,
      subject: "someone" as const,
      pronoun: "she" as const,
      charityIds: ["c1"],
      topics: [EXISTING_TOPIC],
      openingLine: "In loving memory of",
      name: "Mary Whitfield",
      context: "1941 – 2026",
      photoUrl: null,
      about: "A headmistress.",
      reveal: "Autumn, always.",
      goalAmount: 250,
      isListed: false,
      isPrivate: false,
    },
  }

  it("prefills every field, including who from the pronoun", () => {
    const { result } = renderHook(() => useWizardState(DATA, EDIT))
    expect(result.current.isEdit).toBe(true)
    expect(result.current.category).toBe("memorial")
    expect(result.current.name).toBe("Mary Whitfield")
    expect(result.current.openingLine).toBe("In loving memory of")
    expect(result.current.about).toBe("A headmistress.")
    expect(result.current.reveal).toBe("Autumn, always.")
    expect(result.current.who).toBe("she")
    expect(result.current.goalAmount).toBe(250)
    expect(result.current.visibility).toBe("unlisted")
    expect(result.current.closesAt?.toISOString()).toBe(
      "2026-10-01T22:59:00.000Z"
    )
    expect(result.current.railDone.event).toBe(true)
    expect(result.current.nextDisabled).toBe(false)
  })

  it("canJumpTo opens every step in edit mode", () => {
    const { result } = renderHook(() => useWizardState(DATA, EDIT))
    expect(result.current.canJumpTo("details")).toBe(true)
    expect(result.current.canJumpTo("story")).toBe(true)
  })

  it("Save calls updateFavpoll with the existing ids and navigates back", async () => {
    const { result } = renderHook(() => useWizardState(DATA, EDIT))
    act(() => result.current.setAbout("Edited about."))
    await act(async () => {
      await result.current.handleFinish()
    })
    expect(mockUpdateFavpoll).toHaveBeenCalledOnce()
    const [favpollId, protagonistId, input] = mockUpdateFavpoll.mock.calls[0]
    expect(favpollId).toBe("f9")
    expect(protagonistId).toBe("p9")
    expect(input.protagonistAbout).toBe("Edited about.")
    expect(input.poll.id).toBe("poll9")
    expect(input.poll.topicId).toBe("t1")
    expect(mockCreateFavpoll).not.toHaveBeenCalled()
    expect(result.current.seedFavpollId).toBeNull()
    expect(mockPush).toHaveBeenCalledWith("/favpolls/f9")
  })

  it("locked marks event, charity and topic only", () => {
    const { result } = renderHook(() =>
      useWizardState(DATA, { ...EDIT, locked: true })
    )
    expect(result.current.stepLocked.event).toBe(true)
    expect(result.current.stepLocked.charity).toBe(true)
    expect(result.current.stepLocked.topic).toBe(true)
    expect(result.current.stepLocked.info).toBe(false)
    expect(result.current.stepLocked.details).toBe(false)
  })

  it("a cause favpoll prefills who=cause and the label in the name field", () => {
    const { result } = renderHook(() =>
      useWizardState(DATA, {
        ...EDIT,
        initial: {
          ...EDIT.initial,
          subject: "cause" as const,
          pronoun: undefined,
          name: "St Mark's Hospice",
        },
      })
    )
    expect(result.current.who).toBe("cause")
    expect(result.current.isCause).toBe(true)
    expect(result.current.name).toBe("St Mark's Hospice")
  })
})

describe("useWizardState — suggestedTopics", () => {
  it("returns suggested topics for primary charity", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.setCharityIds(["c1"]))
    expect(result.current.suggestedTopics).toHaveLength(1)
    expect(result.current.suggestedTopics[0].id).toBe("t1")
  })

  it("returns empty array when no charity selected", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    expect(result.current.suggestedTopics).toHaveLength(0)
  })
})
