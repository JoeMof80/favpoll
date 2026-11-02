"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { ImagePlus, Trash2, Upload } from "lucide-react"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group"
import { FIELD_OVERLAY_PROPS, INPUT_GROUP_CLS } from "./edit-helpers"
import { ProtagonistAvatar } from "@/components/favpoll-hero-avatar"
import { Button } from "@/components/ui/button"
import type { FavpollFormValues } from "./schema"

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
  open: boolean
  onOpenChange: (open: boolean) => void
  /** THE CROP'S SHAPE. Square by default, which is every caller but one:
   *  the hero's photo hangs off the band as an 80px square. The BANNER
   *  (2026-10-30) is the exception — a wide image above the hero's text,
   *  cropped at 3:1 so the organiser sees roughly what a phone will show;
   *  wider columns crop the sides further via object-cover. */
  aspect?: number
  /** A FIXED crop box, in pixels. Normally left off: react-easy-crop
   *  fits the IMAGE to the container when given an explicit size and
   *  floats the box on top, so minimum zoom can only ever reach the
   *  middle of the picture (founder, 2026-10-30: "scaling down images
   *  that are too large", first on the banner and then on the square,
   *  whose 132px box — the avatar's size — cut the edges off a square
   *  logo). With no size the box fills the container and the image
   *  COVERS it, so zoom 1 is the whole picture. The box's size on screen
   *  never changes what is saved: the crop is read in the image's own
   *  pixels. */
  cropSize?: { width: number; height: number }
  /** What this overlay is editing, in the organiser's words. "Photo"
   *  everywhere but the banner, which borrows the same machinery and
   *  would otherwise call itself Photo and preview itself square
   *  (founder, 2026-10-30). */
  label?: string
}

export function HeroPhotoOverlay({
  open,
  onOpenChange,
  aspect = 1,
  cropSize,
  label = "Photo",
}: Props) {
  const lower = label.toLowerCase()
  const form = useFormContext<FavpollFormValues>()
  const name = useWatch({ control: form.control, name: "name" }) ?? ""
  const photo = useWatch({ control: form.control, name: "photo" }) as
    | File
    | undefined
  const photoUrl = useWatch({ control: form.control, name: "photoUrl" })

  const resolvedPhotoUrl = photo
    ? URL.createObjectURL(photo)
    : (photoUrl ?? null)
  const resolvedPhotoUrlRef = useRef(resolvedPhotoUrl)
  resolvedPhotoUrlRef.current = resolvedPhotoUrl

  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [savingCrop, setSavingCrop] = useState(false)
  const [originalFilename, setOriginalFilename] = useState("")
  const [dialogPhotoUrl, setDialogPhotoUrl] = useState<string | null>(null)
  const [photoDraft, setPhotoDraft] = useState<{
    file: File
    previewUrl: string
  } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  useEffect(() => {
    if (open) setDialogPhotoUrl(resolvedPhotoUrlRef.current ?? "")
  }, [open])

  function cancel() {
    if (cropSrc) URL.revokeObjectURL(cropSrc)
    setCropSrc(null)
    setPhotoDraft(null)
    setOriginalFilename("")
    setDialogPhotoUrl(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPixels(null)
    onOpenChange(false)
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

  async function save() {
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
      onOpenChange(false)
    }
  }

  return (
    <>
      <ResponsiveOverlay
        open={open}
        onOpenChange={(o) => {
          if (!o) cancel()
        }}
        title={label}
        {...FIELD_OVERLAY_PROPS}
        dialogContentClassName="flex-1 overflow-y-auto px-5 py-4"
        header={
          <InputGroup className={INPUT_GROUP_CLS}>
            <InputGroupAddon align="block-start" className="px-5 pt-4 pb-0">
              <InputGroupText>{label}</InputGroupText>
            </InputGroupAddon>
            {/* Status only — picking moved onto the image itself (founder,
                2026-09-01: "click the avatar or image to select an image
                rather than the [upload] icon"). The header keeps the
                filename and the remove control. */}
            <div className="flex w-full items-center gap-2 px-5 py-3">
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                {originalFilename ||
                  (dialogPhotoUrl ? `Current ${lower}` : `No ${lower} yet`)}
              </span>
              {(originalFilename || dialogPhotoUrl) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${lower}`}
                  onClick={clearPhoto}
                >
                  <Trash2 className="h-4 w-4" />
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
              className="h-11 flex-1 md:text-base"
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-11 flex-1 md:text-base"
              disabled={savingCrop || (cropSrc ? !croppedAreaPixels : false)}
              onClick={save}
            >
              {savingCrop ? "Cropping…" : cropSrc ? "Crop" : "Save"}
            </Button>
          </div>
        }
      >
        {cropSrc ? (
          <div className="space-y-4">
            <div
              className={
                aspect === 1
                  ? "relative h-40 w-full overflow-hidden rounded-lg"
                  : "relative w-full overflow-hidden rounded-lg"
              }
              /* A wide crop gets a surface its own shape, so the box
                 fills it instead of floating in dead space. */
              style={aspect === 1 ? undefined : { aspectRatio: aspect }}
            >
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                cropShape="rect"
                showGrid={false}
                cropSize={cropSize}
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
            {/* Re-pick lives here while cropping — the image above is the
                cropper's drag surface, so it cannot double as the picker. */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload data-icon="inline-start" aria-hidden="true" />
              Choose a different photo
            </Button>
          </div>
        ) : (
          /* The avatar IS the picker — tap the photo (or the empty slot)
             to choose an image; the caption carries the affordance for
             anyone who doesn't try. */
          <div className="flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              aria-label={
                (photoDraft?.previewUrl ?? dialogPhotoUrl)
                  ? `Choose a different ${lower}`
                  : `Choose a ${lower}`
              }
              className={
                aspect === 1 ? "h-auto rounded-xl p-0" : "h-auto w-full p-0"
              }
            >
              {aspect === 1 ? (
                <ProtagonistAvatar
                  name={name || "Name"}
                  photoUrl={photoDraft?.previewUrl ?? dialogPhotoUrl ?? null}
                />
              ) : (photoDraft?.previewUrl ?? dialogPhotoUrl) ? (
                /* A WIDE PREVIEW FOR A WIDE IMAGE: the square avatar
                   showed the banner as a crop of itself, which is the
                   one thing this overlay must not do. */
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoDraft?.previewUrl ?? dialogPhotoUrl ?? ""}
                  alt=""
                  className="w-full rounded-lg object-cover"
                  style={{ aspectRatio: aspect }}
                />
              ) : (
                <div
                  className="flex w-full items-center justify-center rounded-lg border border-dashed border-border-strong text-muted-foreground"
                  style={{ aspectRatio: aspect }}
                >
                  <ImagePlus className="size-6" aria-hidden="true" />
                </div>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Tap the {lower} to choose an image
            </p>
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
