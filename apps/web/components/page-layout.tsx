type Props = {
  left: React.ReactNode
  right?: React.ReactNode
  children?: React.ReactNode
}

export function PageLayout({ left, right, children }: Props) {
  return (
    <div className="overflow-x-clip bg-primary/5">
      <main // Mobile bottom padding clears the fixed charity footer by 1.5rem when
        // one is mounted (it publishes --charity-footer-h), and is the old
        // 6rem otherwise.
        className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl bg-background px-6 pb-[max(6rem,calc(var(--charity-footer-h,0px)+1.5rem))] md:px-16 md:pt-0 md:pb-24 md:drop-shadow-lg"
      >
        <div className="grid gap-10 md:grid-cols-[1fr_300px]">
          {/* min-w-0: grid items default to min-width auto, so any wide
              intrinsic content (the rank-history chart's 520px SVG) forces
              the whole column past the viewport on phones — hero avatar
              off-screen, right margin gone (found on iOS, 2026-07-26) */}
          <div className="min-w-0">{left}</div>
          {right !== undefined && (
            <div className="sticky top-14 z-10 hidden space-y-4 self-start bg-background md:block md:pt-16">
              {right}
            </div>
          )}
        </div>
        {children}
      </main>
    </div>
  )
}
