"use client"

import { createContext, useContext, useMemo, useRef } from "react"

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
