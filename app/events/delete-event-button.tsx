'use client'

import { useTransition } from 'react'
import { deleteEvent } from './actions'

export function DeleteEventButton({ eventId }: { eventId: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!confirm('Delete this event? This cannot be undone.')) return
        startTransition(() => deleteEvent(eventId))
      }}
      className="shrink-0 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  )
}
