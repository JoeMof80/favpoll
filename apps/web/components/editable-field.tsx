import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { EDIT_BTN, EditBadge } from "./event-form-v2/edit-helpers"

export function EditableField({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(EDIT_BTN, className)}
      onClick={onClick}
    >
      {children}
      <EditBadge />
    </Button>
  )
}
