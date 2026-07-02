import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
  variant?: "brand" | "muted"
}

export function SectionEyebrow({
  children,
  className,
  variant = "brand",
}: Props) {
  return (
    <p
      className={cn(
        "text-xs font-medium tracking-widest uppercase",
        variant === "brand" ? "text-primary" : "text-muted-foreground",
        className
      )}
    >
      {children}
    </p>
  )
}
