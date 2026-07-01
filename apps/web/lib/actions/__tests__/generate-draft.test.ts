// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"

const mockAuth = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ userId: "user-1" })
)
vi.mock("@clerk/nextjs/server", () => ({ auth: mockAuth }))

let mock = makeSupabaseMock()
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => mock.supabase,
}))

const mockMessagesCreate = vi.hoisted(() => vi.fn())
vi.mock("@anthropic-ai/sdk", () => ({
  default: class {
    messages = { create: mockMessagesCreate }
  },
}))

import { generateDraft, safeGenerateDraft } from "../generate-draft"
import {
  buildCacheKey,
  revealNamesRealItem,
  hasFabricatedStats,
  _rateLimitStore,
  RATE_LIMIT_MAX,
  RateLimitError,
} from "../generate-draft-utils"

const TOPIC_DATA = {
  title: "Colour",
  favourites: [
    { label: "Red" },
    { label: "Blue" },
    { label: "Green" },
    { label: "Yellow" },
  ],
}

const CHARITY_DATA = {
  name: "Ocean Trust",
  description:
    "We protect marine ecosystems and support coastal communities worldwide.",
}

function mockLLMResponse(about: string, reveal: string) {
  mockMessagesCreate.mockResolvedValueOnce({
    content: [{ type: "text", text: JSON.stringify({ about, reveal }) }],
  })
}

beforeEach(() => {
  mock = makeSupabaseMock()
  mockAuth.mockResolvedValue({ userId: "user-1" })
  mockMessagesCreate.mockReset()
  _rateLimitStore.clear()
})

afterEach(() => {
  _rateLimitStore.clear()
})

// ---------------------------------------------------------------------------
// Unit — validator helpers
// ---------------------------------------------------------------------------

describe("revealNamesRealItem", () => {
  const items = ["Red", "Blue", "Monster Munch (pickled onion)"]

  it("returns true when reveal contains an exact item label", () => {
    expect(revealNamesRealItem("Her favourite was always Red.", items)).toBe(
      true
    )
  })

  it("returns true when parenthetical is stripped", () => {
    expect(revealNamesRealItem("He swore by Monster Munch.", items)).toBe(true)
  })

  it("returns false when no real item appears", () => {
    expect(
      revealNamesRealItem("She loved the vibrant hues of autumn.", items)
    ).toBe(false)
  })

  it("is case-insensitive", () => {
    expect(revealNamesRealItem("Always blue, without fail.", items)).toBe(true)
  })
})

