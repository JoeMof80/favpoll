"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Trash2, Upload } from "lucide-react"
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
}

export function HeroPhotoOverlay({ open, onOpenChange }: Props) {
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
              onClick={cancel}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
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
              name={name || "Name"}
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
