import { describe, it, expect } from "vitest"
import { eventFormSchema } from "@/components/event-form-v2/schema"

// Minimal valid input — only required fields
const VALID_BASE = {
  occasionType: "Birthday",
  name: "Alice",
  closesAt: new Date("2027-01-01"),
  charities: ["charity-1"],
  sharedFund: 0,
  isPrivate: false,
  topics: [
    {
      topicId: "topic-1",
      title: "Colour",
      isCustom: false,
      items: [],
      customLabels: [],
    },
  ],
}

describe("eventFormSchema — valid inputs", () => {
  it("accepts a minimal valid input", () => {
    const result = eventFormSchema.safeParse(VALID_BASE)
    expect(result.success).toBe(true)
  })

  it("accepts all optional fields populated", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      openingLine: "Celebrating",
      context: "Born 1990",
      about: "A short bio.",
      reveal: "Her favourite was purple.",
    })
    expect(result.success).toBe(true)
  })

  it("accepts up to 3 charities", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      charities: ["c1", "c2", "c3"],
    })
    expect(result.success).toBe(true)
  })
})

describe("eventFormSchema — field length limits", () => {
  it("rejects name exceeding 40 characters", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      name: "A".repeat(41),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join("."))
      expect(paths).toContain("name")
    }
  })

  it("accepts name at exactly 40 characters", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      name: "A".repeat(40),
    })
    expect(result.success).toBe(true)
  })

  it("rejects context exceeding 40 characters", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      context: "A".repeat(41),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "context")).toBe(
        true
      )
    }
  })

  it("rejects openingLine exceeding 50 characters", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      openingLine: "A".repeat(51),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "openingLine")).toBe(
        true
      )
    }
  })

  it("rejects about exceeding 300 characters", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      about: "A".repeat(301),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "about")).toBe(true)
    }
  })

  it("rejects reveal exceeding 280 characters", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      reveal: "A".repeat(281),
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "reveal")).toBe(true)
    }
  })
})

describe("eventFormSchema — required fields", () => {
  it("accepts missing register (register is now optional)", () => {
    const { register: _r, ...rest } = VALID_BASE as typeof VALID_BASE & {
      register?: string
    }
    const result = eventFormSchema.safeParse(rest)
    expect(result.success).toBe(true)
  })

  it("rejects missing occasionType", () => {
    const { occasionType: _o, ...rest } = VALID_BASE
    const result = eventFormSchema.safeParse(rest)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path[0] === "occasionType")
      ).toBe(true)
    }
  })

  it("rejects empty occasionType", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      occasionType: "",
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.path[0] === "occasionType")
      ).toBe(true)
    }
  })

  it("rejects empty name", () => {
    const result = eventFormSchema.safeParse({ ...VALID_BASE, name: "" })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "name")).toBe(true)
    }
  })

  it("rejects empty charities array", () => {
    const result = eventFormSchema.safeParse({ ...VALID_BASE, charities: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "charities")).toBe(
        true
      )
    }
  })

  it("rejects more than 3 charities", () => {
    const result = eventFormSchema.safeParse({
      ...VALID_BASE,
      charities: ["c1", "c2", "c3", "c4"],
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "charities")).toBe(
        true
      )
    }
  })

  it("rejects empty topics array", () => {
    const result = eventFormSchema.safeParse({ ...VALID_BASE, topics: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path[0] === "topics")).toBe(true)
    }
  })

  it("rejects missing closesAt", () => {
    const { closesAt: _c, ...rest } = VALID_BASE
    const result = eventFormSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })
})
