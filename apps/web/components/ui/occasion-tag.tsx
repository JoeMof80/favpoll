import { cn } from "@/lib/utils"

type Props = {
  label: string
  className?: string
}

export function OccasionTag({ label, className }: Props) {
  return (
    <p
      className={cn(
        "text-[10px] font-medium tracking-[0.08em] text-[#534AB7] uppercase opacity-70",
        className
      )}
    >
      {label}
    </p>
  )
}
