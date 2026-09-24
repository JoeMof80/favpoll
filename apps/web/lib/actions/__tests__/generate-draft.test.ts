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
  REVEAL_PROMISES,
  pickRevealPromise,
  stripEmDashes,
  undoubledPossessive,
  endStop,
} from "@/lib/story-engine"
import {
  buildCacheKey,
  revealNamesRealItem,
  hasFabricatedStats,
  violatesCopyRules,
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

// The LLM JSON keeps its "reveal" field (the prompt is untouched by the
// personal-note rename) — the boundary maps it to the note column.
function mockLLMResponse(about: string, note: string) {
  mockMessagesCreate.mockResolvedValueOnce({
    content: [{ type: "text", text: JSON.stringify({ about, reveal: note }) }],
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

  it("returns true when note contains an exact item label", () => {
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

describe("violatesCopyRules", () => {
  it("flags choose/choosing/choice", () => {
    expect(violatesCopyRules("Guests choose their own favourite.")).toBe(true)
    expect(violatesCopyRules("Choosing is half the fun.")).toBe(true)
    expect(violatesCopyRules("Your choice will be revealed.")).toBe(true)
  })

  it("flags vote/voting", () => {
    expect(violatesCopyRules("Cast your vote for charity.")).toBe(true)
  })

  it("passes pick-based copy and non-word matches", () => {
    expect(violatesCopyRules("Pick your own favourite and pledge.")).toBe(false)
    expect(violatesCopyRules("A devoted reader of choicest prose.")).toBe(false)
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
  it("v2 includes the charity for someone (the About names the charity)", () => {
    const key = buildCacheKey(
      "celebrating_one",
      "topic-1",
      "someone",
      "charity-1"
    )
    expect(key).toBe(
      "v6:celebrating_one:topic-1:charity-1:someone:none:individual:none:none"
    )
  })

  it("uses 'he' pronoun segment when pronoun is provided for someone", () => {
    const key = buildCacheKey(
      "celebrating_one",
      "topic-1",
      "someone",
      null,
      "he"
    )
    expect(key).toBe(
      "v6:celebrating_one:topic-1:none:someone:he:individual:none:none"
    )
  })

  it("uses charity id when subject is cause", () => {
    const key = buildCacheKey("cause", "topic-1", "cause", "charity-1")
    expect(key).toBe("v6:cause:topic-1:charity-1:cause:none:none:none:none")
  })

  it("falls back to 'none' when cause has no charity", () => {
    const key = buildCacheKey("cause", "topic-1", "cause", null)
    expect(key).toBe("v6:cause:topic-1:none:cause:none:none:none:none")
  })

  it("ignores pronoun for cause favpolls", () => {
    const key = buildCacheKey("cause", "topic-1", "cause", "charity-1", "she")
    expect(key).toBe("v6:cause:topic-1:charity-1:cause:none:none:none:none")
  })
})

// ---------------------------------------------------------------------------
// generateDraft — cache hit
// ---------------------------------------------------------------------------

describe("generateDraft — cache hit", () => {
  it("returns cached result without calling the LLM", async () => {
    mock.queue({ about: "Cached about.", note: "Cached note — Red." })

    const result = await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result).toEqual({
      about: "Cached about.",
      note: "Cached note — Red.",
      causeLabel: null,
      context: null,
      fromCache: true,
    })
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// generateDraft — skipCache re-roll (repeat Generate clicks)
// ---------------------------------------------------------------------------

describe("generateDraft — skipCache re-roll", () => {
  it("bypasses the cache read and never writes", async () => {
    mock.queue(TOPIC_DATA) // topics fetch — NO cache read queued

    mockLLMResponse(
      "A fresh example, rolled again.",
      "Her favourite was always Blue."
    )

    const result = await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      skipCache: true,
    })

    expect(result.fromCache).toBe(false)
    expect(result.about).toBe("A fresh example, rolled again.")
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)
    // A re-roll is this form's alone: no cache lookup, no cache write
    const draftCalls = mock.callsFor("generated_drafts")
    expect(draftCalls).toEqual([])
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
    expect(result.note).toBe("Her favourite was always Blue.")
    expect(mockMessagesCreate).toHaveBeenCalledTimes(1)

    const insertCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "insert")
    expect(insertCall?.args[0]).toMatchObject({
      subject: "someone",
      about: "A celebration for someone special.",
      note: "Her favourite was always Blue.",
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
      cache_key:
        "v6:cause:topic-1:charity-1:someone:none:individual:fundraiser:none",
    })
  })

  it("retries when first note does not name a real item, uses retry result", async () => {
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

    expect(result.note).toBe("She always chose Red without hesitation.")
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
      cache_key: "v6:cause:topic-1:charity-1:cause:none:none:fundraiser:none",
    })
  })

  it("returns and stores a generated causeLabel + context when no name is set", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockMessagesCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            causeLabel: "Help Our Oceans",
            context: "Summer 2026 appeal",
            about: "Every pledge reaches Ocean Trust in full.",
            reveal: "Our pick to start: Blue — for the sea itself.",
          }),
        },
      ],
    })
    mock.queue(null) // insert

    const result = await generateDraft({
      register: "cause",
      subject: "cause",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })

    expect(result.causeLabel).toBe("Help Our Oceans")
    expect(result.context).toBe("Summer 2026 appeal")
    const prompt = mockMessagesCreate.mock.calls[0][0].messages[0].content
    expect(prompt).toContain('"causeLabel"')
    expect(prompt).toContain('"context"')
    const insertCall = mock
      .callsFor("generated_drafts")
      .find((c) => c.method === "insert")
    expect(insertCall?.args[0]).toMatchObject({
      cause_label: "Help Our Oceans",
      context: "Summer 2026 appeal",
    })
  })

  it("does not ask for a causeLabel when the organiser already named the cause", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockMessagesCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            context: "Winter 2026 appeal",
            about: "Every pledge reaches Ocean Trust in full.",
            reveal: "Our pick to start: Blue — for the sea itself.",
          }),
        },
      ],
    })
    mock.queue(null) // insert

    const result = await generateDraft({
      register: "cause",
      subject: "cause",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      displayName: "Help the Homeless",
    })

    const prompt = mockMessagesCreate.mock.calls[0][0].messages[0].content
    expect(prompt).not.toContain('"causeLabel"')
    expect(prompt).toContain("Help the Homeless")
    expect(result.causeLabel).toBeNull()
    expect(result.context).toBe("Winter 2026 appeal")
  })

  it("returns cached cause fields on a cache hit", async () => {
    mock.queue({
      about: "Cached about.",
      note: "Cached note.",
      cause_label: "Cached Cause",
      context: "Cached context",
    })

    const result = await generateDraft({
      register: "cause",
      subject: "cause",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })

    expect(result.fromCache).toBe(true)
    expect(result.causeLabel).toBe("Cached Cause")
    expect(result.context).toBe("Cached context")
    expect(mockMessagesCreate).not.toHaveBeenCalled()
  })

  it("retries when cause note contains fabricated statistics", async () => {
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

    expect(result.note).toBe(
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
      mock.queue({ about: "Cached.", note: "Cached — Red." })
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
  it("reports failed when the LLM call throws on both attempts", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics
    // Rejected for BOTH attempts: a single bad response is now retried
    // once before giving up (2026-09-23), so one rejection is survivable.
    mockMessagesCreate.mockRejectedValue(new Error("API key missing"))

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {})

    const result = await safeGenerateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
    })

    expect(result).toEqual({ error: "failed" })
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

    expect(result).toEqual({ error: "failed" })
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("generateDraft failed, using fallback:"),
      expect.any(String)
    )
    consoleSpy.mockRestore()
  })

  it("reports rate_limit when the rate limit is exceeded", async () => {
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

    expect(result).toEqual({ error: "rate_limit" })
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

    expect(result).not.toHaveProperty("error")
    if ("error" in result) throw new Error("expected a draft, got a failure")
    expect(result.about).toBe("About.")
    expect(result.note).toBe("Her favourite was always Blue.")
    expect(result.fromCache).toBe(false)
  })
})

