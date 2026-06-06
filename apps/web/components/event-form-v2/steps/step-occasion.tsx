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
import { getEventHeadline } from "@/lib/display"
import { cn } from "@/lib/utils"
import type { EventFormValues } from "../schema"
import { RegisterPickerField } from "../register-picker-field"
import { OccasionTypeField } from "../occasion-type-field"
import { CounterWhenTyping } from "../step-section"
import { INPUT_SIZE, type PickerSize } from "../constants"

export function StepOccasion({ size = "md" }: { size?: PickerSize }) {
  const form = useFormContext<EventFormValues>()
  const register = form.watch("register") ?? ""
  const occasionType = form.watch("occasionType") ?? null
  const openingLineValue = form.watch("openingLine") ?? ""
  const openingLineRemaining = 60 - openingLineValue.length

  const openingLinePlaceholder = register
    ? getEventHeadline({
        register,
        occasionType: occasionType || null,
        name: "",
      }).prefix
    : "Enter opening line"

  return (
    <>
      <FormField
        control={form.control}
        name="register"
        render={({ field }) => (
          <FormItem>
            <RegisterPickerField
              register={field.value}
              onChange={(reg, oType) => {
                field.onChange(reg)
                form.setValue("occasionType", oType ?? "")
                form.setValue("openingLine", "")
              }}
              onClear={() => {
                form.reset()
              }}
              size={size}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {register && (
        <FormField
          control={form.control}
          name="occasionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                What is it?
              </FormLabel>
              <FormControl>
                <OccasionTypeField
                  register={register}
                  value={field.value ?? ""}
                  onChange={(v) => field.onChange(v)}
                  size={size}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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
                placeholder={openingLinePlaceholder}
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
