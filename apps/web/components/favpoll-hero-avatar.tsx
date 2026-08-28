import { cn } from "@/lib/utils"

type Props = {
  name: string
  photoUrl: string | null
  className?: string
}

export function ProtagonistAvatar({ name, photoUrl, className }: Props) {
  // JOINERS ARE NOT NAMES. Splitting on spaces alone made "Sarah & Tom" into
  // the initials "S&", because "&" was taken as the second word and its first
  // character is itself. Couples are a first-class case — "Wedding" and
  // "Anniversary" are both in the celebrating_many register, and the
  // first-name derivation elsewhere already splits on "&" — so the ampersand
  // has to be dropped before initials are taken, not after.
  //
  // "and" goes too, for "Sarah and Tom", which is how most people write it.
  // Taking the first TWO surviving words gives ST for a couple and SC for a
  // person, which is the same rule doing the right thing in both cases.
  const initials = name
    .split(/[\s&]+/)
    .filter((w) => w && w.toLowerCase() !== "and")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <div
      className={cn(
        "relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-border md:h-33 md:w-33",
        className
      )}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <>
          <svg
            className="absolute inset-0 h-full w-full text-border"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="hatch"
                patternUnits="userSpaceOnUse"
                width="8"
                height="8"
                patternTransform="rotate(45)"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="8"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hatch)" />
          </svg>
          <span
            className="absolute inset-0 flex items-center justify-center text-sm font-medium text-muted-foreground"
            aria-label={name}
          >
            <span aria-hidden="true">{initials}</span>
          </span>
        </>
      )}
    </div>
  )
}
