"use client"

import React, { useEffect, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { Camera, Eye, EyeOff } from "lucide-react"
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { FieldDescription } from "@/components/ui/field"
import {
  OCCASION_PLACEHOLDERS,
  DEFAULT_PLACEHOLDERS,
  DATE_LABEL_PLACEHOLDERS,
} from "@/lib/occasions"
import { PREFIXES } from "@/lib/display"
import { cn } from "@/lib/utils"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { PhotoCropModal } from "./photo-crop-modal"
import { DateTimePicker } from "./date-time-picker"
import { OccasionPickerField } from "./occasion-picker-field"
import { CharityField } from "./charity-field"
import { TopicPickerField } from "./topic-picker-field"
import { INPUT_SIZE, TEXTAREA_SIZE, type PickerSize } from "./constants"

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

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  categories: Category[]
  previewSuffix: boolean
  onToggleSuffix: () => void
  previewPhoto: boolean
  onTogglePhoto: () => void
  onRevealFocus: () => void
  onRevealBlur: () => void
  photoFileName: string | null
  onPhotoFileChange: (name: string | null) => void
  size?: PickerSize
}

function CounterWhenTyping({
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

function StepSection({
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

export function FormPanel({
  charities,
  topics,
  categories,
  previewSuffix,
  onToggleSuffix,
  previewPhoto,
  onTogglePhoto,
  onRevealFocus,
  onRevealBlur,
  photoFileName,
  onPhotoFileChange,
  size = "md",
}: Props) {
  const form = useFormContext<EventFormValues>()
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const occasion = form.watch("occasion")
  const name = form.watch("name")
  const selectedTopics = form.watch("topics")
  const currentPhotoUrl = form.watch("photoUrl")

  const openingLineValue = form.watch("openingLine") ?? ""
  const nameValue = form.watch("name") ?? ""
  const contextValue = form.watch("context") ?? ""
  const aboutValue = form.watch("about") ?? ""
  const revealValue = form.watch("reveal") ?? ""
  const charitiesValue = form.watch("charities") ?? []

  // Clear reveal when topic is cleared
  useEffect(() => {
    if (selectedTopics?.length === 0) {
      form.setValue("reveal", "")
    }
  }, [selectedTopics?.length, form])

  const nameRemaining = 40 - nameValue.length
  const openingLineRemaining = 60 - openingLineValue.length
  const contextRemaining = 40 - contextValue.length
  const aboutRemaining = 300 - aboutValue.length
  const revealRemaining = 280 - revealValue.length

  const charitiesCount = charitiesValue.length
  const charitiesDescription =
    charitiesCount === 0
      ? "Select up to three charities."
      : charitiesCount === 1
        ? "1 of 3 selected."
        : `${charitiesCount} of 3 selected — proceeds split equally.`

  const basePlaceholders = occasion
    ? (OCCASION_PLACEHOLDERS[occasion] ?? DEFAULT_PLACEHOLDERS)
    : null
  const datePlaceholder = occasion
    ? (DATE_LABEL_PLACEHOLDERS[occasion] ?? "")
    : ""
  const firstSelectedTopicId = selectedTopics?.[0]?.topicId
  const firstTopicMeta = topics.find((t) => t.id === firstSelectedTopicId)
  const topicTitle = selectedTopics?.[0]?.title ?? ""
  const firstName = (name || (basePlaceholders?.name ?? "")).split(" ")[0]
  const topicAbout =
    firstTopicMeta?.placeholders?.[occasion]?.about ??
    firstTopicMeta?.placeholders?.["default"]?.about
  const aboutPlaceholder = basePlaceholders
    ? (topicAbout ?? basePlaceholders.about)
    : ""
  const topicOccasionReveal = firstTopicMeta?.placeholders?.[occasion]?.reveal
  const revealPlaceholder =
    topicTitle && occasion && topicOccasionReveal
      ? topicOccasionReveal.replace("{name}", firstName)
      : topicTitle
        ? `Share their favourite ${topicTitle.toLowerCase()}…`
        : "Share something they loved…"

  return (
    <div className="p-6">
      {/* Step 1 — Occasion */}
      <StepSection number={1} title="Occasion" size={size}>
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
      </StepSection>

      {/* Step 2 — Personal information */}
      <StepSection number={2} title="Profile" size={size}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  className={cn(
                    INPUT_SIZE[size],
                    "bg-background placeholder:text-muted-foreground/50"
                  )}
                  placeholder={
                    basePlaceholders?.name ?? "Enter name or nickname"
                  }
                  maxLength={40}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <FieldDescription size={size} className="mb-2">
                <CounterWhenTyping
                  remaining={nameRemaining}
                  description="Name or nickname shown throughout the event"
                  warning={8}
                  critical={4}
                />
              </FieldDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="context"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Context
              </FormLabel>
              <FormControl>
                <InputGroup className={cn(INPUT_SIZE[size], "bg-background")}>
                  <InputGroupInput
                    placeholder={datePlaceholder || "Enter context"}
                    className="placeholder:text-muted-foreground/50"
                    maxLength={40}
                    {...field}
                    value={field.value ?? ""}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      onClick={onToggleSuffix}
                      size="icon-xs"
                      aria-label={
                        previewSuffix
                          ? "Hide date from preview"
                          : "Show date in preview"
                      }
                    >
                      {previewSuffix ? <Eye /> : <EyeOff />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormMessage />
              <FieldDescription size={size} className="mb-2">
                <CounterWhenTyping
                  remaining={contextRemaining}
                  description="Dates, years, or other context. Optional."
                  warning={8}
                  critical={4}
                />
              </FieldDescription>
            </FormItem>
          )}
        />

        {/* Picture field */}
        <FormItem>
          <p className="text-xs font-medium text-muted-foreground">Photo</p>
          <FormControl>
            <div>
              <InputGroup className={cn(INPUT_SIZE[size], "bg-background")}>
                <InputGroupAddon
                  align="inline-start"
                  className="cursor-pointer text-muted-foreground/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {currentPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={currentPhotoUrl}
                      alt="Profile photo preview"
                      className="h-6 w-6 rounded-full object-cover"
                    />
                  ) : (
                    <Camera />
                  )}
                </InputGroupAddon>
                <InputGroupInput
                  readOnly
                  value={
                    currentPhotoUrl
                      ? (photoFileName ?? "Photo selected")
                      : "Pick an image"
                  }
                  className={
                    currentPhotoUrl
                      ? "cursor-pointer"
                      : "cursor-pointer text-muted-foreground/50"
                  }
                  onClick={() => fileInputRef.current?.click()}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    onClick={(e) => {
                      e.stopPropagation()
                      onTogglePhoto()
                    }}
                    size="icon-xs"
                    aria-label={
                      previewPhoto
                        ? "Hide photo from preview"
                        : "Show photo in preview"
                    }
                  >
                    {previewPhoto ? <Eye /> : <EyeOff />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  onPhotoFileChange(file.name)
                  setCropSrc(URL.createObjectURL(file))
                  e.target.value = ""
                }}
              />
            </div>
          </FormControl>
        </FormItem>

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                About
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder={aboutPlaceholder || "Tell guests about them"}
                  rows={4}
                  maxLength={300}
                  {...field}
                  value={field.value}
                  className={cn(
                    TEXTAREA_SIZE[size],
                    "bg-background placeholder:text-muted-foreground/50"
                  )}
                />
              </FormControl>
              <FormMessage />
              <FieldDescription size={size} className="mb-2">
                <CounterWhenTyping
                  remaining={aboutRemaining}
                  warning={60}
                  critical={15}
                />
              </FieldDescription>
            </FormItem>
          )}
        />
      </StepSection>

      {cropSrc && (
        <PhotoCropModal
          open
          imageSrc={cropSrc}
          onClose={() => setCropSrc(null)}
          onSave={(blob, previewUrl) => {
            const file = new File([blob], "photo.jpg", { type: blob.type })
            form.setValue("photo", file, { shouldValidate: true })
            form.setValue("photoUrl", previewUrl)
            setCropSrc(null)
          }}
        />
      )}

      {/* Step 3 — topic */}
      <StepSection number={3} title="Topic" size={size}>
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs text-muted-foreground">
                  Topic
                </FormLabel>
                <TopicPickerField
                  topics={topics}
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                  size={size}
                />
                <FormMessage />
                <FieldDescription size={size} className="mb-2">
                  Find a topic for guests to vote on or create one of your own.
                </FieldDescription>
              </FormItem>
            )}
          />

          {selectedTopics?.[0] && (
            <p className="text-sm text-muted-foreground">
              {selectedTopics[0].isCustom
                ? "This is a new topic. Add items after publishing — guests won't see any options until you do."
                : "You can add items to this poll after publishing."}
            </p>
          )}
        </div>
      </StepSection>

      {/* Step 4 — Reveal */}
      <StepSection number={4} title="Reveal" size={size}>
        <FormField
          control={form.control}
          name="reveal"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                The reveal
              </FormLabel>
              <FormControl>
                <Textarea
                  className={cn(
                    TEXTAREA_SIZE[size],
                    "bg-background placeholder:text-muted-foreground/50"
                  )}
                  placeholder={revealPlaceholder}
                  rows={5}
                  maxLength={280}
                  {...field}
                  value={field.value ?? ""}
                  onFocus={onRevealFocus}
                  onBlur={() => {
                    field.onBlur()
                    onRevealBlur()
                  }}
                />
              </FormControl>
              <FormMessage />
              <FieldDescription size={size} className="mb-2">
                <CounterWhenTyping
                  remaining={revealRemaining}
                  description="Shown to guests after they've pledged."
                  warning={56}
                  critical={14}
                />
              </FieldDescription>
            </FormItem>
          )}
        />
      </StepSection>

      {/* Step 5 — Event information */}
      <StepSection number={5} title="Event" isLast size={size}>
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
      </StepSection>
    </div>
  )
}
