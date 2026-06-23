import { PreviewCard } from "./how-it-works-preview-card"

export function Step3Preview() {
  return (
    <PreviewCard>
      <div className="mb-2 text-[10px] font-medium tracking-[0.08em] text-[#888780] uppercase">
        Share link
      </div>
      <div className="rounded-md border border-border bg-muted px-3 py-2 font-mono">
        <span className="text-[11px] text-muted-foreground">
          favpoll.com/favpolls/
        </span>
        <span className="text-[11px] font-medium text-foreground">
          belinda-hartley
        </span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {["WhatsApp", "Email", "QR"].map((method) => (
          <span
            key={method}
            className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
          >
            {method}
          </span>
        ))}
      </div>
    </PreviewCard>
  )
}
