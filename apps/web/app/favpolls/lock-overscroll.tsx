"use client"

import { useEffect } from "react"

/**
 * Prevents iOS elastic/rubber-band scrolling on pages where the content
 * fits the viewport. Sets overflow:hidden on <html> on mount, restores
 * on unmount. Only applies when the document doesn't actually need to
 * scroll (content ≤ viewport).
 */
export function LockOverscroll() {
  useEffect(() => {
    const html = document.documentElement

    const lock = () => {
      const needsScroll = document.body.scrollHeight > window.innerHeight
      if (needsScroll) {
        html.style.overflow = ""
      } else {
        html.style.overflow = "hidden"
      }
    }

    lock()
    window.addEventListener("resize", lock)
    // Re-check after client-side filter changes that might add/remove items
    const observer = new MutationObserver(lock)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      html.style.overflow = ""
      window.removeEventListener("resize", lock)
      observer.disconnect()
    }
  }, [])

  return null
}
