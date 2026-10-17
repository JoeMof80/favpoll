"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

type ScrollRoot = {
  /** The element that scrolls, when it is NOT the document. Scroll-linked
   *  components pass it to framer's useScroll({ container }); window
   *  scroll never fires inside the shell. null = the document scrolls. */
  ref: React.RefObject<HTMLDivElement | null> | null
  /** Viewport offset of the scrollport's top edge. 56 (the h-14 fixed
   *  header) when the document scrolls, 0 inside the shell's own
   *  scroller, whose box already starts below the header. Anything that
   *  converts a measured inset into a `sticky top-*` value must add this
   *  — adding 56 unconditionally is what stuck the hero 56px low. */
  headerInset: number
}

// Default: the document scrolls under the fixed header.
const ScrollRootContext = createContext<ScrollRoot>({
  ref: null,
  headerInset: 56,
})

export const useScrollRoot = () => useContext(ScrollRootContext)

/** The app shell's left column — the scroller, and the scroll root for
 *  everything rendered inside it. Below md it does not scroll (the
 *  document does), and scroll-linked desktop animation is inert there
 *  anyway, so one provider serves both breakpoints. */
export function ShellScroller({
  className,
  children,
}: {
  className: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const value = useMemo(() => ({ ref, headerInset: 0 }), [])
  return (
    <ScrollRootContext.Provider value={value}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </ScrollRootContext.Provider>
  )
}

/** WHETHER CONTENT IS PASSING UNDER THE PINNED CHROME (founder, 2026-10-17:
 *  "should we add drop shadow to the top of the footer and the bottom of
 *  the header" — "lets try it"): `top` once the column has scrolled at all,
 *  `bottom` while there is more below the fold. Read from the shell's
 *  scroller from the shell breakpoint and from the window below it (the
 *  ShellScroller element exists at every width but only scrolls from the
 *  breakpoint; whichever actually overflows is the one that counts). The
 *  band and the charity footer wear a soft shadow only while their edge
 *  is true — never at rest, where it would read as a bevel. */
export function useScrollEdges() {
  const { ref } = useScrollRoot()
  const [edges, setEdges] = useState({ top: false, bottom: false })
  useEffect(() => {
    const el = ref?.current ?? null
    const read = () => {
      const elScrolls = !!el && el.scrollHeight > el.clientHeight + 1
      const top = elScrolls ? el.scrollTop : window.scrollY
      const viewport = elScrolls ? el.clientHeight : window.innerHeight
      const total = elScrolls
        ? el.scrollHeight
        : document.documentElement.scrollHeight
      const next = { top: top > 2, bottom: top + viewport < total - 2 }
      setEdges((prev) =>
        prev.top === next.top && prev.bottom === next.bottom ? prev : next
      )
    }
    read()
    el?.addEventListener("scroll", read, { passive: true })
    window.addEventListener("scroll", read, { passive: true })
    window.addEventListener("resize", read)
    // Observe the scroller's CONTENT, not its box: the box keeps its
    // height while the standings load beneath, and it is the content's
    // growth that decides whether there is more below.
    const ro = new ResizeObserver(read)
    if (el) {
      ro.observe(el)
      if (el.firstElementChild) ro.observe(el.firstElementChild)
    }
    ro.observe(document.body)
    return () => {
      el?.removeEventListener("scroll", read)
      window.removeEventListener("scroll", read)
      window.removeEventListener("resize", read)
      ro.disconnect()
    }
  }, [ref])
  return edges
}
