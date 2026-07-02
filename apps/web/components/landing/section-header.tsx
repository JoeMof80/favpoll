import { SectionEyebrow } from "@/components/ui/section-eyebrow"

type Props = {
  eyebrow: string
  title: string
  lede?: React.ReactNode
  className?: string
}

export function SectionHeader({ eyebrow, title, lede, className }: Props) {
  return (
    <div className={className}>
      <SectionEyebrow className="mb-2">{eyebrow}</SectionEyebrow>
      <h2 className="mb-3 text-3xl font-light tracking-tight text-foreground">
        {title}
      </h2>
      {lede && (
        <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
          {lede}
        </p>
      )}
    </div>
  )
}
