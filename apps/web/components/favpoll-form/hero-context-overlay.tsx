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

export function HeroContextOverlay({ open, onOpenChange }: Props) {
  const form = useFormContext<FavpollFormValues>()
  const context = useWatch({ control: form.control, name: "context" }) ?? ""
  const contextRef = useRef(context)
  contextRef.current = context

  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (open) setDraft(contextRef.current)
  }, [open])

  function save() {
    form.setValue("context", draft, { shouldValidate: true })
    onOpenChange(false)
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(o) => !o && onOpenChange(false)}
      title="Context"
      {...FIELD_OVERLAY_PROPS}
      header={
        <InputGroup className={INPUT_GROUP_CLS}>
          <InputGroupAddon align="block-start" className="px-5">
            <InputGroupText>Context</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            autoFocus
            placeholder="e.g. turning 40, class of 2024"
            value={draft}
            maxLength={40}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="px-5 pb-4 text-base md:text-base"
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
          >
            <span>Dates, years, or other context. Optional.</span>
            <CharCounter value={draft} max={40} />
          </div>
        </InputGroup>
      }
      footer={overlayFooter(save, () => onOpenChange(false))}
    />
  )
}
