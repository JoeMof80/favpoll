import { PreviewCard } from "./how-it-works-preview-card"
import { EXAMPLE } from "./example"

export function Step6Preview() {
  return (
    <PreviewCard>
      <div className="mb-1.5 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
        {EXAMPLE.protagonist.name.split(" ")[0]}&apos;s reveal
      </div>
      <p className="text-[13px] leading-relaxed text-foreground italic">
        &ldquo;{EXAMPLE.reveal}&rdquo;
      </p>
    </PreviewCard>
  )
}
