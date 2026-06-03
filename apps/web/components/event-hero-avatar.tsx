type Props = {
  name: string
  photoUrl: string | null
}

export function ProtagonistAvatar({ name, photoUrl }: Props) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()

  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-[#D3D1C7] md:h-28 md:w-28">
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} className="h-full w-full object-cover" />
      ) : (
        <>
          <svg
            className="absolute inset-0 h-full w-full text-[#D3D1C7]"
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
            className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[#888780]"
            aria-label={name}
          >
            <span aria-hidden="true">{initials}</span>
          </span>
        </>
      )}
    </div>
  )
}
