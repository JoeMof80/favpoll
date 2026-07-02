export type PickerSize = "sm" | "md" | "lg"

export const CHIP_IN_INPUT =
  "flex w-full flex-wrap items-center rounded-md border border-input bg-background cursor-text focus-within:ring-2 focus-within:ring-ring"

export const CHIP_IN_INPUT_SIZE: Record<PickerSize, string> = {
  sm: "min-h-8 gap-1 px-2 py-1",
  md: "min-h-9 gap-1.5 px-2 py-1.5",
  lg: "min-h-11 gap-2 px-3 py-2",
}

export const CHIP_IN_INPUT_TEXT: Record<PickerSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
}

export const SECTION_LABEL =
  "text-[11px] font-medium uppercase tracking-[0.08em] text-primary"

export const MAX_CHARITIES = 3

export const INPUT_SIZE: Record<PickerSize, string> = {
  sm: "h-8 text-xs md:text-xs",
  md: "h-9 text-sm md:text-sm",
  lg: "h-10 text-base md:text-base",
}

export const TEXTAREA_SIZE: Record<PickerSize, string> = {
  sm: "text-xs md:text-xs",
  md: "text-sm md:text-sm",
  lg: "text-base md:text-base",
}
