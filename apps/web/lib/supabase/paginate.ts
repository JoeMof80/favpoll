// PostgREST caps every select at 1,000 rows BY DEFAULT and truncates
// silently — an aggregation that reads pledge rows without paging
// under-reports the moment a poll gets popular (2026-07-20 survey, Tier 2).
// fetchAllRows pages a query with .range() until a short page arrives.
//
// It THROWS on query errors rather than returning partial rows: for money
// aggregation, loud beats silently wrong (the app's habit of ignoring
// { error } is how a failed query renders as £0).

const PAGE_SIZE = 1000

type PageResult<T> = {
  data: T[] | null
  error: { message: string } | null
}

export async function fetchAllRows<T>(
  makeQuery: (from: number, to: number) => PromiseLike<PageResult<T>>
): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await makeQuery(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    const page = data ?? []
    rows.push(...page)
    if (page.length < PAGE_SIZE) break
  }
  return rows
}
