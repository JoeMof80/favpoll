// The favpoll page's sheet, extracted (founder, 2026-09-06: "base the
// design of the charity page on the favpoll page — especially the
// width, border and header"): the register wash as ground, a max-w-5xl
// white sheet with the drop-shadow edge. PageLayout is this sheet PLUS
// the rail grid and hero machinery — pages that need columns keep
// using it; destination pages without a rail (charity, appeal) stand
// on the bare sheet.
export function PageSheet({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-clip bg-primary/5">
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] w-full max-w-5xl bg-background px-6 pb-24 md:px-16 md:drop-shadow-lg">
        {children}
      </main>
    </div>
  )
}
