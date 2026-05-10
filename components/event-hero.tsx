import type { Event, Person } from "@/types"

const OCCASION_LABELS: Record<string, string> = {
  memorial: "In memory of",
  birthday: "Celebrating",
  retirement: "Honouring",
  wedding: "Celebrating",
  other: "A tribute to",
}

function formatYear(person: Person): string {
  if (person.birth_year && person.death_year) {
    return `${person.birth_year}–${person.death_year}`
  }
  if (person.birth_year) {
    return `Born ${person.birth_year}`
  }
  return ""
}

type Props = {
  event: Event
  person: Person
}

export function EventHero({ event, person }: Props) {
  const label = OCCASION_LABELS[event.occasion] ?? "A tribute to"
  const years = formatYear(person)

  return (
    <div className="flex items-center gap-5 rounded-lg border border-border bg-card px-5 py-5">
      {person.photo_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={person.photo_url}
          alt={person.name}
          className="mb-3 h-14 w-14 rounded-full border border-border object-cover"
        />
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-medium tracking-tight text-foreground">
          {person.name}
        </p>
        {years && (
          <p className="mt-0.5 text-xs text-muted-foreground">{years}</p>
        )}
      </div>
    </div>
  )
}
