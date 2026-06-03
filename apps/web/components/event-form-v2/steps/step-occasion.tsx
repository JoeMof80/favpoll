"use client"

import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FieldDescription } from "@/components/ui/field"
import { PREFIXES } from "@/lib/display"
import { cn } from "@/lib/utils"
import type { EventFormValues } from "../schema"
import { OccasionPickerField } from "../occasion-picker-field"
import { CounterWhenTyping } from "../step-section"
import { INPUT_SIZE, type PickerSize } from "../constants"

export function StepOccasion({ size = "md" }: { size?: PickerSize }) {
  const form = useFormContext<EventFormValues>()
  const occasion = form.watch("occasion")
  const openingLineValue = form.watch("openingLine") ?? ""
  const openingLineRemaining = 60 - openingLineValue.length

  return (
    <>
      <FormField
        control={form.control}
        name="occasion"
        render={({ field }) => (
          <FormItem>
            <OccasionPickerField
              value={field.value}
              onChange={(value) => {
                field.onChange(value)
                form.setValue("openingLine", "")
              }}
              onClear={() => form.reset()}
              size={size}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="openingLine"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">
              Context
            </FormLabel>
            <FormControl>
              <Input
                className={cn(
                  INPUT_SIZE[size],
                  "bg-background placeholder:text-muted-foreground/50"
                )}
                placeholder={
                  PREFIXES[occasion as keyof typeof PREFIXES] ??
                  "Enter opening line"
                }
                maxLength={60}
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
            <FieldDescription size={size} className="mb-2">
              <CounterWhenTyping
                remaining={openingLineRemaining}
                warning={12}
                critical={6}
              />
            </FieldDescription>
          </FormItem>
        )}
      />
    </>
  )
}
