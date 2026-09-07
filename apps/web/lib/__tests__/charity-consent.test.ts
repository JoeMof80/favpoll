// @vitest-environment node
import { describe, it, expect, vi, afterEach } from "vitest"
import { makeSupabaseMock } from "@/tests/mocks/supabase-admin"
import {
  consentPosture,
  unconsentedCharityNames,
  assertPledgeableCharitiesByPoll,
  unconsentedNamesByFavpoll,
  assertPledgeableCharitiesByFavpoll,
} from "@/lib/charity-consent"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("consentPosture", () => {
  it("defaults to open when the env is unset", () => {
    expect(consentPosture()).toBe("open")
  })

  it("reads consent-first from the env", () => {
    vi.stubEnv("CHARITY_CONSENT_POSTURE", "consent-first")
    expect(consentPosture()).toBe("consent-first")
  })

  it("treats any other value as open", () => {
    vi.stubEnv("CHARITY_CONSENT_POSTURE", "closed")
    expect(consentPosture()).toBe("open")
  })
})

describe("unconsentedCharityNames", () => {
  it("anything but approved counts as unconsented", () => {
    expect(
      unconsentedCharityNames([
        { name: "A", consent_status: "approved" },
        { name: "B", consent_status: "pending" },
        { name: "C", consent_status: "declined" },
        { name: "D" }, // pre-DDL shape
      ])
    ).toEqual(["B", "C", "D"])
  })
})

describe("assertPledgeableCharitiesByPoll", () => {
  it("short-circuits with NO query when the posture is open", async () => {
    const mock = makeSupabaseMock()
    await assertPledgeableCharitiesByPoll(mock.supabase as never, "poll-1")
    expect(mock.calls.length).toBe(0)
  })

  it("throws naming the unconsented charity under consent-first", async () => {
    vi.stubEnv("CHARITY_CONSENT_POSTURE", "consent-first")
    const mock = makeSupabaseMock()
    mock.queue({
      favpolls: {
        favpoll_charities: [
          { charities: { name: "Dogs Trust", consent_status: "pending" } },
        ],
      },
    })
    await expect(
      assertPledgeableCharitiesByPoll(mock.supabase as never, "poll-1")
    ).rejects.toThrow(/Pledges open once Dogs Trust confirms/)
  })

  it("passes when every charity is approved", async () => {
    vi.stubEnv("CHARITY_CONSENT_POSTURE", "consent-first")
    const mock = makeSupabaseMock()
    mock.queue({
      favpolls: {
        favpoll_charities: [
          { charities: { name: "Dogs Trust", consent_status: "approved" } },
          { charities: { name: "Shelter", consent_status: "approved" } },
        ],
      },
    })
    await expect(
      assertPledgeableCharitiesByPoll(mock.supabase as never, "poll-1")
    ).resolves.toBeUndefined()
  })
})

describe("assertPledgeableCharitiesByFavpoll", () => {
  it("gates fund top-ups by favpoll id under consent-first", async () => {
    vi.stubEnv("CHARITY_CONSENT_POSTURE", "consent-first")
    const mock = makeSupabaseMock()
    mock.queue({
      favpoll_charities: [
        { charities: { name: "RNLI", consent_status: "declined" } },
      ],
    })
    await expect(
      assertPledgeableCharitiesByFavpoll(mock.supabase as never, "fav-1")
    ).rejects.toThrow(/RNLI/)
  })
})

describe("unconsentedNamesByFavpoll", () => {
  it("returns [] with NO query when the posture is open", async () => {
    const mock = makeSupabaseMock()
    await expect(
      unconsentedNamesByFavpoll(mock.supabase as never, "fav-1")
    ).resolves.toEqual([])
    expect(mock.calls.length).toBe(0)
  })

  it("names the blocking charities under consent-first", async () => {
    vi.stubEnv("CHARITY_CONSENT_POSTURE", "consent-first")
    const mock = makeSupabaseMock()
    mock.queue({
      favpoll_charities: [
        { charities: { name: "RNLI", consent_status: "pending" } },
        { charities: { name: "Shelter", consent_status: "approved" } },
      ],
    })
    await expect(
      unconsentedNamesByFavpoll(mock.supabase as never, "fav-1")
    ).resolves.toEqual(["RNLI"])
  })
})
