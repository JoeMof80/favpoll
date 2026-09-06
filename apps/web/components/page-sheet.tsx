// The favpoll page's sheet: the register wash as ground, a max-w-5xl
// white sheet with the drop-shadow edge. PageLayout is this sheet PLUS
// the rail grid; pages without columns stand on the bare sheet.
// Deleted as orphaned in #721, resurrected 2026-09-06 for the appeal
// form pages (founder: give them the border like the other pages).
export function PageSheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-clip bg-primary/5">
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] w-full max-w-5xl bg-background px-6 pb-24 md:px-16 md:drop-shadow-lg">
        {children}
      </main>
    </div>
  )
}
