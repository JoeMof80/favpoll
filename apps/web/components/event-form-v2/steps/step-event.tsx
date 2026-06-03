"use client"

import { useFormContext } from "react-hook-form"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { FieldDescription } from "@/components/ui/field"
import type { Charity } from "@favpoll/types"
import type { EventFormValues } from "../schema"
import { DateTimePicker } from "../date-time-picker"
import { CharityField } from "../charity-field"
import type { PickerSize } from "../constants"

type Props = {
  charities: Charity[]
  size?: PickerSize
}

export function StepEvent({ charities, size = "md" }: Props) {
  const form = useFormContext<EventFormValues>()
  const charitiesValue = form.watch("charities") ?? []
  const charitiesCount = charitiesValue.length
  const charitiesDescription =
    charitiesCount === 0
      ? "Select up to three charities."
      : charitiesCount === 1
        ? "1 of 3 selected."
        : `${charitiesCount} of 3 selected — proceeds split equally.`

  return (
    <>
      <FormField
        control={form.control}
        name="closesAt"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">
              Close date
            </FormLabel>
            <DateTimePicker
              value={field.value}
              onChange={field.onChange}
              size={size}
            />
            <FormMessage />
            <FieldDescription size={size} className="mb-2">
              No more pledges and proceeds go to chosen cause(s).
            </FieldDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="charities"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-muted-foreground">
              Charity
            </FormLabel>
            <CharityField
              charities={charities}
              value={field.value}
              onChange={field.onChange}
              size={size}
            />
            <FormMessage />
            <FieldDescription size={size} className="mb-2">
              {charitiesDescription}
            </FieldDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="isPrivate"
        render={({ field }) => (
          <FormItem>
            <div className="items-top flex justify-between gap-3 rounded-md border bg-background p-3">
              <FormLabel className="text-xs text-muted-foreground">
                {field.value
                  ? "Private — only guests you invite can view and pledge."
                  : "Public — anyone can find this event and make a pledge."}
              </FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}
