import { cn } from "@/lib/utils"

// A run of buttons fused into one control (shadcn's ButtonGroup,
// trimmed to what we use). Children keep their own variants; the
// group strips the inner radii and collapses the doubled border —
// border-l-0, not negative margins, because Button's bg-clip-padding
// makes overlapped borders show through as a seam (the split-button
// lesson, 2026-09-02). Focus ring lifts above neighbours with z-10.
export function ButtonGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="button-group"
      className={cn(
        "flex w-fit items-stretch",
        "[&>*]:focus-visible:relative [&>*]:focus-visible:z-10",
        "[&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        className
      )}
      {...props}
    />
  )
}
