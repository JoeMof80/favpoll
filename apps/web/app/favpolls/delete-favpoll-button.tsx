"use client"

import { useTransition } from "react"
import { Button } from "@/components/ui/button"
import { deleteFavpoll } from "./actions"

export function DeleteFavpollButton({ favpollId }: { favpollId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm("Delete this favpoll? This cannot be undone.")) return
        startTransition(() => deleteFavpoll(favpollId))
      }}
      className="shrink-0 px-2.5 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      {pending ? "Deleting…" : "Delete"}
    </Button>
  )
}
