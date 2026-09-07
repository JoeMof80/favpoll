import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
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

  it("searching surfaces unapproved catalogue matches", () => {
    render(
      <CharityStep
        charities={[approved, pending]}
        value={[]}
        onChange={vi.fn()}
        search="dogs"
      />
    )
    expect(screen.getByText("Dogs Trust")).toBeInTheDocument()
    expect(screen.queryByText("Age UK")).not.toBeInTheDocument()
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