describe("hasFabricatedStats", () => {
  it("flags percentage figures", () => {
    expect(hasFabricatedStats("Over 90% of marine life is affected.")).toBe(
      true
    )
  })

  it("flags 'X in Y' patterns", () => {
    expect(hasFabricatedStats("1 in 3 children go without meals.")).toBe(true)
  })

  it("flags large quantity patterns", () => {
    expect(
      hasFabricatedStats("More than 10,000 families rely on their work.")
    ).toBe(true)
  })

  it("passes clean thematic text", () => {
    expect(
      hasFabricatedStats("Their work is a reminder of what colour can mean.")
    ).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// buildCacheKey
// ---------------------------------------------------------------------------

describe("buildCacheKey", () => {
  it("uses 'none' for charity when subject is someone", () => {
    const key = buildCacheKey(
      "celebrating_one",
      "topic-1",
      "someone",
      "charity-1"
    )
    expect(key).toBe("celebrating_one:topic-1:none:someone:none")
  })

  it("uses 'he' pronoun segment when pronoun is provided for someone", () => {
    const key = buildCacheKey(
      "celebrating_one",
      "topic-1",
      "someone",
      null,
      "he"
    )
    expect(key).toBe("celebrating_one:topic-1:none:someone:he")
  })

  it("uses charity id when subject is cause", () => {
    const key = buildCacheKey("cause", "topic-1", "cause", "charity-1")
    expect(key).toBe("cause:topic-1:charity-1:cause:none")
  })

  it("falls back to 'none' when cause has no charity", () => {
    const key = buildCacheKey("cause", "topic-1", "cause", null)
    expect(key).toBe("cause:topic-1:none:cause:none")
  })

  it("ignores pronoun for cause favpolls", () => {
    const key = buildCacheKey("cause", "topic-1", "cause", "charity-1", "she")
    expect(key).toBe("cause:topic-1:charity-1:cause:none")
  })
})

// ---------------------------------------------------------------------------
// generateDraft — cache hit
// ---------------------------------------------------------------------------

describe("generateDraft — cache hit", () => {
  it("returns cached result without calling the LLM", async () => {
    mock.queue({ about: "Cached about.", reveal: "Cached reveal — Red." })

    const result = await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result).toEqual({
      about: "Cached about.",
      reveal: "Cached reveal — Red.",
      fromCache: true,
    })
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// generateDraft — cache miss, person (someone)
// ---------------------------------------------------------------------------

describe("generateDraft — cache miss, person", () => {
  it("generates, stores, and returns fromCache:false", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics fetch
    // no charity fetch for subject=someone
    mockLLMResponse(
      "A celebration for someone special.",
      "Her favourite was always Blue."
    )
    mock.queue(null) // insert generated_drafts

    const result = await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result.fromCache).toBe(false)
    expect(result.about).toBe("A celebration for someone special.")
    expect(result.reveal).toBe("Her favourite was always Blue.")
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)

    const insertCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "insert")
    expect(insertCall?.args[0]).toMatchObject({
      subject: "someone",
      about: "A celebration for someone special.",
      reveal: "Her favourite was always Blue.",
      status: "generated",
    })
  })

  it("fetches charity for person favpoll when primaryCharityId is provided", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics fetch
    mock.queue(CHARITY_DATA) // charity fetch (person favpoll with charity)
    mockLLMResponse(
      "A warm gathering in someone's honour.",
      "Her favourite was always Blue."
    )
    mock.queue(null) // insert

    const result = await generateDraft({
      register: "cause",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })

    expect(result.fromCache).toBe(false)
    const insertCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "insert")
    expect(insertCall?.args[0]).toMatchObject({
      subject: "someone",
      cache_key: "cause:topic-1:none:someone:none",
    })
  })

  it("retries when first reveal does not name a real item, uses retry result", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA)
    mockLLMResponse(
      "An honour for a wonderful person.",
      "She always loved vibrant hues." // no real item
    )
    mockLLMResponse(
      "An honour for a wonderful person.",
      "She always chose Red without hesitation." // names real item
    )
    mock.queue(null) // insert

    const result = await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result.reveal).toBe("She always chose Red without hesitation.")
    expect(mockMessagesCreate).toHaveBeenCalledTimes(2)
  })
})

// ---------------------------------------------------------------------------
// generateDraft — cache miss, cause
// ---------------------------------------------------------------------------

describe("generateDraft — cache miss, cause", () => {
  it("fetches charity and includes it in stored row", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics
    mock.queue(CHARITY_DATA) // charities
    mockLLMResponse(
      "Join us in supporting a cause close to all our hearts.",
      "Their ocean conservation work mirrors the depth of colour in the sea."
    )
    mock.queue(null) // insert

    const result = await generateDraft({
      register: "cause",
      subject: "cause",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })

    expect(result.fromCache).toBe(false)
    const insertCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "insert")
    expect(insertCall?.args[0]).toMatchObject({
      primary_charity_id: "charity-1",
      subject: "cause",
      cache_key: "cause:topic-1:charity-1:cause:none",
    })
  })

  it("retries when cause reveal contains fabricated statistics", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockLLMResponse(
      "Gather to make a difference.",
      "Over 10,000 families benefit from their work every year." // fabricated stats
    )
    mockLLMResponse(
      "Gather to make a difference.",
      "Their ocean work is as vivid and varied as colour itself." // clean
    )
    mock.queue(null) // insert

    const result = await generateDraft({
      register: "cause",
      subject: "cause",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })

    expect(result.reveal).toBe(
      "Their ocean work is as vivid and varied as colour itself."
    )
    expect(mockMessagesCreate).toHaveBeenCalledTimes(2)
  })
})

