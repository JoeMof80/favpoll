import "@testing-library/jest-dom"
import { vi, afterEach } from "vitest"

// jsdom doesn't implement window.matchMedia — stub it (only in browser-like environments)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

// jsdom doesn't implement ResizeObserver either. The mobile media in
// ProcessOverview measure their own column with one, so that they cannot go
// stale the way a hand-tuned per-breakpoint scale does — which it did, three
// times. A no-op stub is right rather than a fake measurement: jsdom has no
// layout engine, so every rect it reports is zero anyway, and a component
// that behaves sensibly at zero width is the thing worth asserting.
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
}

afterEach(() => {
  vi.restoreAllMocks()
})