// An organiser who picks ♂/♀ is SAYING there is a person. That outranks any
// guess made from the name's shape — a favpoll named after its event
// ("Ben's Channel Swim") was getting "Theirs is …" with ♂ selected, and the
// already-possessive first word was doubling up to "Ben's'"
// (founder-caught on prod, 2026-09-23).
describe("protagonist naming — entity guard and possessives", () => {
  const input = {
    register: "cause" as const,
    subject: "someone" as const,
    topicId: "topic-1",
    displayName: "Ben's Channel Swim",
  }
  const promptOf = () =>
    mockMessagesCreate.mock.calls[0][0].messages[0].content as string

  it("stands the entity guard down when a gendered pronoun is chosen", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics
    mockLLMResponse("About.", "Ben's is Blue.")
    mock.queue(null) // insert

    await generateDraft({ ...input, pronoun: "he" })
    expect(promptOf()).not.toContain("EXCEPTION: if")
    expect(promptOf()).toContain('Use "he" pronouns')
  })

  it("keeps the guard for they/unset — the real appeal-or-fund case", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mockLLMResponse("About.", "Theirs is Blue.")
    mock.queue(null)

    await generateDraft({ ...input, pronoun: "they" })
    expect(promptOf()).toContain("EXCEPTION: if")
  })

  it("never doubles an already-possessive name into Ben's'", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mockLLMResponse("About.", "Ben's is Blue.")
    mock.queue(null)

    await generateDraft({ ...input, pronoun: "he" })
    const prompt = promptOf()
    expect(prompt).not.toContain("Ben's'")
    expect(prompt).toContain("Ben's is")
  })

  it("still uses the bare apostrophe for a name ending in s", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mockLLMResponse("About.", "James' is Blue.")
    mock.queue(null)

    await generateDraft({ ...input, displayName: "James Holt", pronoun: "he" })
    expect(promptOf()).toContain("James' is")
  })
})

