"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { NewEventWizard } from "@/components/new-event-wizard"

type Props = {
  children: React.ReactNode
  size?: React.ComponentProps<typeof Button>["size"]
  variant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
  onBeforeOpen?: () => void
}

export function NewEventButton({
  children,
  size,
  variant,
  className,
  onBeforeOpen,
}: Props) {
  const { isSignedIn } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  function handleClick() {
    onBeforeOpen?.()
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=/events/new")
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={variant}
        className={className}
        onClick={handleClick}
      >
        {children}
      </Button>
      <NewEventWizard open={open} onOpenChange={setOpen} />
    </>
  )
}
