import Link from "next/link"
import { Button } from "@/components/ui/button"
import { REGISTER_FILTER_LABELS, type Register } from "@/lib/registers"

export function EventCardEmpty({
  activeRegister,
}: {
  activeRegister?: Register | null
}) {
  const label = activeRegister ? REGISTER_FILTER_LABELS[activeRegister] : null

  return (
    <div className="col-span-full py-20 text-center">
      <p className="mb-4 text-[32px]">🕯</p>
      <p className="mb-2 text-[15px] font-medium text-foreground">
        No live events yet
      </p>
      <p className="mx-auto mb-6 max-w-70 text-[13px] text-muted-foreground">
        {label
          ? `No live "${label}" events right now. Be the first to create one.`
          : "Be the first to create a favpoll event and it will appear here."}
      </p>
      <Button asChild size="lg">
        <Link href="/events/new">Create an event</Link>
      </Button>
    </div>
  )
}
