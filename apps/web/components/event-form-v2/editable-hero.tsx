"use client"

import { useRef, useState } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import { RefreshCw } from "lucide-react"
import {
  contextExamples,
  deriveRegister,
  getExampleName,
} from "@/lib/registers"
import { getEventHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/event-hero-avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { PhotoCropModal } from "./photo-crop-modal"
import { EDIT_BTN, EditBadge, CharCounter, overlayFooter } from "./edit-helpers"
import { cn } from "@/lib/utils"
import type { TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"

type Props = {
  topics: TopicWithMeta[]
  isGenerating?: boolean
  personRevealExample?: string | null
  onRegenerate?: () => void
}

export function EditableHero({
  topics,
  isGenerating = false,
  personRevealExample = null,
  onRegenerate,
}: Props) {
  const [previewSuffix, setPreviewSuffix] = useState(true)
  const [previewPhoto, setPreviewPhoto] = useState(true)

  const [causeLabelOpen, setCauseLabelOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [openingLineOpen, setOpeningLineOpen] = useState(false)

  const [causeLabelDraft, setCauseLabelDraft] = useState("")
  const [nameDraft, setNameDraft] = useState("")
  const [contextDraft, setContextDraft] = useState("")
  const [photoDraft, setPhotoDraft] = useState<{
    file: File
    previewUrl: string
  } | null>(null)
  const [aboutDraft, setAboutDraft] = useState("")
  const [openingLineDraft, setOpeningLineDraft] = useState("")
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useFormContext<EventFormValues>()
  const values = useWatch({ control: form.control })

  const register = values.register ?? ""
  const category = values.category ?? null
  const grouping = values.grouping ?? "individual"
  const name = values.name ?? ""
  const context = values.context ?? ""
  const openingLine = values.openingLine ?? ""
  const about = values.about ?? ""
  const photo = values.photo as File | undefined
  const photoUrl = values.photoUrl
  const causeLabel = values.causeLabel ?? ""
  const subject = (values.subject ?? "someone") as "someone" | "cause"
  const selectedTopics = values.topics ?? []

  const firstSelectedTopicId = selectedTopics[0]?.topicId
  const firstTopicMeta = topics.find((t) => t.id === firstSelectedTopicId)
  const effReg = deriveRegister(category, grouping)

  const resolvedOpeningLine =
    openingLine ||
    getEventHeadline({ register, occasionType: null, name: "", subject }).prefix

  const resolvedPhotoUrl = photo
    ? URL.createObjectURL(photo)
    : (photoUrl ?? null)

  const aboutPlaceholder = !about
    ? (firstTopicMeta?.placeholders?.[effReg]?.about ?? "")
    : ""

  const openingLinePlaceholder = getEventHeadline({
    register,
    occasionType: null,
    name: "",
    subject,
  }).prefix

  const firstTopic = selectedTopics[0]
  const firstTopicPlaceholder = firstTopicMeta?.placeholders?.[effReg]
  const exampleName = firstTopic
    ? getExampleName(
        firstTopic.title ?? null,
        firstTopicPlaceholder?.pronouns,
        grouping,
        effReg
      )
    : ""

  function saveCauseLabel() {
    form.setValue("causeLabel", causeLabelDraft, { shouldValidate: true })
    setCauseLabelOpen(false)
  }
  function saveName() {
    form.setValue("name", nameDraft, { shouldValidate: true })
    setNameOpen(false)
  }
  function saveContext() {
    form.setValue("context", contextDraft, { shouldValidate: true })
    setContextOpen(false)
  }
  function saveOpeningLine() {
    form.setValue("openingLine", openingLineDraft, { shouldValidate: true })
    setOpeningLineOpen(false)
  }
  function saveAbout() {
    form.setValue("about", aboutDraft, { shouldValidate: true })
    setAboutOpen(false)
  }
  function savePhoto() {
    if (photoDraft) {
      form.setValue("photo", photoDraft.file)
      form.setValue("photoUrl", photoDraft.previewUrl)
    }
    setPhotoDraft(null)
    setPhotoOpen(false)
  }
  function cancelPhoto() {
    setPhotoDraft(null)
    setPhotoOpen(false)
  }

  return (
    <>
      <div className="mb-5 md:mb-10">
        <div className="flex items-start gap-4 md:gap-6">
          {/* Text column */}
          <div className="min-w-0 flex-1">
            {/* Opening line (eyebrow) */}
            <Button
              type="button"
              variant="ghost"
              className={cn(EDIT_BTN, "mb-2")}
              onClick={() => {
                setOpeningLineDraft(openingLine)
                setOpeningLineOpen(true)
              }}
              aria-label="Edit opening line"
            >
              <SectionEyebrow
                variant="muted"
                className="truncate wrap-break-word"
              >
                {resolvedOpeningLine}
              </SectionEyebrow>
              <EditBadge className="top-0 right-0" />
            </Button>

            {subject === "cause" ? (
              <Button
                type="button"
                variant="ghost"
                className={EDIT_BTN}
                onClick={() => {
                  setCauseLabelDraft(causeLabel)
                  setCauseLabelOpen(true)
                }}
                aria-label="Edit cause label"
              >
                <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
                  {causeLabel || (
                    <span className="text-muted-foreground/50">
                      What are you raising for?
                    </span>
                  )}
                </h1>
                <EditBadge className="top-0 right-0" />
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  className={EDIT_BTN}
                  onClick={() => {
                    setNameDraft(name)
                    setNameOpen(true)
                  }}
                  aria-label="Edit name"
                >
                  <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
                    {name || (
                      <span className="text-muted-foreground/50">
                        {exampleName || "Name or nickname"}
                      </span>
                    )}
                  </h1>
                  <EditBadge className="top-0 right-0" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className={cn(EDIT_BTN, "mt-2")}
                  onClick={() => {
                    setContextDraft(context)
                    setContextOpen(true)
                  }}
                  aria-label="Edit context"
                >
                  <p
                    className={cn(
                      "truncate text-xl font-normal whitespace-normal md:text-2xl",
                      context && previewSuffix
                        ? "text-[#534AB7]"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {previewSuffix && context
                      ? context
                      : contextExamples[effReg]}
                  </p>
                  <EditBadge className="top-0 right-0" />
                </Button>
              </>
            )}
          </div>

          {/* Photo — person events only */}
          {subject !== "cause" && (
            <Button
              type="button"
              variant="ghost"
              className="group relative h-auto shrink-0 rounded-full p-0"
              onClick={() => setPhotoOpen(true)}
              aria-label="Edit photo"
            >
              <ProtagonistAvatar
                name={name || exampleName || "Name"}
                photoUrl={previewPhoto ? resolvedPhotoUrl : null}
              />
              <EditBadge className="-top-1 -right-1" />
            </Button>
          )}
        </div>

        {/* About */}
        <Button
          type="button"
          variant="ghost"
          className={cn(EDIT_BTN, "mt-4")}
          onClick={() => {
            setAboutDraft(about)
            setAboutOpen(true)
          }}
          aria-label="Edit about"
        >
          {about ? (
            <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
              {about}
            </p>
          ) : isGenerating ? (
            <div
              className="animate-pulse space-y-1.5"
              aria-label="Generating suggestion…"
            >
              <div className="h-4 rounded-full bg-muted/60" />
              <div className="h-4 w-4/5 rounded-full bg-muted/60" />
            </div>
          ) : aboutPlaceholder ? (
            <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground/50">
              {aboutPlaceholder}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/40">+ about</p>
          )}
          <EditBadge className="top-0 right-0" />
        </Button>

        <hr className="mt-4 border-[#D3D1C7] md:mt-8" />
      </div>

      {/* ── Overlays ─────────────────────────────────────────── */}

      <ResponsiveOverlay
        open={causeLabelOpen}
        onOpenChange={(o) => !o && setCauseLabelOpen(false)}
        title="Cause"
        header={
          <Input
            autoFocus
            placeholder="e.g. dementia research, local foodbank"
            value={causeLabelDraft}
            maxLength={60}
            onChange={(e) => setCauseLabelDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveCauseLabel()}
            className="h-auto rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"
          />
        }
        footer={overlayFooter(saveCauseLabel, () => setCauseLabelOpen(false))}
      >
        <p className="text-sm text-muted-foreground">
          What you&apos;re raising for — shown throughout the event.
        </p>
        <CharCounter value={causeLabelDraft} max={60} />
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={nameOpen}
        onOpenChange={(o) => !o && setNameOpen(false)}
        title="Name"
        header={
          <Input
            autoFocus
            placeholder="Name or nickname"
            value={nameDraft}
            maxLength={40}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            className="h-auto rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"
          />
        }
        footer={overlayFooter(saveName, () => setNameOpen(false))}
      >
        <p className="text-sm text-muted-foreground">
          Shown throughout the event.
        </p>
        <CharCounter value={nameDraft} max={40} />
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={contextOpen}
        onOpenChange={(o) => !o && setContextOpen(false)}
        title="Context"
        header={
          <Input
            autoFocus
            placeholder="e.g. turning 40, class of 2024"
            value={contextDraft}
            maxLength={40}
            onChange={(e) => setContextDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveContext()}
            className="h-auto rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"
          />
        }
        footer={overlayFooter(saveContext, () => setContextOpen(false))}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Dates, years, or other context. Optional.
            </p>
            <CharCounter value={contextDraft} max={40} />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="previewSuffix"
              checked={previewSuffix}
              onCheckedChange={setPreviewSuffix}
            />
            <label
              htmlFor="previewSuffix"
              className="cursor-pointer text-sm text-muted-foreground"
            >
              Show in preview
            </label>
          </div>
        </div>
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={openingLineOpen}
        onOpenChange={(o) => !o && setOpeningLineOpen(false)}
        title="Opening line"
        header={
          <Input
            autoFocus
            placeholder={openingLinePlaceholder}
            value={openingLineDraft}
            maxLength={50}
            onChange={(e) => setOpeningLineDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveOpeningLine()}
            className="h-auto rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"
          />
        }
        footer={overlayFooter(saveOpeningLine, () => setOpeningLineOpen(false))}
      >
        <p className="text-sm text-muted-foreground">
          Replaces the default opening prefix. Optional.
        </p>
        <CharCounter value={openingLineDraft} max={50} />
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={aboutOpen}
        onOpenChange={(o) => !o && setAboutOpen(false)}
        title="About"
        header={
          <Textarea
            autoFocus
            placeholder={aboutPlaceholder || "A little about them…"}
            value={aboutDraft}
            maxLength={300}
            rows={3}
            onChange={(e) => setAboutDraft(e.target.value)}
            className="min-h-0 rounded-none border-0 px-0 py-0 text-base shadow-none focus-visible:ring-0"
          />
        }
        footer={overlayFooter(saveAbout, () => setAboutOpen(false))}
      >
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Tease the topic domain — save the specific favourite for the reveal.
          </p>
          <CharCounter value={aboutDraft} max={300} />
          {onRegenerate && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isGenerating}
              onClick={() => {
                setAboutOpen(false)
                onRegenerate()
              }}
              className="gap-1.5 text-xs text-muted-foreground"
            >
              <RefreshCw className="h-3 w-3" aria-hidden />
              Regenerate suggestion
            </Button>
          )}
        </div>
      </ResponsiveOverlay>

      <ResponsiveOverlay
        open={photoOpen}
        onOpenChange={(o) => {
          if (!o) cancelPhoto()
        }}
        title="Photo"
        footer={overlayFooter(savePhoto, cancelPhoto)}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <ProtagonistAvatar
              name={name || exampleName || "Name"}
              photoUrl={photoDraft?.previewUrl ?? resolvedPhotoUrl}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoDraft || resolvedPhotoUrl ? "Change photo" : "Add photo"}
          </Button>
          <div className="flex items-center gap-3">
            <Switch
              id="previewPhoto"
              checked={previewPhoto}
              onCheckedChange={setPreviewPhoto}
            />
            <label
              htmlFor="previewPhoto"
              className="cursor-pointer text-sm text-muted-foreground"
            >
              Show photo in preview
            </label>
          </div>
        </div>
      </ResponsiveOverlay>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          setCropSrc(URL.createObjectURL(file))
          e.target.value = ""
        }}
      />

      {cropSrc && (
        <PhotoCropModal
          open
          imageSrc={cropSrc}
          onClose={() => setCropSrc(null)}
          onSave={(blob, previewUrl) => {
            setPhotoDraft({
              file: new File([blob], "photo.jpg", { type: "image/jpeg" }),
              previewUrl,
            })
            setCropSrc(null)
          }}
        />
      )}
    </>
  )
}
