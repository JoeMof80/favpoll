import type { CardProtagonist, FavpollCardSize } from "./types"

type FavpollHeaderProps = {
  protagonist: CardProtagonist
  eyebrow?: string
  size?: FavpollCardSize
}

function getInitials(name: string, override?: string): string {
  if (override) return override.slice(0, 2)
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
}

export function FavpollHeader({
  protagonist,
  eyebrow,
  size = "lg",
}: FavpollHeaderProps) {
  const avatarSize = size === "lg" ? 56 : size === "md" ? 36 : 32
  const nameClass =
    size === "lg"
      ? "text-[22px] font-medium text-[#2C2C2A]"
      : size === "md"
        ? "text-[16px] font-medium text-[#2C2C2A]"
        : "text-[14px] font-medium text-[#2C2C2A]"
  const initialsTextClass =
    size === "lg" ? "text-sm" : size === "md" ? "text-xs" : "text-[10px]"

  const initials = getInitials(protagonist.name, protagonist.initials)

  return (
    <div>
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          {eyebrow && (
            <span className="text-[11px] font-medium tracking-[0.08em] text-[#888780] uppercase">
              {eyebrow}
            </span>
          )}
          <span className={nameClass}>{protagonist.name}</span>
          {protagonist.context && (
            <span className="text-[12px] text-[#888780]">
              {protagonist.context}
            </span>
          )}
        </div>

        <div
          className="shrink-0"
          style={{ width: avatarSize, height: avatarSize }}
        >
          {protagonist.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={protagonist.photo_url}
              alt={protagonist.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-full border border-[#AFA9EC] bg-[#EEEDFE]"
              aria-label={protagonist.name}
            >
              <span
                className={`font-medium text-[#534AB7] ${initialsTextClass}`}
                aria-hidden="true"
              >
                {initials}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* <div className="mt-3 mb-4 border-b border-[#D3D1C7]" /> */}
    </div>
  )
}
