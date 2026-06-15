"use client"

import { useCallback, useRef, useState } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { RefreshCw, Trash2, Upload } from "lucide-react"
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
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import {
  EDIT_BTN,
  FIELD_OVERLAY_PROPS,
  INPUT_GROUP_CLS,
  EditBadge,
  CharCounter,
  overlayFooter,
} from "./edit-helpers"
import { TooltipIconButton } from "@/components/ui/tooltip-icon-button"
import { cn } from "@/lib/utils"
import type { TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"

async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })
  const canvas = document.createElement("canvas")
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error("Canvas toBlob failed")),
      "image/jpeg",
      0.9
    )
  })
}

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
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [savingCrop, setSavingCrop] = useState(false)
  const [originalFilename, setOriginalFilename] = useState("")
  // null = dialog closed; "" = no photo / photo deleted; string = active photo URL
  const [dialogPhotoUrl, setDialogPhotoUrl] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

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
  async function savePhoto() {
    if (cropSrc && croppedAreaPixels) {
      setSavingCrop(true)
      try {
        const blob = await getCroppedBlob(cropSrc, croppedAreaPixels)
        const previewUrl = URL.createObjectURL(blob)
        setPhotoDraft({
          file: new File([blob], originalFilename || "photo.jpg", {
            type: "image/jpeg",
          }),
          previewUrl,
        })
        setDialogPhotoUrl(previewUrl)
        URL.revokeObjectURL(cropSrc)
        setCropSrc(null)
      } finally {
        setSavingCrop(false)
      }
    } else {
      if (photoDraft) {
        form.setValue("photo", photoDraft.file)
        form.setValue("photoUrl", photoDraft.previewUrl)
      } else if (dialogPhotoUrl === "") {
        form.setValue("photo", undefined)
        form.setValue("photoUrl", undefined)
      }
      setPhotoDraft(null)
      setOriginalFilename("")
      setDialogPhotoUrl(null)
      setPhotoOpen(false)
    }
  }
  function cancelPhoto() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPhotoDraft(null)
    setOriginalFilename("")
    setDialogPhotoUrl(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    setPhotoOpen(false)
  }
  function clearPhoto() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPhotoDraft(null)
    setOriginalFilename("")
    setDialogPhotoUrl("")
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
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
              className={EDIT_BTN}
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
              <EditBadge />
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
                <EditBadge />
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
                  <EditBadge />
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
                      context ? "text-[#534AB7]" : "text-muted-foreground/40"
                    )}
                  >
                    {context || contextExamples[effReg]}
                  </p>
                  <EditBadge />
                </Button>
              </>
            )}
          </div>

          {/* Photo — person events only */}
          {subject !== "cause" && (
            <Button
              type="button"
              variant="ghost"
              className="group relative h-auto shrink-0 rounded-xl border-dotted border-primary/20 p-0 hover:border-solid hover:border-primary/60 hover:bg-transparent focus-visible:border-solid focus-visible:border-primary/60 focus-visible:bg-transparent"
              onClick={() => {
                setDialogPhotoUrl(resolvedPhotoUrl ?? "")
                setPhotoOpen(true)
              }}
              aria-label="Edit photo"
            >
              <ProtagonistAvatar
                name={name || exampleName || "Name"}
                photoUrl={resolvedPhotoUrl}
                className="border-0"
              />
              <EditBadge className="right-0 bottom-0" />
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
          <EditBadge />
        </Button>

        <hr className="mt-4 border-[#D3D1C7] md:mt-8" />
      </div>

      {/* ── Overlays ─────────────────────────────────────────── */}

      <ResponsiveOverlay
        open={causeLabelOpen}
        onOpenChange={(o) => !o && setCauseLabelOpen(false)}
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
              value={causeLabelDraft}
              maxLength={60}
              onChange={(e) => setCauseLabelDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveCauseLabel()}
              className="px-5 pb-4 text-base md:text-base"
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
            >
              <span>
                What you&apos;re raising for — shown throughout the event.
              </span>
              <CharCounter value={causeLabelDraft} max={60} />
            </div>
          </InputGroup>
        }
        footer={overlayFooter(saveCauseLabel, () => setCauseLabelOpen(false))}
      />

      <ResponsiveOverlay
        open={nameOpen}
        onOpenChange={(o) => !o && setNameOpen(false)}
        title="Name"
        {...FIELD_OVERLAY_PROPS}
        header={
          <InputGroup className={INPUT_GROUP_CLS}>
            <InputGroupAddon align="block-start" className="px-5">
              <InputGroupText>Name</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              placeholder="Name or nickname"
              value={nameDraft}
              maxLength={40}
              onChange={(e) => setNameDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveName()}
              className="px-5 pb-4 text-base md:text-base"
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
            >
              <span>Shown throughout the event.</span>
              <CharCounter value={nameDraft} max={40} />
            </div>
          </InputGroup>
        }
        footer={overlayFooter(saveName, () => setNameOpen(false))}
      />

      <ResponsiveOverlay
        open={contextOpen}
        onOpenChange={(o) => !o && setContextOpen(false)}
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
              value={contextDraft}
              maxLength={40}
              onChange={(e) => setContextDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveContext()}
              className="px-5 pb-4 text-base md:text-base"
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
            >
              <span>Dates, years, or other context. Optional.</span>
              <CharCounter value={contextDraft} max={40} />
            </div>
          </InputGroup>
        }
        footer={overlayFooter(saveContext, () => setContextOpen(false))}
      />

      <ResponsiveOverlay
        open={openingLineOpen}
        onOpenChange={(o) => !o && setOpeningLineOpen(false)}
        title="Opening line"
        {...FIELD_OVERLAY_PROPS}
        header={
          <InputGroup className={INPUT_GROUP_CLS}>
            <InputGroupAddon align="block-start" className="px-5">
              <InputGroupText>Opening line</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              autoFocus
              placeholder={openingLinePlaceholder}
              value={openingLineDraft}
              maxLength={50}
              onChange={(e) => setOpeningLineDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveOpeningLine()}
              className="px-5 pb-4 text-base md:text-base"
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
            >
              <span>Replaces the default opening prefix. Optional.</span>
              <CharCounter value={openingLineDraft} max={50} />
            </div>
          </InputGroup>
        }
        footer={overlayFooter(saveOpeningLine, () => setOpeningLineOpen(false))}
      />

      <ResponsiveOverlay
        open={aboutOpen}
        onOpenChange={(o) => !o && setAboutOpen(false)}
        title="About"
        {...FIELD_OVERLAY_PROPS}
        header={
          <InputGroup className={INPUT_GROUP_CLS}>
            <InputGroupAddon
              align="block-start"
              className="justify-between px-5"
            >
              <InputGroupText>About</InputGroupText>
              {onRegenerate && (
                <InputGroupButton
                  size="icon-xs"
                  disabled={isGenerating}
                  aria-label="Regenerate suggestion"
                  onClick={() => {
                    setAboutOpen(false)
                    onRegenerate()
                  }}
                >
                  <RefreshCw />
                </InputGroupButton>
              )}
            </InputGroupAddon>
            <InputGroupTextarea
              autoFocus
              placeholder={aboutPlaceholder || "A little about them…"}
              value={aboutDraft}
              maxLength={300}
              rows={3}
              onChange={(e) => setAboutDraft(e.target.value)}
              className="px-5 pt-2 pb-4 text-base md:text-base"
            />
            <div
              data-align="block-end"
              className="order-last flex w-full items-center justify-between px-5 py-1.5 text-xs text-muted-foreground"
            >
              <span>
                Tease the topic domain — save the specific favourite for the
                reveal.
              </span>
              <CharCounter value={aboutDraft} max={300} />
            </div>
          </InputGroup>
        }
        footer={overlayFooter(saveAbout, () => setAboutOpen(false))}
      />

      <ResponsiveOverlay
        open={photoOpen}
        onOpenChange={(o) => {
          if (!o) cancelPhoto()
        }}
        title="Photo"
        {...FIELD_OVERLAY_PROPS}
        dialogContentClassName="flex-1 overflow-y-auto px-5 py-4"
        header={
          <InputGroup className={INPUT_GROUP_CLS}>
            <InputGroupAddon align="block-start" className="px-5 pt-4 pb-0">
              <InputGroupText>Photo</InputGroupText>
            </InputGroupAddon>
            <div className="flex w-full items-center gap-2 px-5 py-3">
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 truncate text-left text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <span className="shrink-0 text-foreground">Choose file</span>
                <span className="truncate text-muted-foreground">
                  {originalFilename ||
                    (dialogPhotoUrl ? "Current photo" : "No file chosen")}
                </span>
              </button>
              {originalFilename || dialogPhotoUrl ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Remove photo"
                  onClick={clearPhoto}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Upload photo"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                </Button>
              )}
            </div>
          </InputGroup>
        }
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={cancelPhoto}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={savingCrop || (cropSrc ? !croppedAreaPixels : false)}
              onClick={savePhoto}
            >
              {savingCrop ? "Cropping…" : cropSrc ? "Crop" : "Save"}
            </Button>
          </div>
        }
      >
        {cropSrc ? (
          <div className="space-y-4">
            <div className="relative h-40 w-full overflow-hidden rounded-lg">
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid={false}
                cropSize={{ width: 132, height: 132 }}
                style={{ cropAreaStyle: { borderRadius: "12px" } }}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground select-none">
                –
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1"
                aria-label="Zoom"
              />
              <span className="text-xs text-muted-foreground select-none">
                +
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <ProtagonistAvatar
              name={name || exampleName || "Name"}
              photoUrl={photoDraft?.previewUrl ?? dialogPhotoUrl ?? null}
            />
          </div>
        )}
      </ResponsiveOverlay>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          setOriginalFilename(file.name)
          if (cropSrc) URL.revokeObjectURL(cropSrc)
          setCropSrc(URL.createObjectURL(file))
          setCrop({ x: 0, y: 0 })
          setZoom(1)
          setCroppedAreaPixels(null)
          e.target.value = ""
        }}
      />
    </>
  )
}