// A register-added charity arrives with no description. The prompt used to
// pass the bare name and the model guessed what the charity does — an
// invented cause on a charity platform (found 2026-09-23: seven such
// charities on prod). With no purpose data the charity is named, and the
// prompt says so in terms the model cannot miss.
describe("charity with no description — the prompt must not invite a guess", () => {
  const promptOf = () =>
    mockMessagesCreate.mock.calls[0][0].messages[0].content as string

  it("names the charity and forbids characterising its work", async () => {
    mock.queue(null) // cache miss
    mock.queue(TOPIC_DATA) // topics
    mock.queue({ name: "MAC Bevan Charitable Trust", description: null })
    mockLLMResponse("About.", "Her favourite was always Blue.")
    mock.queue(null) // insert

    await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })
    const prompt = promptOf()
    expect(prompt).toContain("MAC Bevan Charitable Trust")
    expect(prompt).toContain(
      "NOTHING is known here about what this charity does"
    )
    expect(prompt).toContain("not even from its name")
  })

  it("passes the description through unchanged when there is one", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockLLMResponse("About.", "Her favourite was always Blue.")
    mock.queue(null)

    await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })
    const prompt = promptOf()
    expect(prompt).toContain("Ocean Trust — We protect marine ecosystems")
    expect(prompt).not.toContain("NOTHING is known here")
  })

  it("tells the cause branch the 'raising for' must come from the cause name alone", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mock.queue({ name: "MAC Bevan Charitable Trust", description: null })
    mockLLMResponse("About.", "Our pick to start: Blue — a warm clause.")
    mock.queue(null)

    await generateDraft({
      register: "cause",
      subject: "cause",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      displayName: "Warm Plates This Winter",
    })
    expect(promptOf()).toContain("taken from the cause name above only")
  })
})

// ---------------------------------------------------------------------------
// Edge-aware prompt — the pairing table's edges, as text (2026-09-24)
// ---------------------------------------------------------------------------

describe("buildCacheKey — occasion segment (v6)", () => {
  it("slugs the occasion type in before the name, so sibling prefixes still match", () => {
    const key = buildCacheKey(
      "celebrating_one",
      "topic-1",
      "someone",
      "charity-1",
      "he",
      "Roy Mansfield",
      "individual",
      "Milestone birthday"
    )
    expect(key).toMatch(
      /^v6:celebrating_one:topic-1:charity-1:someone:he:individual:milestone-birthday:[0-9a-z]+$/
    )
  })
})

