import { Button } from "@/components/ui/button"
import type { ComponentProps } from "react"

type Props = {
  children: React.ReactNode
  size?: ComponentProps<typeof Button>["size"]
  variant?: ComponentProps<typeof Button>["variant"]
  className?: string
  onBeforeOpen?: () => void
}

export function NewFavpollButton({
  children,
  size,
  variant,
  className,
}: Props) {
  return (
    <Button size={size} variant={variant} className={className} type="button">
      {children}
    </Button>
  )
}
