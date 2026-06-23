"use client"

import { useEffect, useRef, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import {
  FIELD_OVERLAY_PROPS,
  INPUT_GROUP_CLS,
  CharCounter,
  overlayFooter,
} from "./edit-helpers"
import type { FavpollFormValues } from "./schema"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HeroCauseLabelOverlay({ open, onOpenChange }: Props) {
  const form = useFormContext<FavpollFormValues>()
  const causeLabel =
    useWatch({ control: form.control, name: "causeLabel" }) ?? ""
  const causeLabelRef = useRef(causeLabel)
  causeLabelRef.current = causeLabel

  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (open) setDraft(causeLabelRef.current)
  }, [open])

  function save() {
    form.setValue("causeLabel", draft, { shouldValidate: true })
    onOpenChange(false)
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(o) => !o && onOpenChange(false)}
      title="Cause"
      {...FIELD_OVERLAY_PROPS}
      header={
        <InputGroup className={INPUT_GROUP_CLS}>
          <InputGroupAddon align="block-start" className="px-5">
            <InputGroupText>Cause</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            autoFocus
            placeholder="e.g. dementia research, local foodbank"
            value={draft}
            maxLength={60}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="px-5 pb-4 text-base md:text-base"
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
          >
            <span>
              What you&apos;re raising for — shown throughout the favpoll.
            </span>
            <CharCounter value={draft} max={60} />
          </div>
        </InputGroup>
      }
      footer={overlayFooter(save, () => onOpenChange(false))}
    />
  )
}