describe("edge-aware generation — the prompt carries the table's edges", () => {
  const promptOf = () =>
    mockMessagesCreate.mock.calls[0][0].messages[0].content as string

  const SEASIDE = {
    title: "Seaside town",
    favourites: [{ label: "Whitby" }, { label: "St Ives" }],
  }
  const RNLI = {
    name: "RNLI",
    description: "Saving lives at sea.",
    activities:
      "The RNLI operates lifeboats around the coast of the UK and Ireland.",
    cause_family: "sea_rescue",
  }

  it("states all three edges for a triad and asks for them in one breath", async () => {
    mock.queue(null)
    mock.queue(SEASIDE)
    mock.queue(RNLI)
    mockLLMResponse("About.", "Ben's is Whitby. He swims there most mornings.")
    mock.queue(null)

    await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      occasionType: "Achievement",
      pronoun: "he",
      displayName: "Ben's Channel Swim",
    })
    const prompt = promptOf()
    expect(prompt).toContain("Occasion type: Achievement.")
    expect(prompt).toContain(
      "Occasion → topic: A favourite seaside town is part of an achievement:"
    )
    expect(prompt).toContain(
      "Charity → topic: RNLI works for lifeboats and rescue at sea"
    )
    expect(prompt).toContain(
      "Occasion ↔ charity: RNLI belongs at an achievement"
    )
    expect(prompt).toContain("All THREE edges link this favpoll")
    // The first seed run parroted the edge sentences into copy, and
    // explained ★ edges that read on the card by themselves (founder,
    // 2026-09-24: "it doesn't quite make sense").
    expect(prompt).toContain("must NOT explain or justify it")
    expect(prompt).toContain("em dashes (—) in prose")
    expect(prompt).toContain("won't say which")
    expect(prompt).toContain(
      'In its own words on the Charity Commission register: "The RNLI operates lifeboats'
    )
    expect(prompt).not.toContain("NO edge links")
  })

  it("at zero edges the about MUST supply the known fact itself", async () => {
    mock.queue(null)
    mock.queue(SEASIDE)
    mock.queue({
      name: "Alzheimer's Society",
      description: "Dementia support.",
      activities: null,
      cause_family: "end_of_life",
    })
    mockLLMResponse(
      "About.",
      "Joan & Arthur's is Whitby. They went every year."
    )
    mock.queue(null)

    await generateDraft({
      register: "celebrating_many",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      occasionType: "Anniversary",
      grouping: "couple",
      displayName: "Joan & Arthur",
    })
    const prompt = promptOf()
    expect(prompt).toContain("Occasion → topic: none.")
    expect(prompt).toContain("Charity → topic: none.")
    expect(prompt).toContain("Occasion ↔ charity: none.")
    expect(prompt).toContain("NO edge links this occasion")
    expect(prompt).toContain("stated in the about before the invitation")
  })

  it("the wizard passes no occasion: the register default pairs with nothing", async () => {
    mock.queue(null)
    mock.queue(SEASIDE)
    mock.queue(RNLI)
    mockLLMResponse("About.", "His is Whitby. He swims there.")
    mock.queue(null)

    await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      pronoun: "he",
    })
    const prompt = promptOf()
    expect(prompt).toContain("Occasion type: Celebration.")
    expect(prompt).toContain("Occasion → topic: none.")
    // The charity edge survives without an occasion.
    expect(prompt).toContain("Charity → topic: RNLI works for")
    expect(prompt).toContain("ONE edge links this favpoll")
  })

  it("a charity with register words but no description is described only in those terms", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mock.queue({
      name: "Rescue Kitties",
      description: null,
      activities:
        "A feral, stray and at-risk cat charity in Greater Manchester.",
      cause_family: null,
    })
    mockLLMResponse("About.", "Her favourite was always Blue.")
    mock.queue(null)

    await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
    })
    const prompt = promptOf()
    expect(prompt).toContain(
      'Rescue Kitties. In its own words on the Charity Commission register: "A feral, stray'
    )
    expect(prompt).toContain("only in those terms")
    expect(prompt).not.toContain("NOTHING is known here")
    // No confirmed family: no charity edge, whatever the words say.
    expect(prompt).toContain("Charity → topic: none.")
  })

  it("a cause favpoll gets the event edge and the charity edge, never an Honour edge", async () => {
    mock.queue(null)
    mock.queue({ title: "Pie", favourites: [{ label: "Steak and ale" }] })
    mock.queue({
      name: "Trussell Trust",
      description: "Food banks.",
      activities: null,
      cause_family: "food_poverty",
    })
    mockLLMResponse(
      "About.",
      "Our pick to start: Steak and ale — a warm clause."
    )
    mock.queue(null)

    await generateDraft({
      register: "cause",
      subject: "cause",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      occasionType: "Fundraiser",
      displayName: "Bake for the Bank",
    })
    const prompt = promptOf()
    expect(prompt).toContain(
      "Occasion → topic: A fundraiser suggests a favourite pie"
    )
    expect(prompt).toContain(
      "Charity → topic: Trussell Trust works for food banks"
    )
    expect(prompt).not.toContain("Occasion ↔ charity")
    expect(prompt).toContain("with why THIS topic in a clause")
  })
})

