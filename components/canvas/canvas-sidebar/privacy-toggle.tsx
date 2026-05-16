"use client"

type Props = {
  isPrivate: boolean
  onChange: (v: boolean) => void
}

export function PrivacyToggle({ isPrivate, onChange }: Props) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card px-5 py-4">
      <label className="flex cursor-pointer items-center gap-3">
        <input
          type="checkbox"
          checked={isPrivate}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-primary"
        />
        <div>
          <p className="text-sm font-medium text-foreground">Private event</p>
          <p className="text-xs text-muted-foreground">
            Only invited guests can view
          </p>
        </div>
      </label>
    </div>
  )
}
