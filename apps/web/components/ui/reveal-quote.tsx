import { cn } from "@/lib/utils"

type Props = {
  text: string
  className?: string
  role?: string
  "aria-label"?: string
  "aria-live"?: "polite" | "assertive" | "off"
}

export function RevealQuote({ text, className, ...ariaProps }: Props) {
  return (
    <blockquote
      className={cn(
        "border-l-4 border-primary/40 pl-4 text-base text-primary/80 italic",
        className
      )}
      {...ariaProps}
    >
      &ldquo;{text}&rdquo;
    </blockquote>
  )
}
