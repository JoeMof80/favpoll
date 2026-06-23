import { PreviewCard } from "./how-it-works-preview-card"
import { EXAMPLE } from "./example"

export function Step5Preview() {
  return (
    <PreviewCard>
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-semibold text-muted-foreground">
          Poll closed
        </span>
      </div>
      <div className="mt-1 text-[12px] text-muted-foreground">
        {EXAMPLE.total} raised for {EXAMPLE.charity.name}
      </div>
    </PreviewCard>
  )
}
