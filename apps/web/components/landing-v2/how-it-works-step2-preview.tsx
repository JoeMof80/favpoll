import { SectionLabel } from "@/components/favpoll-card/section-label"
import { PreviewCard } from "./how-it-works-preview-card"
import { EXAMPLE } from "./example"

export function Step2Preview() {
  return (
    <PreviewCard className="space-y-2.5">
      <div>
        <div className="mb-1 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
          Charity
        </div>
        <div className="text-[15px] font-medium text-foreground">
          {EXAMPLE.charity.name}
        </div>
        <div className="text-[11px] text-muted-foreground">
          Reg. {EXAMPLE.charity.registeredNumber}
        </div>
      </div>
      <div className="border-t border-border pt-2.5">
        <SectionLabel title={EXAMPLE.topic.title} size="md" />
      </div>
    </PreviewCard>
  )
}
