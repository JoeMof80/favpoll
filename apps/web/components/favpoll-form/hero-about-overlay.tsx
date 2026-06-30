"use client"

import { useEffect, useRef, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import { RefreshCw } from "lucide-react"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupTextarea,
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
  isGenerating: boolean
  onRegenerate?: () => void
}

export function HeroAboutOverlay({
  open,
  onOpenChange,
  isGenerating,
  onRegenerate,
}: Props) {
  const form = useFormContext<FavpollFormValues>()
  const about = useWatch({ control: form.control, name: "about" }) ?? ""
  const subject =
    useWatch({ control: form.control, name: "subject" }) ?? "someone"
  const aboutRef = useRef(about)
  aboutRef.current = about

  const [draft, setDraft] = useState("")

  useEffect(() => {
    if (open) setDraft(aboutRef.current)
  }, [open])

  function save() {
    form.setValue("about", draft, { shouldValidate: true })
    onOpenChange(false)
  }

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(o) => !o && onOpenChange(false)}
      title="About"
      {...FIELD_OVERLAY_PROPS}
      header={
        <InputGroup className={INPUT_GROUP_CLS}>
          <InputGroupAddon align="block-start" className="justify-between px-5">
            <InputGroupText>About</InputGroupText>
            {onRegenerate && (
              <InputGroupButton
                size="icon-xs"
                disabled={isGenerating}
                aria-label="Regenerate suggestion"
                onClick={() => {
                  onOpenChange(false)
                  onRegenerate()
                }}
              >
                <RefreshCw />
              </InputGroupButton>
            )}
          </InputGroupAddon>
          <InputGroupTextarea
            autoFocus
            aria-describedby="about-helper"
            placeholder="Write a few lines…"
            value={draft}
            maxLength={300}
            rows={3}
            onChange={(e) => setDraft(e.target.value)}
            className="px-5 pt-2 pb-4 text-base md:text-base"
          />
          <div
            data-align="block-end"
            className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
          >
            <span id="about-helper">
              {subject === "cause"
                ? "What you're raising for — and why it matters to you."
                : "Introduce them in a sentence or two. Specific, personal details land harder than a list of facts."}
            </span>
            <CharCounter value={draft} max={300} />
          </div>
        </InputGroup>
      }
      footer={overlayFooter(save, () => onOpenChange(false))}
    />
  )
}
