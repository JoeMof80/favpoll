"use client"

type Props = {
  potAmount: string
  onChange: (v: string) => void
}

export function SharedFund({ potAmount, onChange }: Props) {
  return (
    <div className="rounded-lg border border-primary/20 bg-secondary px-5 py-4">
      <label
        htmlFor="canvas-pot"
        className="mb-2 block text-xs font-semibold tracking-widest text-muted-foreground uppercase"
      >
        Shared fund (optional)
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
          £
        </span>
        <input
          id="canvas-pot"
          type="number"
          min="0"
          step="1"
          value={potAmount}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-7 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
        />
      </div>
    </div>
  )
}
