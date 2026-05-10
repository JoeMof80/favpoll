import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex flex-col">
      <section className="flex min-h-[calc(100svh-3.5rem)] items-center justify-center px-6 py-20">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-sm font-medium text-primary">FavPoll</p>
          <h1 className="mt-3 text-4xl font-medium leading-tight tracking-tight text-foreground">
            Celebrate the people you love.
            <br />
            Raise money for causes that matter.
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Create a poll for a birthday, retirement, wedding, or memorial. Guests
            pledge donations split across their favourite options — and every penny
            goes directly to your chosen charity.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/events/new"
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Create an event
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring rounded"
            >
              How it works →
            </Link>
          </div>
        </div>
      </section>

      <section
        id="how-it-works"
        className="border-t border-border bg-muted/30 px-6 py-16"
      >
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-10 text-center text-xl font-medium text-foreground">
            How it works
          </h2>
          <ol className="grid gap-8 sm:grid-cols-3" role="list">
            {[
              {
                step: '1',
                heading: 'Create an event',
                body: 'Pick who you are celebrating, choose a charity, and select the topics guests will vote on — favourite colour, film, song, and more.',
              },
              {
                step: '2',
                heading: 'Guests pledge',
                body: 'Share your link. Each guest pledges a donation and splits it across their favourite options. Everyone takes part in their own way.',
              },
              {
                step: '3',
                heading: 'The charity receives',
                body: 'Every pound pledged goes to your chosen charity, and the live rankings show what the people you love love most.',
              },
            ].map((item) => (
              <li key={item.step} className="flex flex-col gap-2">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary"
                  aria-hidden="true"
                >
                  {item.step}
                </span>
                <h3 className="text-sm font-medium text-foreground">{item.heading}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} FavPoll. All pledges go to your nominated charity.
        </p>
      </footer>
    </main>
  )
}
