import Link from "next/link"
import { Button } from "@/components/ui/button"

// The 404 in favpoll's voice: quiet and useful, no whimsy — a guest
// mistyping a memorial link must not meet a joke.
export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-background px-8 py-12 text-center shadow-sm">
        <p className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
          404
        </p>
        <h1 className="mt-3 text-3xl font-light text-foreground">
          This page isn&apos;t here
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The link may be mistyped, or the favpoll it pointed to may no longer
          be listed. Check the link, or start from the current favpolls.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button asChild>
            <Link href="/favpolls">All favpolls</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
