import { Lock } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// The one visual language for "the reveal is locked — pledge to open it":
// a solid primary button with an inline lock, as on the landing page's
// reveal-mechanic demo. The visible label is a concise CTA that may name the
// protagonist's first name; it must never contain the reveal text or real
// standings (see the server-side gating decision in PROJECT.md).

export function revealLockLabel(firstName: string | null): string {
  return firstName
    ? `Pledge to reveal ${firstName}'s favourite`
    : "Pledge to reveal the favourite"
}

type PillProps = {
  label: string
  size?: "default" | "sm" | "lg"
  className?: string
}

// Presentation-only pill for embedding inside another interactive element
// (the poll section's full-area unlock overlay) or a decorative context (the
// hero demo card). pointer-events-none so clicks fall through to the wrapper.
export function RevealLockPill({
  label,
  size = "default",
  className,
}: PillProps) {
  return (
    <span
      className={cn(
        buttonVariants({ variant: "default", size }),
        "pointer-events-none shadow-md",
        className
      )}
    >
      <Lock data-icon="inline-start" aria-hidden="true" />
      {label}
    </span>
  )
}

type ButtonProps = {
  label: string
  onClick: () => void
  className?: string
}

// Standalone interactive form — used where the lock affordance is itself the
// button (the landing page's reveal-mechanic demo).
export function RevealLockButton({ label, onClick, className }: ButtonProps) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className={cn("shadow-md", className)}
    >
      <Lock data-icon="inline-start" aria-hidden="true" />
      {label}
    </Button>
  )
}
