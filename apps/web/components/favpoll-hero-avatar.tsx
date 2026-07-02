import { cn } from "@/lib/utils"

type Props = {
  name: string
  photoUrl: string | null
  className?: string
}

export function ProtagonistAvatar({ name, photoUrl, className }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
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
