"use client"

import { HeroLayout } from "../hero-layout"
import { EditableField } from "../editable-field"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/event-hero-avatar"
import { getFavpollHeadline } from "@/lib/display"
import { cn } from "@/lib/utils"
import type { EventFormValues } from "@/components/event-form-v2/schema"
import type { Favpoll, Protagonist } from "@favpoll/types"
import { Button } from "@/components/ui/button"

type BaseEventHeroProps = {
  event?: Favpoll
  protagonist?: Protagonist
  hideAvatar?: boolean
  aboutPlaceholder?: string

  isEdit?: boolean
  formValues?: any
  isGenerating?: boolean
  onRegenerate?: () => void

  // Pass edit-specific avatar from parent
  editAvatar?: React.ReactNode
}

export function BaseEventHero({
  event,
  protagonist,
  hideAvatar,
  aboutPlaceholder,
  isEdit = false,
  formValues = {},
  isGenerating = false,
  onRegenerate,
  editAvatar,
}: BaseEventHeroProps) {
  const values = formValues as Partial<EventFormValues>
  const subject = (values.subject ?? "someone") as "someone" | "cause"
  const name = values.name ?? protagonist?.name ?? ""
  const context = values.context ?? protagonist?.context ?? ""
  const about = values.about ?? protagonist?.about ?? ""
  const causeLabel = values.causeLabel ?? ""
  const openingLine = values.openingLine ?? ""
  const photoUrl = values.photoUrl
  const photo = values.photo as File | undefined
  const resolvedPhotoUrl = photo
    ? URL.createObjectURL(photo)
    : (photoUrl ?? null)

  const headline = getFavpollHeadline({
    register: values.register,
    occasionType: event?.occasion_type ?? null,
    name: protagonist?.name ?? name,
    dateLabel: protagonist?.context ?? null,
    openingLine: event?.opening_line ?? null,
    subject,
  })

  const eyebrowText = isEdit ? (
    <EditableField onClick={() => {}} className="w-full">
      <SectionEyebrow
        variant="muted"
        className="flex h-8 items-center truncate wrap-break-word"
      >
        {openingLine || "Opening line"}
      </SectionEyebrow>
    </EditableField>
  ) : (
    <SectionEyebrow
      variant="muted"
      className="flex h-8 items-center truncate wrap-break-word"
    >
      {headline.prefix}
    </SectionEyebrow>
  )

  const title = isEdit ? (
    subject === "cause" ? (
      <EditableField onClick={() => {}}>
        <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
          {causeLabel || (
            <span className="text-muted-foreground/50">
              What are you raising for?
            </span>
          )}
        </h1>
      </EditableField>
    ) : (
      <EditableField onClick={() => {}}>
        <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
          {name || <span className="text-muted-foreground/50">Name</span>}
        </h1>
      </EditableField>
    )
  ) : (
    <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
      {protagonist?.name}
    </h1>
  )

  const subtitle = isEdit
    ? subject !== "cause" && (
        <EditableField onClick={() => {}} className="mt-2">
          <p
            className={cn(
              "truncate text-xl font-normal whitespace-normal md:text-2xl",
              context ? "text-[#534AB7]" : "text-muted-foreground/40"
            )}
          >
            {context || "Context"}
          </p>
        </EditableField>
      )
    : headline.suffix && (
        <p className="mt-2 truncate text-xl font-normal whitespace-normal text-[#534AB7] md:text-2xl">
          {headline.suffix}
        </p>
      )

  const avatar = isEdit
    ? editAvatar
    : !hideAvatar && (
        <ProtagonistAvatar
          name={protagonist?.name ?? ""}
          photoUrl={protagonist?.photo_url ?? null}
        />
      )

  const aboutContent = isEdit ? (
    <div className="flex w-full flex-col items-start">
      <EditableField onClick={() => {}} className="w-full text-left">
        {about ? (
          <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
            {about}
          </p>
        ) : isGenerating ? (
          <div className="w-full animate-pulse space-y-1.5">
            <div className="h-4 w-full rounded-full bg-muted/60" />
            <div className="h-4 w-4/5 rounded-full bg-muted/60" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground/40">About</p>
        )}
      </EditableField>

      {!about && !isGenerating && onRegenerate && (
        <Button
          type="button"
          variant="link"
          className="mt-2 h-auto px-0 py-0 text-sm text-muted-foreground hover:text-muted-foreground/70"
          onClick={onRegenerate}
        >
          Generate a suggestion →
        </Button>
      )}
    </div>
  ) : protagonist?.about || aboutPlaceholder ? (
    <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
      {protagonist?.about || aboutPlaceholder}
    </p>
  ) : undefined

  return (
    <HeroLayout
      eyebrowText={eyebrowText}
      title={title}
      subtitle={subtitle}
      avatar={avatar}
      about={aboutContent}
    />
  )
}
