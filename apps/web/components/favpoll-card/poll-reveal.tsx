type PollRevealProps = {
  personalReveal?: string | null
  protagonistFirstName?: string
  role?: string
  "aria-label"?: string
  "aria-live"?: "polite" | "assertive" | "off"
}

export function PollReveal({
  personalReveal,
  protagonistFirstName,
  role,
  "aria-label": ariaLabel,
  "aria-live": ariaLive,
}: PollRevealProps) {
  if (!personalReveal) return null

  return (
    <div
      aria-label={ariaLabel ?? `${protagonistFirstName ?? "Their"}'s reveal`}
    >
      <blockquote
        className="border-l-[2.5px] border-primary-muted pl-3 text-[18px] leading-relaxed font-normal text-reveal-foreground italic"
        role={role}
        aria-live={ariaLive}
      >
        {personalReveal}
      </blockquote>
    </div>
  )
}
