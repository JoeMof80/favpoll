import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))
vi.mock("@/app/events/[id]/actions", () => ({
  createPledge: vi.fn(),
  createGuestPledge: vi.fn(),
  topUpFund: vi.fn(),
  pledgeFromFund: vi.fn(),
}))
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { warning: vi.fn() }),
}))

import { PledgeCard } from "../index"
import { toast } from "sonner"

describe("PledgeCard prePublish", () => {
  it("renders the Your pledge label", () => {
    render(<PledgeCard prePublish />)
    expect(screen.getByText("Your pledge")).toBeInTheDocument()
  })

  it("renders the amount input", () => {
    render(<PledgeCard prePublish />)
    expect(screen.getByLabelText("Your pledge")).toBeInTheDocument()
  })

  it("renders the Pledge favourites button", () => {
    render(<PledgeCard prePublish />)
    expect(
      screen.getByRole("button", { name: /pledge favourites/i })
    ).toBeInTheDocument()
  })

  it("shows a toast when Pledge favourites is clicked", () => {
    render(<PledgeCard prePublish />)
    fireEvent.click(screen.getByRole("button", { name: /pledge favourites/i }))
    expect(toast.warning).toHaveBeenCalledWith(
      "Publish your event to start receiving pledges.",
      expect.objectContaining({ style: expect.any(Object) })
    )
  })
})
