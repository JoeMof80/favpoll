type Props = {
  left: React.ReactNode
  right?: React.ReactNode
  children?: React.ReactNode
}

export function PageLayout({ left, right, children }: Props) {
  return (
    <div className="overflow-x-clip bg-primary/5">
      <main className="mx-auto min-h-[calc(100vh-3.5rem)] max-w-5xl bg-background px-6 pb-24 md:px-16 md:pt-0 md:pb-24 md:drop-shadow-lg">
        <div className="grid gap-10 md:grid-cols-[1fr_300px]">
          <div>{left}</div>
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
