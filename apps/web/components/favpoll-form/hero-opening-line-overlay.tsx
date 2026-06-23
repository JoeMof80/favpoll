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
import { getFavpollHeadline } from "@/lib/display"
import type { FavpollFormValues } from "./schema"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HeroOpeningLineOverlay({ open, onOpenChange }: Props) {
  const form = useFormContext<FavpollFormValues>()
  const openingLine =
    useWatch({ control: form.control, name: "openingLine" }) ?? ""
  const register = useWatch({ control: form.control, name: "register" }) ?? ""
  const name = useWatch({ control: form.control, name: "name" }) ?? ""
  const causeLabel =
    useWatch({ control: form.control, name: "causeLabel" }) ?? ""
  const subject = (useWatch({ control: form.control, name: "subject" }) ??
    "someone") as "someone" | "cause"

  const openingLineRef = useRef(openingLine)
  openingLineRef.current = openingLine

  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (open) setDraft(openingLineRef.current)
  }, [open])

  const placeholder = getFavpollHeadline({
    register,
    occasionType: null,
    name: name || causeLabel,
    subject,
  }).prefix

  function save() {
    form.setValue("openingLine", draft, { shouldValidate: true })
    onOpenChange(false)
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(o) => !o && onOpenChange(false)}
      title="Opening line"
      {...FIELD_OVERLAY_PROPS}
      header={
        <InputGroup className={INPUT_GROUP_CLS}>
          <InputGroupAddon align="block-start" className="px-5">
            <InputGroupText>Opening line</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput
            autoFocus
            placeholder={placeholder}
            value={draft}
            maxLength={50}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="px-5 pb-4 text-base md:text-base"
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
          >
            <span>Replaces the default opening prefix. Optional.</span>
            <CharCounter value={draft} max={50} />
          </div>
        </InputGroup>
      }
      footer={overlayFooter(save, () => onOpenChange(false))}
    />
  )
}
