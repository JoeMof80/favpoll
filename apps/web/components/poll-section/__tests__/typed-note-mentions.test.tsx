// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"
import { TypedNote } from "../typed-note"

// Reduced motion: the still path, straight to PollNote.
vi.stubGlobal("matchMedia", (q: string) => ({
  matches: q.includes("reduce"),
  media: q,
  addEventListener() {},
  removeEventListener() {},
}))

describe("TypedNote with mentions", () => {
  it("lights the favourite, the charity and the topic in the note", () => {
    const { container } = render(
      <TypedNote
        text="Poppy's is A crackling fire. Pledge to Cancer Research UK."
        active={false}
        protagonistFirstName="Poppy"
        mentions={[
          { kind: "item", label: "A crackling fire" },
          { kind: "charity", label: "Cancer Research UK", id: "c1" },
          { kind: "topic", label: "ASMR sound", id: "t1" },
        ]}
      />
    )
    const lit = [...container.querySelectorAll("[data-mention]")].map((el) => [
      el.getAttribute("data-mention"),
      el.textContent,
    ])
    expect(lit).toEqual([
      ["item", "A crackling fire"],
      ["charity", "Cancer Research UK"],
    ])
  })
})
