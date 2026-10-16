"use client"

// THE FAVPOLL PAGE'S OWN CHROME (founder, 2026-10-16: no site header on the
// favpoll page — "it takes up vertical space"). What the header carried
// that a reader of THIS page might want lives in one ⋮ at the top right,
// fixed, over the hero's band: the favpoll lists, the account, the theme,
// and Manage for the organiser. The mark at the top left is the hero's
// own (hero-layout draws it, so on the phone it can give way to the
// countdown as the name docks). Same geometry as the room's chrome
// (display-chrome): the h-14 row, px-6.
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Show, SignInButton, SignUpButton, useClerk } from "@clerk/nextjs"
import {
  EllipsisVertical,
  LayoutList,
  LogIn,
  LogOut,
  Moon,
  Settings2,
  Sun,
  UserPlus,
  Heart,
} from "lucide-react"
import { useTheme } from "@favpoll/ui"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function FavpollPageMenu({
  favpollId,
  isOrganiser,
}: {
  favpollId: string
  isOrganiser: boolean
}) {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const { signOut } = useClerk()

  return (
    <div className="pointer-events-none fixed top-0 right-0 z-40 flex h-14 items-center px-6">
      <div className="pointer-events-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Menu"
              className="text-muted-foreground hover:text-foreground"
            >
              <EllipsisVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isOrganiser && (
              <>
                <DropdownMenuItem
                  onSelect={() => router.push(`/favpolls/${favpollId}/manage`)}
                >
                  <Settings2 aria-hidden="true" />
                  Manage favpoll
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href="/favpolls">
                <LayoutList aria-hidden="true" />
                All favpolls
              </Link>
            </DropdownMenuItem>
            <Show when="signed-in">
              <DropdownMenuItem asChild>
                <Link href="/my-favpolls">
                  <Heart aria-hidden="true" />
                  Your favpolls
                </Link>
              </DropdownMenuItem>
            </Show>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault()
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }}
            >
              {resolvedTheme === "dark" ? (
                <Sun aria-hidden="true" />
              ) : (
                <Moon aria-hidden="true" />
              )}
              {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <Show when="signed-out">
              <SignInButton>
                <DropdownMenuItem>
                  <LogIn aria-hidden="true" />
                  Sign in
                </DropdownMenuItem>
              </SignInButton>
              <SignUpButton>
                <DropdownMenuItem>
                  <UserPlus aria-hidden="true" />
                  Sign up
                </DropdownMenuItem>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <DropdownMenuItem onSelect={() => void signOut()}>
                <LogOut aria-hidden="true" />
                Sign out
              </DropdownMenuItem>
            </Show>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
