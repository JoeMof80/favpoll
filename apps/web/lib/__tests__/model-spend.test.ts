import { describe, it, expect } from "vitest"
import { costMicros } from "@/lib/model-spend"

// The ledger is a budget, not an invoice — but a budget that silently
// records zero is no budget at all, which is how dev's first two rows came
// out (LLM_MODEL_ID was pinned to a DATED Haiku id and missed the price
// table).
describe("costMicros", () => {
  it("prices a known model from its token counts", () => {
    // Sonnet 5: $2/MTok in, $10/MTok out. 1M in + 1M out = $12 = 12,000,000
    // micro-dollars.
    expect(
      costMicros("claude-sonnet-5", {
        input_tokens: 1_000_000,
        output_tokens: 1_000_000,
      })
    ).toBe(12_000_000)
  })

  it("prices a DATED id as its family", () => {
    const dated = costMicros("claude-haiku-4-5-20251001", {
      input_tokens: 10_000,
      output_tokens: 100,
    })
    const plain = costMicros("claude-haiku-4-5", {
      input_tokens: 10_000,
      output_tokens: 100,
    })
    expect(dated).toBe(plain)
    expect(dated).toBeGreaterThan(0)
  })

  it("records an unpriced model at zero rather than guessing", () => {
    expect(
      costMicros("some-model-nobody-has-priced", {
        input_tokens: 10_000,
        output_tokens: 1_000,
      })
    ).toBe(0)
  })

  it("treats missing token counts as nothing spent", () => {
    expect(costMicros("claude-sonnet-5", {})).toBe(0)
  })
})