// ---------------------------------------------------------------------------
// Rate limiting
// ---------------------------------------------------------------------------

describe("rate limiting", () => {
  it(`allows ${RATE_LIMIT_MAX} successful generations then throws RateLimitError`, async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      mock.queue(null) // cache miss
      mock.queue(TOPIC_DATA)
      mockLLMResponse("About.", "Her favourite was always Red.")
      mock.queue(null) // insert
    }

    const input = {
      register: "celebrating_one" as const,
      subject: "someone" as const,
      topicId: "topic-1",
    }

    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      await expect(generateDraft(input)).resolves.toBeDefined()
    }

    await expect(generateDraft(input)).rejects.toBeInstanceOf(RateLimitError)
  })

  it("throws immediately — no DB call is made when rate-limited", async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      mock.queue(null) // cache miss
      mock.queue(TOPIC_DATA)
      mockLLMResponse("About.", "Her favourite was always Blue.")
      mock.queue(null) // insert
      await generateDraft({
        register: "celebrating_one",
        subject: "someone",
        topicId: "topic-1",
      })
    }

    const callsBefore = mock.calls.length

    await expect(
      generateDraft({
        register: "celebrating_one",
        subject: "someone",
        topicId: "topic-1",
      })
    ).rejects.toBeInstanceOf(RateLimitError)

    expect(mock.calls.length).toBe(callsBefore) // no new DB calls
  })

  it("cache hits do not consume quota", async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      mock.queue({ about: "Cached.", reveal: "Cached — Red." })
      await generateDraft({
        register: "celebrating_one",
        subject: "someone",
        topicId: "topic-1",
      })
    }

    // Still able to generate — cache hits consumed nothing
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA)
    mockLLMResponse("About.", "Her favourite was always Red.")
    mock.queue(null) // insert

    await expect(
      generateDraft({
        register: "celebrating_one",
        subject: "someone",
        topicId: "topic-1",
      })
    ).resolves.toBeDefined()
  })

  it("failed LLM call does not consume quota", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA)
    mockMessagesCreate.mockRejectedValueOnce(new Error("API key missing"))

    await expect(
      generateDraft({
        register: "celebrating_one",
        subject: "someone",
        topicId: "topic-1",
      })
    ).rejects.toThrow()

    const entry = _rateLimitStore.get("user-1")
    expect(entry?.count ?? 0).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// safeGenerateDraft — server-invocation resilience
// ---------------------------------------------------------------------------

describe("safeGenerateDraft", () => {
  it("returns null and logs when LLM call throws", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics
    mockMessagesCreate.mockRejectedValueOnce(new Error("API key missing"))

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await safeGenerateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("generateDraft failed, using fallback:"),
      "API key missing"
    )
    consoleSpy.mockRestore()
  })

  it("returns null when unauthenticated", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null })

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await safeGenerateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("generateDraft failed, using fallback:"),
      expect.any(String)
    )
    consoleSpy.mockRestore()
  })

  it("returns null when rate limit is exceeded", async () => {
    for (let i = 0; i < RATE_LIMIT_MAX; i++) {
      mock.queue(null)
      mock.queue(TOPIC_DATA)
      mockLLMResponse("About.", "Her favourite was always Red.")
      mock.queue(null)
      await generateDraft({
        register: "celebrating_one",
        subject: "someone",
        topicId: "topic-1",
      })
    }

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await safeGenerateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result).toBeNull()
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("generateDraft failed, using fallback:"),
      expect.any(String)
    )
    consoleSpy.mockRestore()
  })

  it("returns result when generation succeeds", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics
    mockLLMResponse("About.", "Her favourite was always Blue.")
    mock.queue(null) // insert

    const result = await safeGenerateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result).not.toBeNull()
    expect(result?.about).toBe("About.")
    expect(result?.reveal).toBe("Her favourite was always Blue.")
    expect(result?.fromCache).toBe(false)
  })
})
