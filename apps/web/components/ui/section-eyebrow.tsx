import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
  variant?: "brand" | "muted"
  /**
   * Render as the section's heading rather than a paragraph. For sections
   * whose eyebrow IS the only heading — without it their content headings
   * skip a level. Styling is unchanged either way.
   */
  as?: "p" | "h2"
}

export function SectionEyebrow({
  children,
  className,
  variant = "brand",
  as: Tag = "p",
}: Props) {
  return (
    <Tag
      className={cn(
        "text-xs font-medium tracking-widest uppercase",
        variant === "brand" ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </Tag>
  )
}
