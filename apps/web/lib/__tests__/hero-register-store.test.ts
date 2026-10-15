import { describe, it, expect, afterEach } from "vitest"
import { getHeroRegister, setHeroRegister } from "@/lib/hero-register-store"

describe("hero-register-store", () => {
  afterEach(() => setHeroRegister(undefined))

  it("starts withdrawn, holds a palette, and distinguishes scrolled-past from absent", () => {
    expect(getHeroRegister()).toBeUndefined()
    setHeroRegister("memorial")
    expect(getHeroRegister()).toBe("memorial")
    setHeroRegister(null)
    expect(getHeroRegister()).toBeNull()
    setHeroRegister(undefined)
    expect(getHeroRegister()).toBeUndefined()
  })
})
