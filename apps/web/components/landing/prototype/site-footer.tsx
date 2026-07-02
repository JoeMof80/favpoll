// PROTOTYPE — site footer (promote to components/landing/ at fold-in and
// mount in the root layout). Carries the trust content moved off the landing
// body: where the money goes, written in advance.
import Link from "next/link"

const EXPLORE = [
  ["/favpolls", "Live favpolls"],
  ["/rankings", "The record"],
  ["/favpolls/new", "Create a favpoll"],
] as const

const ACCOUNT = [
  ["/my-favpolls", "My favpolls"],
  ["/sign-in", "Sign in"],
  ["/sign-up", "Sign up"],
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-330 px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.6fr]">
          {/* Brand */}
          <div>
            <p className="mb-3 text-xl font-medium text-primary">
              fav<span className="font-normal opacity-70">poll</span>
            </p>
            <p className="max-w-60 text-sm leading-relaxed text-muted-foreground">
              Expressions of joy, for charitable causes, in the name of those we
              love.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Explore">
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              Explore
            </p>
            <ul className="flex flex-col gap-2">
              {EXPLORE.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Your account">
            <p className="mb-3 text-xs font-medium tracking-widest text-primary uppercase">
              Your account
            </p>
            <ul className="flex flex-col gap-2">
              {ACCOUNT.map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Trust blurbs — moved off the landing body */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
                Where the money goes
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A 5% platform fee covers favpoll's costs. The remaining 95%
                reaches your chosen charity in full.
              </p>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium tracking-widest text-primary uppercase">
                Written in advance
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground">
                A favpoll can be kept in a will or letter of wishes — the
                questions and reveals written in advance, in your own words.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 favpoll</p>
          <p>Payments processed by Stripe</p>
        </div>
      </div>
    </footer>
  )
}
