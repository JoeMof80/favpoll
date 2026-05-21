import { useFavpollCard } from './favpoll-card-context'

type FavpollHeaderProps = {
  protagonistName: string
  protagonistInitials?: string
  protagonistAvatarSrc?: string
  eyebrow?: string
  dateLabel?: string
}

function getInitials(name: string, initials?: string): string {
  if (initials) return initials.slice(0, 2)
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function FavpollHeader({
  protagonistName,
  protagonistInitials,
  protagonistAvatarSrc,
  eyebrow,
  dateLabel,
}: FavpollHeaderProps) {
  const { size } = useFavpollCard()

  const avatarSize = size === 'full' ? 56 : size === 'demo' ? 36 : 32
  const nameClass =
    size === 'full'
      ? 'text-[22px] font-medium text-[#2C2C2A]'
      : size === 'demo'
        ? 'text-[16px] font-medium text-[#2C2C2A]'
        : 'text-[14px] font-medium text-[#2C2C2A]'

  const initialsTextClass =
    size === 'full' ? 'text-sm' : size === 'demo' ? 'text-xs' : 'text-[10px]'

  const derivedInitials = getInitials(protagonistName, protagonistInitials)

  return (
    <div>
      <div className="flex items-start justify-between">
        {/* Left rail */}
        <div className="flex flex-col">
          {eyebrow && (
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#888780]">
              {eyebrow}
            </span>
          )}
          <span className={nameClass}>{protagonistName}</span>
          {dateLabel && (
            <span className="text-[12px] text-[#888780]">{dateLabel}</span>
          )}
        </div>

        {/* Avatar */}
        <div className="shrink-0" style={{ width: avatarSize, height: avatarSize }}>
          {protagonistAvatarSrc ? (
            <img
              src={protagonistAvatarSrc}
              alt={protagonistName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-full border border-[#AFA9EC] bg-[#EEEDFE]"
              aria-label={protagonistName}
            >
              <span
                className={`font-medium text-[#534AB7] ${initialsTextClass}`}
                aria-hidden="true"
              >
                {derivedInitials}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 mb-4 border-b border-[#D3D1C7]" />
    </div>
  )
}
