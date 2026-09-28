import { describe, it, expect } from "vitest"
import {
  segmentMentions,
  mentionQueryAt,
  mentionSuggestions,
  insertMention,
  type MentionTarget,
} from "../mentions"

const T: MentionTarget[] = [
  { kind: "charity", label: "Trussell Trust", id: "c1" },
  { kind: "charity", label: "Mind", id: "c2" },
  { kind: "topic", label: "Bird of prey", id: "t1" },
  { kind: "item", label: "Kestrel" },
]

describe("segmentMentions", () => {
  it("finds the charity and the topic the generator wrote, the topic in prose case", () => {
    const s = segmentMentions(
      "Pledge to Trussell Trust, pick your favourite bird of prey, to see Poppy's.",
      T
    )
    expect(
      s.filter((x) => x.target).map((x) => [x.text, x.target!.kind])
    ).toEqual([
      ["Trussell Trust", "charity"],
      ["bird of prey", "topic"],
    ])
    expect(s.map((x) => x.text).join("")).toBe(
      "Pledge to Trussell Trust, pick your favourite bird of prey, to see Poppy's."
    )
  })

  it("a charity matches by exact case and whole word only", () => {
    expect(
      segmentMentions("Keep it in mind. Mind helps.", T).filter((x) => x.target)
    ).toEqual([{ text: "Mind", target: T[1] }])
    expect(
      segmentMentions("Minded to help", T).filter((x) => x.target)
    ).toEqual([])
  })

  it("an item is highlighted in the note, once per occurrence", () => {
    const s = segmentMentions("Poppy's is Kestrel. A kestrel, always.", T)
    expect(s.filter((x) => x.target).map((x) => x.text)).toEqual(["Kestrel"])
  })

  it("no targets or empty text is one plain segment", () => {
    expect(segmentMentions("", T)).toEqual([{ text: "", target: null }])
    expect(segmentMentions("Hello", [])).toEqual([
      { text: "Hello", target: null },
    ])
  })
})

describe("the @ menu", () => {
  it("opens on a word-opening @ and reads the query to the caret", () => {
    expect(mentionQueryAt("Pledge to @Trus", 15)).toEqual({
      start: 10,
      query: "Trus",
    })
    expect(mentionQueryAt("email me@x", 10)).toBeNull()
    expect(mentionQueryAt("@a\nb", 4)).toBeNull()
  })

  it("filters suggestions by the query, keeping order, deduplicated", () => {
    expect(mentionSuggestions(T, "tru").map((t) => t.label)).toEqual([
      "Trussell Trust",
    ])
    expect(mentionSuggestions([...T, T[0]], "").length).toBe(4)
  })

  it("inserts the label over the query and spaces before a word", () => {
    expect(
      insertMention("Pledge to @Tru, then", 10, 14, "Trussell Trust")
    ).toEqual({
      text: "Pledge to Trussell Trust, then",
      caret: 24,
    })
    expect(
      insertMention("Pledge to @Tru then", 10, 14, "Trussell Trust")
    ).toEqual({
      text: "Pledge to Trussell Trust then",
      caret: 24,
    })
  })
})
