'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { deleteEvent } from './actions'

export function DeleteEventButton({ eventId }: { eventId: string }) {
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
        if (!confirm('Delete this event? This cannot be undone.')) return
        startTransition(() => deleteEvent(eventId))
      }}
      className="shrink-0 px-2.5 py-1 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      {pending ? 'Deleting…' : 'Delete'}
    </Button>
  )
}
