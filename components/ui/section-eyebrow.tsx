import { cn } from "@/lib/utils"

type Props = {
  children: React.ReactNode
  className?: string
}

export function SectionEyebrow({ children, className }: Props) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium tracking-widest uppercase text-[#534AB7]",
        className
      )}
    >
      {children}
    </p>
  )
}
