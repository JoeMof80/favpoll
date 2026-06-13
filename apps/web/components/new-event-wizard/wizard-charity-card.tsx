"use client"

import { Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Charity } from "@favpoll/types"

type Props = {
  charities: Charity[]
  onEdit: () => void
  onRemove: (id: string) => void
  onPickAnother: () => void
}

export function WizardCharityCard({
  charities,
  onEdit,
  onRemove,
  onPickAnother,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      {charities.map((c) => (
        <div key={c.id}>
          <div className="flex items-start gap-3">
            {c.logo_url ? (
              <img
                src={c.logo_url}
                alt=""
                className="h-10 w-10 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEEDFE] text-base text-[#534AB7]">
                {c.name.charAt(0)}
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-base text-foreground">
                {c.name}
              </span>
              {c.registered_number && (
                <span className="text-sm text-muted-foreground">
                  Charity no. {c.registered_number}
                </span>
              )}
            </span>
            <div className="flex shrink-0 items-center">
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={onEdit}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => onRemove(c.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
      {charities.length < 3 && (
        <button
          type="button"
          onClick={onPickAnother}
          className="border-t border-border pt-3 text-left text-sm text-[#534AB7] hover:underline"
        >
          + Pick another charity
        </button>
      )}
    </div>
  )
}
