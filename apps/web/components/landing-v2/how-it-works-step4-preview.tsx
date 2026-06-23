import { cn } from "@/lib/utils"
import { PreviewCard } from "./how-it-works-preview-card"
import { EXAMPLE } from "./example"

export function Step4Preview() {
  const displayItems = EXAMPLE.items.slice(0, 9)
  return (
    <PreviewCard>
      <div className="mb-2 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
        Choose your favourite
      </div>
      <div className="flex flex-wrap gap-1">
        {displayItems.map((item) => (
          <span
            key={item}
            className={cn(
              "inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-medium",
              item === EXAMPLE.selectedItem
                ? "bg-[#534AB7] text-white"
                : "bg-muted text-muted-foreground"
            )}
          >
            {item}
          </span>
        ))}
        <span className="inline-flex h-6 items-center px-1 text-[11px] text-muted-foreground">
          +4
        </span>
      </div>
      <div className="mt-2.5 border-t border-border pt-2 text-[12px] text-muted-foreground">
        Pledge: <span className="font-semibold text-foreground">£10</span>
      </div>
    </PreviewCard>
  )
}
