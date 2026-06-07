"use client"

import { useRef, useState } from "react"
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { FieldDescription } from "@/components/ui/field"
import { DATE_LABEL_PLACEHOLDERS } from "@/lib/registers"
import { cn } from "@/lib/utils"
import type { TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "../schema"
import { PhotoCropModal } from "../photo-crop-modal"
import { CounterWhenTyping } from "../step-section"
import { INPUT_SIZE, TEXTAREA_SIZE, type PickerSize } from "../constants"

type Props = {
  topics: TopicWithMeta[]
  previewSuffix: boolean
  onToggleSuffix: () => void
  previewPhoto: boolean
  onTogglePhoto: () => void
  photoFileName: string | null
  onPhotoFileChange: (name: string | null) => void
  size?: PickerSize
}

export function StepProfile({
  topics,
  previewSuffix,
  onToggleSuffix,
  previewPhoto,
  onTogglePhoto,
  photoFileName,
  onPhotoFileChange,
  size = "md",
}: Props) {
  const form = useFormContext<EventFormValues>()
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const register = form.watch("register") ?? ""
  const occasionType = (form.watch("occasionType") ?? "") || null
  const selectedTopics = form.watch("topics")
  const currentPhotoUrl = form.watch("photoUrl")
  const nameValue = form.watch("name") ?? ""
  const contextValue = form.watch("context") ?? ""
  const aboutValue = form.watch("about") ?? ""

  const nameRemaining = 40 - nameValue.length
  const contextRemaining = 40 - contextValue.length
  const aboutRemaining = 300 - aboutValue.length

  // Date label placeholder: keyed by occasion_type if known
  const datePlaceholder = occasionType
    ? (DATE_LABEL_PLACEHOLDERS[occasionType] ?? "")
    : ""
  const firstSelectedTopicId = selectedTopics?.[0]?.topicId
  const firstTopicMeta = topics.find((t) => t.id === firstSelectedTopicId)
  const aboutPlaceholder = register
    ? (firstTopicMeta?.placeholders?.[register]?.about ?? "")
    : ""

  return (
    <>
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
                placeholder="Enter name or nickname"
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
    </>
  )
}
