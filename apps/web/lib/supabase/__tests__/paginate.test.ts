// @vitest-environment node
import { describe, it, expect, vi } from "vitest"
import { fetchAllRows } from "@/lib/supabase/paginate"

function pages<T>(...pageData: T[][]) {
  const fn = vi.fn()
  for (const data of pageData) {
    fn.mockResolvedValueOnce({ data, error: null })
  }
  return fn
}

describe("fetchAllRows", () => {
  it("returns a single short page in one query", async () => {
    const q = pages([1, 2, 3])
    const rows = await fetchAllRows<number>(q)
    expect(rows).toEqual([1, 2, 3])
    expect(q).toHaveBeenCalledTimes(1)
    expect(q).toHaveBeenCalledWith(0, 999)
  })

  it("pages past the 1,000-row cap until a short page", async () => {
    const full = Array.from({ length: 1000 }, (_, i) => i)
    const q = pages(full, [1000, 1001])
    const rows = await fetchAllRows<number>(q)
    expect(rows).toHaveLength(1002)
    expect(q).toHaveBeenCalledTimes(2)
    expect(q).toHaveBeenNthCalledWith(2, 1000, 1999)
  })

  it("stops after an exactly-full final page followed by an empty one", async () => {
    const full = Array.from({ length: 1000 }, (_, i) => i)
    const q = pages(full, [])
    const rows = await fetchAllRows<number>(q)
    expect(rows).toHaveLength(1000)
    expect(q).toHaveBeenCalledTimes(2)
  })

  it("throws on a query error instead of returning partial rows", async () => {
    const q = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { message: "boom" } })
    await expect(fetchAllRows(q)).rejects.toThrow("boom")
  })
})
