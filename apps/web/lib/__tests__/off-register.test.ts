import { describe, it, expect } from "vitest"
import { OFF_REGISTER_MESSAGE, offRegisterNumber } from "@/lib/off-register"

describe("offRegisterNumber", () => {
  it("recognises a Scottish number", () => {
    expect(offRegisterNumber("SC003558")).toBe("OSCR")
    expect(offRegisterNumber("sc003558")).toBe("OSCR")
    expect(offRegisterNumber("  SC 003558 ")).toBe("OSCR")
    expect(offRegisterNumber("GB-SC-SC003558")).toBe("OSCR")
  })

  it("recognises a Northern Irish number", () => {
    expect(offRegisterNumber("NIC100000")).toBe("CCNI")
    expect(offRegisterNumber("nic 100000")).toBe("CCNI")
    expect(offRegisterNumber("GB-NIC-100000")).toBe("CCNI")
  })

  // A missed hint costs a sentence; a false positive tells someone their
  // real search is unsupported. So the match is a number, never a name.
  it("lets every ordinary query through", () => {
    for (const q of [
      "scope",
      "nice",
      "scottish spca",
      "nicholas",
      "1089464",
      "GB-CHC-1089464",
      "st luke's",
      "",
      "sc",
      "nic",
    ]) {
      expect(offRegisterNumber(q)).toBeNull()
    }
  })

  it("names the limit without promising a date", () => {
    for (const message of Object.values(OFF_REGISTER_MESSAGE)) {
      expect(message).toContain("England and Wales")
      expect(message).not.toMatch(/soon|coming|we /i)
    }
  })
})
