import type { FavpollCardSize } from "./types"

type SectionLabelProps = {
  title: string
  size?: FavpollCardSize
}

export function SectionLabel({ title, size = "lg" }: SectionLabelProps) {
  const textClass =
    size === "lg"
      ? "text-[17px]"
      : size === "md"
        ? "text-[15px]"
        : "text-[11px]"

  return (
    <h3
      className={`${textClass} font-medium tracking-[0.09em] text-primary-muted uppercase`}
    >
      {title}
    </h3>
  )
}
