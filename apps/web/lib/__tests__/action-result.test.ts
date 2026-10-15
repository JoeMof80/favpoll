import { describe, it, expect } from "vitest"
import { asResult, unwrap } from "@/lib/action-result"

describe("asResult / unwrap", () => {
  it("carries a value through", async () => {
    const r = await asResult(async () => 42)
    expect(r).toEqual({ ok: true, value: 42 })
    expect(unwrap(r)).toBe(42)
  })

  it("turns a thrown sentence into a value the client can show, and back into an Error there", async () => {
    const r = await asResult(async () => {
      throw new Error("This favpoll's close date is set by its appeal.")
    })
    expect(r).toEqual({
      ok: false,
      error: "This favpoll's close date is set by its appeal.",
    })
    expect(() => unwrap(r)).toThrow(
      "This favpoll's close date is set by its appeal."
    )
  })

  it("gives a non-Error throw the fallback sentence", async () => {
    const r = await asResult(async () => {
      throw "nope"
    })
    expect(r).toEqual({ ok: false, error: "Couldn't save — try again." })
  })
})
