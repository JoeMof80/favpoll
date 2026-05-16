"use client"

export function AmountInput({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="relative mt-2">
      <span
        className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xl text-muted-foreground"
        aria-hidden="true"
      >
        £
      </span>
      <input
        id={id}
        type="number"
        min="0.01"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md border border-input bg-background py-3 pr-3 pl-8 text-2xl font-medium text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
        placeholder="0"
      />
    </div>
  )
}
