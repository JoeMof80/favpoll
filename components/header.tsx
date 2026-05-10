import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MenuButton } from "@/components/menu-button"

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-330 items-center justify-between px-6">
        <Link href="/" className="text-base font-medium text-primary">
          FavPoll
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/rankings"
            className="mr-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Rankings
          </Link>
          <Show when="signed-in">
            <Link
              href="/events"
              className="mr-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Your events
            </Link>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton>
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button size="sm">Sign up</Button>
            </SignUpButton>
          </Show>
          <MenuButton />
        </div>
      </div>
    </header>
  )
}
