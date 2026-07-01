// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useWizardState, DRAFT_ADDITIONS_KEY } from "../use-wizard-state"
import type { WizardData } from "../use-wizard-state"

const mockPush = vi.hoisted(() => vi.fn())

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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

beforeEach(() => {
  mockPush.mockReset()
  sessionStorage.clear()
})

describe("useWizardState — initial state", () => {
  it("starts on honour step", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    expect(result.current.step).toBe("honour")
    expect(result.current.isFirst).toBe(true)
    expect(result.current.isLast).toBe(false)
  })

  it("nextDisabled is true when category is null", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    expect(result.current.nextDisabled).toBe(true)
  })
})

describe("useWizardState — honour step nextDisabled gate", () => {
  it("nextDisabled true with category but no who selection", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.setCategory("celebration"))
    expect(result.current.nextDisabled).toBe(true)
  })

  it("nextDisabled false once category and pronoun are set", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("celebration")
      result.current.setPronoun("she")
    })
    expect(result.current.nextDisabled).toBe(false)
  })

  it("nextDisabled false for couple grouping + category", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("celebration")
      result.current.setGrouping("couple")
    })
    expect(result.current.nextDisabled).toBe(false)
  })

  it("nextDisabled true for cause subject without category", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.setSubject("cause"))
    expect(result.current.nextDisabled).toBe(true)
  })

  it("nextDisabled false for cause subject with category", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("fundraiser")
      result.current.setSubject("cause")
    })
    expect(result.current.nextDisabled).toBe(false)
  })
})

describe("useWizardState — step navigation", () => {
  it("advances to charity on handleNext from honour", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("celebration")
      result.current.handleNext()
    })
    expect(result.current.step).toBe("charity")
    expect(result.current.isFirst).toBe(false)
  })

  it("advances to love on handleNext from charity", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.setCategory("celebration"))
    act(() => result.current.handleNext())
    act(() => result.current.setCharityIds(["c1"]))
    act(() => result.current.handleNext())
    expect(result.current.step).toBe("love")
    expect(result.current.isLast).toBe(true)
  })

  it("goes back from charity to honour", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => result.current.setCategory("celebration"))
    act(() => result.current.handleNext())
    act(() => result.current.handleBack())
    expect(result.current.step).toBe("honour")
  })
})

describe("useWizardState — charity step nextDisabled gate", () => {
  it("nextDisabled true when no charities selected", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("celebration")
      result.current.handleNext()
    })
    expect(result.current.nextDisabled).toBe(true)
  })

  it("nextDisabled false once a charity is selected", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("celebration")
      result.current.handleNext()
      result.current.setCharityIds(["c1"])
    })
    expect(result.current.nextDisabled).toBe(false)
  })
})

describe("useWizardState — love step nextDisabled gate", () => {
  function advanceToLove(
    result: ReturnType<
      typeof renderHook<ReturnType<typeof useWizardState>, WizardData>
    >["result"]
  ) {
    act(() => result.current.setCategory("celebration"))
    act(() => result.current.handleNext())
    act(() => result.current.setCharityIds(["c1"]))
    act(() => result.current.handleNext())
  }

  it("nextDisabled true when no topic selected", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToLove(result)
    expect(result.current.nextDisabled).toBe(true)
  })

  it("nextDisabled false with existing topic", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToLove(result)
    act(() => {
      result.current.setTopics([
        {
          topicId: "t1",
          title: "Colour",
          isCustom: false,
          items: [],
          customLabels: [],
        },
      ])
    })
    expect(result.current.nextDisabled).toBe(false)
  })

  it("nextDisabled true for custom topic with fewer than 2 labels", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    advanceToLove(result)
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
    advanceToLove(result)
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

describe("useWizardState — handleFinish", () => {
  function setupForFinish(
    result: ReturnType<
      typeof renderHook<ReturnType<typeof useWizardState>, WizardData>
    >["result"]
  ) {
    act(() => result.current.setCategory("celebration"))
    act(() => result.current.handleNext())
    act(() => result.current.setCharityIds(["c1"]))
    act(() => result.current.handleNext())
  }

  it("redirects with basic params for existing topic", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    setupForFinish(result)
    act(() =>
      result.current.setTopics([
        {
          topicId: "t1",
          title: "Colour",
          isCustom: false,
          items: [],
          customLabels: [],
        },
      ])
    )
    act(() => result.current.handleFinish())
    expect(mockPush).toHaveBeenCalledOnce()
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain("topicId=t1")
    expect(url).toContain("topicTitle=Colour")
    expect(url).toContain("charityIds=c1")
    expect(url).toContain("category=celebration")
  })

  it("includes pronoun in URL when pronoun is set", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("celebration")
      result.current.setPronoun("she")
    })
    act(() => result.current.handleNext())
    act(() => result.current.setCharityIds(["c1"]))
    act(() => result.current.handleNext())
    act(() =>
      result.current.setTopics([
        {
          topicId: "t1",
          title: "Colour",
          isCustom: false,
          items: [],
          customLabels: [],
        },
      ])
    )
    act(() => result.current.handleFinish())
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain("pronoun=she")
    expect(url).not.toContain("causeLabel")
  })

  it("does not include pronoun in URL for cause favpoll", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    act(() => {
      result.current.setCategory("fundraiser")
      result.current.setSubject("cause")
    })
    act(() => result.current.handleNext())
    act(() => result.current.setCharityIds(["c1"]))
    act(() => result.current.handleNext())
    act(() =>
      result.current.setTopics([
        {
          topicId: "t1",
          title: "Colour",
          isCustom: false,
          items: [],
          customLabels: [],
        },
      ])
    )
    act(() => result.current.handleFinish())
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain("subject=cause")
    expect(url).not.toContain("pronoun=")
    expect(url).not.toContain("causeLabel")
  })

  it("writes sessionStorage and sets draftAdditions=1 for custom topic", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    setupForFinish(result)
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
    act(() => result.current.handleFinish())
    const stored = sessionStorage.getItem(DRAFT_ADDITIONS_KEY)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.topicRef).toEqual({ kind: "new", title: "Memories" })
    expect(parsed.addedItems).toEqual(["First", "Second"])
    const url = mockPush.mock.calls[0][0] as string
    expect(url).toContain("draftAdditions=1")
  })

  it("writes sessionStorage for existing topic with custom additions", () => {
    const { result } = renderHook(() => useWizardState(DATA))
    setupForFinish(result)
    act(() =>
      result.current.setTopics([
        {
          topicId: "t1",
          title: "Colour",
          isCustom: false,
          items: [],
          customLabels: ["Violet"],
        },
      ])
    )
    act(() => result.current.handleFinish())
    const stored = sessionStorage.getItem(DRAFT_ADDITIONS_KEY)
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.topicRef).toEqual({ kind: "existing", id: "t1" })
    expect(parsed.addedItems).toEqual(["Violet"])
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
