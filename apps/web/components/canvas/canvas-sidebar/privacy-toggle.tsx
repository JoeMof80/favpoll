"use client"

import { Switch } from "@/components/ui/switch"

type Props = {
  isPrivate: boolean
  onChange: (v: boolean) => void
}

export function PrivacyToggle({ isPrivate, onChange }: Props) {
  return (
    <div className="space-y-2 rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-start gap-3">
        <Switch
          id="is-private"
          checked={isPrivate}
          onCheckedChange={onChange}
        />
        <div>
          <label
            htmlFor="is-private"
            className="cursor-pointer text-[13px] font-medium text-foreground"
          >
            Private event
          </label>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {isPrivate
              ? "Only guests you invite can view this event."
              : "Anyone can find and pledge to this event. It will appear on the live events page."}
          </p>
        </div>
      </div>
    </div>
  )
}
