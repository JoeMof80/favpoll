import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CharityStep } from "../charity-step"
import type { Charity } from "@favpoll/types"

const charity = (over: Partial<Charity>): Charity =>
  ({
    id: "c-x",
    name: "Charity X",
    registered_number: "1234567",
    is_active: true,
    ...over,
  }) as Charity

const approved = charity({
  id: "c-approved",
  name: "Age UK",
  consent_status: "approved",
  registered_website: "www.ageuk.org.uk",
})
const pending = charity({
  id: "c-pending",
  name: "Dogs Trust",
  consent_status: "pending",
})

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  fetchMock.mockReset()
  fetchMock.mockResolvedValue({
    ok: true,
    json: async () => ({
      results: [
        {
          registeredNumber: "515595",
          displayName: "St Luke's Cheshire Hospice",
          place: "Winsford, Cheshire",
          website: "www.slhospice.co.uk",
        },
      ],
      total: 1,
    }),
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("CharityStep — the earned shelf", () => {
  it("default cloud shows only approved charities", () => {
    render(
      <CharityStep
        charities={[approved, pending]}
        value={[]}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("Age UK")).toBeInTheDocument()
    expect(screen.queryByText("Dogs Trust")).not.toBeInTheDocument()
  })

  it("a selected unapproved charity stays visible for review/undo", () => {
    render(
      <CharityStep
        charities={[approved, pending]}
        value={["c-pending"]}
        onChange={vi.fn()}
      />
    )
    expect(screen.getByText("Dogs Trust")).toBeInTheDocument()
  })

  it("an empty shelf invites the register search", () => {
    render(
      <CharityStep
        charities={[pending]}
        value={[]}
        onChange={vi.fn()}
        onRegisterAdd={vi.fn()}
      />
    )
    expect(
      screen.getByText(
        "Search any UK charity — the whole Charity Commission register."
      )
    ).toBeInTheDocument()
  })
})

describe("CharityStep — search rows and the confirm step", () => {
  it("catalogue rows carry number and a website link", () => {
    render(
      <CharityStep
        charities={[approved, pending]}
        value={[]}
        onChange={vi.fn()}
        search="age"
      />
    )
    expect(screen.getByText("Age UK")).toBeInTheDocument()
    expect(screen.getByText(/Charity no\. 1234567/)).toBeInTheDocument()
    const link = screen.getByTitle("Visit www.ageuk.org.uk")
    expect(link).toHaveAttribute("href", "https://www.ageuk.org.uk")
  })

  it("register rows show place and a website link", async () => {
    render(
      <CharityStep
        charities={[]}
        value={[]}
        onChange={vi.fn()}
        search="st lukes"
        onRegisterAdd={vi.fn()}
      />
    )
    await screen.findByText("St Luke's Cheshire Hospice", undefined, {
      timeout: 2000,
    })
    expect(screen.getByText(/Winsford, Cheshire/)).toBeInTheDocument()
    expect(screen.getByTitle("Visit www.slhospice.co.uk")).toHaveAttribute(
      "href",
      "https://www.slhospice.co.uk"
    )
  })

  it("a register pick confirms — instantly, from row data — before adding", async () => {
    const onRegisterAdd = vi.fn().mockResolvedValue(undefined)
    render(
      <CharityStep
        charities={[]}
        value={[]}
        onChange={vi.fn()}
        search="st lukes"
        onRegisterAdd={onRegisterAdd}
      />
    )
    const row = await screen.findByText(
      "St Luke's Cheshire Hospice",
      undefined,
      { timeout: 2000 }
    )
    fireEvent.click(row)

    // Identity line + website, no second fetch, nothing created yet
    expect(screen.getByText(/Charity no\. 515595/)).toBeInTheDocument()
    expect(screen.getByText(/Winsford, Cheshire/)).toBeInTheDocument()
    expect(onRegisterAdd).not.toHaveBeenCalled()
    expect(fetchMock).toHaveBeenCalledTimes(1) // the search only

    fireEvent.click(screen.getByRole("button", { name: "Add this charity" }))
    await waitFor(() =>
      expect(onRegisterAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          registeredNumber: "515595",
          displayName: "St Luke's Cheshire Hospice",
        })
      )
    )
  })

  it("Back dismisses the confirm without adding", async () => {
    const onRegisterAdd = vi.fn().mockResolvedValue(undefined)
    render(
      <CharityStep
        charities={[]}
        value={[]}
        onChange={vi.fn()}
        search="st lukes"
        onRegisterAdd={onRegisterAdd}
      />
    )
    const row = await screen.findByText(
      "St Luke's Cheshire Hospice",
      undefined,
      { timeout: 2000 }
    )
    fireEvent.click(row)
    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(
      await screen.findByText("St Luke's Cheshire Hospice", undefined, {
        timeout: 2000,
      })
    ).toBeInTheDocument()
    expect(onRegisterAdd).not.toHaveBeenCalled()
  })
})
