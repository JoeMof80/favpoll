import { NewEventButton } from "@/components/new-event-button"

export function EventCardEmpty() {
  return (
    <div className="col-span-full py-20 text-center">
      <p className="mb-4 text-[32px]">🕯</p>
      <p className="mb-2 text-[15px] font-medium text-foreground">
        No live events yet
      </p>
      <p className="mx-auto mb-6 max-w-[280px] text-[13px] text-muted-foreground">
        Be the first to create a favpoll event and it will appear here.
      </p>
      <NewEventButton size="lg">Create an event</NewEventButton>
    </div>
  )
}
