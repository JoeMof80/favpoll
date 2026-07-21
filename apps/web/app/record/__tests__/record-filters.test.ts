import { describe, it, expect } from "vitest"
import { filterTopics, sortTopics } from "../record-client"
import type { Topic, Favourite } from "@favpoll/types"

type TopicWithItems = Topic & {
  favourites: Favourite[]
  category_ids: string[]
}

function makeTopic(
  title: string,
  favourites: { label: string; pledged: number; count: number }[],
  category_ids: string[] = []
): TopicWithItems {
  return {
    id: title.toLowerCase(),
    title,
    is_finite: true,
    favourites: favourites.map(
      (f, i) =>
        ({
          id: `${title}-${i}`,
          label: f.label,
          all_time_pledged: f.pledged,
          all_time_count: f.count,
        }) as unknown as Favourite
    ),
    category_ids,
  } as unknown as TopicWithItems
}

const colour = makeTopic(
  "Colour",
  [
    { label: "Purple", pledged: 350, count: 12 },
    { label: "Blue", pledged: 220, count: 8 },
  ],
  ["classics"]
)
const season = makeTopic(
  "Season",
  [{ label: "Autumn", pledged: 900, count: 3 }],
  ["classics", "nature"]
)
const biscuit = makeTopic("Biscuit", [
  { label: "Bourbon", pledged: 10, count: 1 },
])

describe("filterTopics", () => {
  it("filters by category", () => {
    const result = filterTopics([colour, season, biscuit], "nature", "")
    expect(result.map((t) => t.title)).toEqual(["Season"])
  })

  it("matches topic titles case-insensitively", () => {
    const result = filterTopics([colour, season], null, "col")
    expect(result.map((t) => t.title)).toEqual(["Colour"])
  })

  it("matches favourite labels — searching purple finds Colour", () => {
    const result = filterTopics([colour, season, biscuit], null, "purple")
    expect(result.map((t) => t.title)).toEqual(["Colour"])
  })

  it("combines category and query", () => {
    const result = filterTopics([colour, season], "classics", "autumn")
    expect(result.map((t) => t.title)).toEqual(["Season"])
  })
})

describe("sortTopics", () => {
  it("az preserves the server's title order", () => {
    const result = sortTopics([biscuit, colour, season], "az")
    expect(result.map((t) => t.title)).toEqual(["Biscuit", "Colour", "Season"])
  })

  it("most_raised orders by total pledged descending", () => {
    const result = sortTopics([colour, season, biscuit], "most_raised")
    expect(result.map((t) => t.title)).toEqual(["Season", "Colour", "Biscuit"])
  })

  it("most_pledges orders by pledge count descending", () => {
    const result = sortTopics([colour, season, biscuit], "most_pledges")
    expect(result.map((t) => t.title)).toEqual(["Colour", "Season", "Biscuit"])
  })
})
