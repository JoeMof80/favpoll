"use client"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

type Props = {
  children: React.ReactNode
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
  onBeforeOpen?: () => void
}

export function NewFavpollButton({
  children,
  size,
  variant,
  className,
  onBeforeOpen,
}: Props) {
  const { isSignedIn } = useAuth()
  const router = useRouter()

  function handleClick() {
    onBeforeOpen?.()
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/favpolls/new")
      return
    }
    router.push("/favpolls/new")
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={className}
      onClick={handleClick}
    >
      {children}
    </Button>
  )
}
