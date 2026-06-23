import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
}

export function PreviewCard({ children, className }: Props) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-background p-3",
        className
      )}
    >
      {children}
    </div>
  )
}
