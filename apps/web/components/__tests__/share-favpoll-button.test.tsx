import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { ShareFavpollButton } from "../share-favpoll-button"

describe("ShareFavpollButton", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })
  afterEach(() => {
    // @ts-expect-error test cleanup
    delete navigator.share
  })

  it("uses the native share sheet when available", async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
      writable: true,
    })
    render(
      <ShareFavpollButton
        shareTitle="Stanley — favpoll"
        url="https://x.test/f/1"
      />
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() =>
      expect(share).toHaveBeenCalledWith({
        title: "Stanley — favpoll",
        url: "https://x.test/f/1",
      })
    )
  })

  it("falls back to clipboard copy and confirms inline", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })
    render(
      <ShareFavpollButton
        shareTitle="Stanley — favpoll"
        url="https://x.test/f/1"
      />
    )
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("https://x.test/f/1")
    )
    expect(await screen.findByText("Link copied")).toBeInTheDocument()
  })

  it("does not copy when the user dismisses the native sheet", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("abort"))
    const writeText = vi.fn()
    Object.defineProperty(navigator, "share", {
      value: share,
      configurable: true,
      writable: true,
    })
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    })
    render(<ShareFavpollButton shareTitle="S" url="https://x.test/f/1" />)
    fireEvent.click(screen.getByRole("button"))
    await waitFor(() => expect(share).toHaveBeenCalled())
    expect(writeText).not.toHaveBeenCalled()
  })
})
