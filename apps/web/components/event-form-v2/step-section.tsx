import React from "react"
import { cn } from "@/lib/utils"
import type { PickerSize } from "./constants"

const STEP_NUMBER: Record<PickerSize, string> = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-5 w-5 text-[11px]",
  lg: "h-6 w-6 text-xs",
}
const STEP_TITLE: Record<PickerSize, string> = {
  sm: "h-5 text-[11px]",
  md: "h-5 text-xs",
  lg: "h-6 text-sm",
}
const STEP_SPACING: Record<PickerSize, string> = {
  sm: "pb-7",
  md: "pb-8",
  lg: "pb-10",
}
const STEP_LINE_MT: Record<PickerSize, string> = {
  sm: "mt-1.5",
  md: "mt-1.5",
  lg: "mt-2",
}

export function CounterWhenTyping({
  remaining,
  description,
  warning,
  critical,
}: {
  remaining: number
  description?: string
  warning: number
  critical: number
}) {
  if (remaining <= warning) {
    return (
      <span
        className={cn(
          "block text-right",
          remaining <= critical ? "text-[#E24B4A]" : "text-[#EF9F27]"
        )}
      >
        {remaining} left
      </span>
    )
  }
  return description ? <>{description}</> : null
}

export function StepSection({
  number,
  title,
  children,
  isLast = false,
  size = "md",
}: {
  number: number
  title: string
  children: React.ReactNode
  isLast?: boolean
  size?: PickerSize
}) {
  return (
    <div className="flex gap-2.5">
      <div className="flex shrink-0 flex-col items-center">
        <span
          className={cn(
            "flex shrink-0 items-center justify-center rounded-full bg-[#534AB7] font-semibold text-white",
            STEP_NUMBER[size]
          )}
        >
          {number}
        </span>
        {!isLast && (
          <div className={cn("w-px flex-1 bg-[#AFA9EC]", STEP_LINE_MT[size])} />
        )}
      </div>
      <div
        className={cn(
          "min-w-0 flex-1 space-y-3",
          !isLast && STEP_SPACING[size]
        )}
      >
        <h2
          className={cn(
            "flex items-center font-medium tracking-widest text-[#7F77DD] uppercase",
            STEP_TITLE[size]
          )}
        >
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
