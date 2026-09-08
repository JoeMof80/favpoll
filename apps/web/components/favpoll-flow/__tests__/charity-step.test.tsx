import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { CharityStep } from "../charity-step"
import type { Charity } from "@favpoll/types"

// Minimal rows — the component only reads id/name/consent_status/registered_number.
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
  fetchMock.mockImplementation((url: string) =>
    Promise.resolve({
      ok: true,
      json: async () =>
        String(url).includes("register-details")
          ? {
              registeredName: "ST LUKE'S CHESHIRE HOSPICE",
              place: "Winsford, Cheshire",
              website: "www.slhospice.co.uk",
            }
          : {
              results: [
                {
                  registeredNumber: "515595",
                  displayName: "St Luke's Cheshire Hospice",
                },
              ],
              total: 1,
            },
    })
  )
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
  it("searching renders catalogue matches as rows with their charity number", () => {
    render(
      <CharityStep
        charities={[approved, pending]}
        value={[]}
        onChange={vi.fn()}
        search="dogs"
      />
    )
    expect(screen.getByText("Dogs Trust")).toBeInTheDocument()
    expect(screen.getByText(/Charity no\. 1234567/)).toBeInTheDocument()
    expect(screen.queryByText("Age UK")).not.toBeInTheDocument()
  })

  it("a register pick shows the identity confirm before adding", async () => {
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

    // Debounced register search resolves into a row
    const row = await screen.findByText(
      "St Luke's Cheshire Hospice",
      undefined,
      { timeout: 2000 }
    )
    fireEvent.click(row)

    // The confirm step carries the register's identity line — and nothing
    // has been created yet
    await waitFor(() =>
      expect(screen.getByText(/Winsford, Cheshire/)).toBeInTheDocument()
    )
    expect(screen.getByText(/www\.slhospice\.co\.uk/)).toBeInTheDocument()
    expect(onRegisterAdd).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole("button", { name: "Add this charity" }))
    await waitFor(() =>
      expect(onRegisterAdd).toHaveBeenCalledWith({
        registeredNumber: "515595",
        displayName: "St Luke's Cheshire Hospice",
      })
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
    await waitFor(() =>
      expect(screen.getByText(/Winsford, Cheshire/)).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole("button", { name: "Back" }))
    expect(
      await screen.findByText("St Luke's Cheshire Hospice", undefined, {
        timeout: 2000,
      })
    ).toBeInTheDocument()
    expect(onRegisterAdd).not.toHaveBeenCalled()
  })
})