describe("the reveal promise rotates", () => {
  it("substitutes the possessive into every form", () => {
    REVEAL_PROMISES.forEach((form, i) => {
      const out = pickRevealPromise("Joan's", i)
      expect(out).toBe(form.replace("X", "Joan's"))
      expect(out).not.toContain("X")
    })
  })

  it("includes the founder's form: pick your own favourite to see X", () => {
    expect(REVEAL_PROMISES).toContain("to see X")
  })

  it("the prompt asks for exactly one shape, not a choice", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockLLMResponse("About.", "Joan's is Blue. She kept a pot of them.")
    mock.queue(null)
    await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      pronoun: "she",
      displayName: "Joan Okafor",
    })
    const prompt = mockMessagesCreate.mock.calls[0][0].messages[0]
      .content as string
    expect(prompt).toContain("end the invitation with exactly this shape")
    expect(
      REVEAL_PROMISES.some((f) => prompt.includes(f.replace("X", "Joan's")))
    ).toBe(true)
  })
})

describe("stripEmDashes", () => {
  it("turns a spaced em dash into a comma and an unspaced one into a hyphen", () => {
    expect(stripEmDashes("She sang — every morning — to the dog")).toBe(
      "She sang, every morning, to the dog"
    )
    expect(stripEmDashes("Stand by Me — Ben E. King")).toBe(
      "Stand by Me, Ben E. King"
    )
    expect(stripEmDashes("a forget—me—not")).toBe("a forget-me-not")
  })

  it("keeps an item label's own em dash verbatim so the real-item check still passes", () => {
    const labels = ["Stand by Me — Ben E. King", "Dancing Queen — ABBA"]
    expect(
      stripEmDashes(
        "David's was Stand by Me — Ben E. King. He turned it up — every time.",
        labels
      )
    ).toBe(
      "David's was Stand by Me — Ben E. King. He turned it up, every time."
    )
  })
})

describe("a group's possessive is its whole name", () => {
  it("opens the reveal with the full group name", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockLLMResponse(
      "About.",
      "The Hartley family's is Blue. They painted the shed in it."
    )
    mock.queue(null)
    await generateDraft({
      register: "celebrating_many",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      grouping: "group",
      displayName: "The Hartley family",
    })
    const prompt = mockMessagesCreate.mock.calls[0][0].messages[0]
      .content as string
    expect(prompt).toContain('start with exactly "The Hartley family\'s is"')
    expect(prompt).not.toContain("The's")
  })
})

describe("realism rules in the person prompt (founder review, 2026-09-24)", () => {
  const promptOf = () =>
    mockMessagesCreate.mock.calls[0][0].messages[0].content as string

  it("carries the founder's exemplars and the ordinariness rule", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockLLMResponse("About.", "Joan's is Blue. She kept a pot of them.")
    mock.queue(null)
    await generateDraft({
      register: "celebrating_one",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      pronoun: "she",
      displayName: "Joan Okafor",
    })
    const prompt = promptOf()
    expect(prompt).toContain("These four are the bar")
    expect(prompt).toContain("Cornflower blue. She kept a pot of cornflowers")
    expect(prompt).toContain("must be ORDINARY")
    expect(prompt).toContain("places and things have no agency")
    expect(prompt).toContain("something anyone could have WATCHED them do")
    expect(prompt).not.toContain("The occasion is a birth")
  })

  it("at a birth, the parents are the protagonists and the baby has no favourite", async () => {
    mock.queue(null)
    mock.queue(TOPIC_DATA)
    mock.queue(CHARITY_DATA)
    mockLLMResponse(
      "About.",
      "Sarah & Tom's is Blue. They painted the nursery in it."
    )
    mock.queue(null)
    await generateDraft({
      register: "celebrating_many",
      subject: "someone",
      topicId: "topic-1",
      primaryCharityId: "charity-1",
      grouping: "couple",
      occasionType: "New baby",
      displayName: "Sarah & Tom",
    })
    const prompt = promptOf()
    expect(prompt).toContain("The occasion is a birth")
    expect(prompt).toContain("the people honoured are the PARENTS")
    expect(prompt).toContain("never give the baby one")
  })
})

describe("tidying the model's grammar", () => {
  it("never lets a plural possessive take a second s", () => {
    expect(
      undoubledPossessive("we'll reveal The Okafors's.", "The Okafors'")
    ).toBe("we'll reveal The Okafors'.")
    expect(undoubledPossessive("Joan's is Blue.", "Joan's")).toBe(
      "Joan's is Blue."
    )
  })

  it("ends a sentence that lost its stop after a possessive", () => {
    expect(endStop("and find out James'")).toBe("and find out James'.")
    expect(endStop("and find out James'.")).toBe("and find out James'.")
    expect(endStop("Done.")).toBe("Done.")
  })
})
