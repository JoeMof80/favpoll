"use client"

import { InfoIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type Props = {
  children: React.ReactNode
}

export function PledgeCardWrapper({ children }: Props) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between gap-1.5">
        <label
          htmlFor="pledge-amount"
          className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
        >
          Your pledge
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="About pledging"
              className="h-4 w-4 rounded-full"
            >
              <InfoIcon className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 text-xs leading-relaxed">
            Pledge the amount that reflects how strongly you feel about your
            favourites. Add more to the shared fund, if you wish. All pledges
            are anonymous.
          </PopoverContent>
        </Popover>
      </div>
      {children}
    </div>
  )
}
