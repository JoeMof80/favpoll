import { describe, it, expect, vi } from "vitest"
import { render } from "@testing-library/react"

const pathname = vi.hoisted(() => ({ value: "/" }))
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }))
vi.mock("@/components/header", () => ({
  Header: () => <header data-testid="site-header" />,
}))

import { HeaderMount } from "@/components/header-mount"

// The favpoll page and the live room carry their own chrome; everything
// else keeps the site header — including the wizard at /favpolls/new,
// which the favpoll-page rule had swallowed (2026-10-19).
describe("HeaderMount", () => {
  it.each([
    ["/", true],
    ["/favpolls", true],
    ["/favpolls/new", true],
    ["/favpolls/7b262c65-55f4-4f50-a8a3-459d56ffa05a", false],
    ["/favpolls/7b262c65-55f4-4f50-a8a3-459d56ffa05a/manage", true],
    ["/live/a653ea4c-5e5b-4375-90eb-a01c8c6f4f53", false],
  ])("%s → header %s", (path, shown) => {
    pathname.value = path
    const { queryByTestId } = render(<HeaderMount />)
    expect(!!queryByTestId("site-header")).toBe(shown)
  })
})
