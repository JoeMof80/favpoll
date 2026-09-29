"use client"

import { useEffect, useRef, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { HeroPhotoOverlay } from "@/components/favpoll-form/hero-photo-overlay"
import type { FavpollFormValues } from "@/components/favpoll-form/schema"
import { SettingsRow } from "@/components/manage/settings-rows"
import { uploadPersonPhoto } from "@/app/favpolls/new/actions"
import { TOAST_ERROR_STYLE } from "@/lib/toast-styles"
import { cn } from "@/lib/utils"

// THE PHOTO ROW (step 3, 2026-09-29): the wizard's crop overlay, in
// place. The overlay writes a File (or clears) into a scoped form; this
// row watches it, uploads the crop, and saves the URL — one act from
// the organiser's side, same as the wizard's, but it lands now.

export function PhotoRow({
  name,
  photoUrl,
  readOnly = false,
  onSave,
}: {
  name: string
  photoUrl: string | null
  readOnly?: boolean
  onSave: (url: string | null) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(photoUrl)
  const [saving, setSaving] = useState(false)
  const [seen, setSeen] = useState(photoUrl)
  if (photoUrl !== seen) {
    setSeen(photoUrl)
    setCurrent(photoUrl)
  }
  const form = useForm<FavpollFormValues>({
    defaultValues: { name, photoUrl: photoUrl ?? undefined },
  })
  // The overlay's save fires the watch once with the new File (or with
  // both fields cleared); handle exactly that transition.
  const lastRef = useRef<{ photo?: File; url?: string }>({
    url: photoUrl ?? undefined,
  })
  useEffect(() => {
    const sub = form.watch(async (v) => {
      const photo = v.photo as File | undefined
      const url = v.photoUrl ?? undefined
      if (photo === lastRef.current.photo && url === lastRef.current.url) return
      lastRef.current = { photo, url }
      setSaving(true)
      try {
        if (photo) {
          const fd = new FormData()
          fd.append("photo", photo)
          const uploaded = await uploadPersonPhoto(fd)
          await onSave(uploaded)
          setCurrent(uploaded)
          form.setValue("photoUrl", uploaded)
          lastRef.current = { photo, url: uploaded }
        } else if (!url) {
          await onSave(null)
          setCurrent(null)
        }
      } catch (e) {
        toast.error(
          e instanceof Error
            ? e.message
            : "Couldn't save the photo — try again.",
          { style: TOAST_ERROR_STYLE }
        )
      } finally {
        setSaving(false)
      }
    })
    return () => sub.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  return (
    <SettingsRow
      label="Photo"
      description={
        readOnly
          ? undefined
          : saving
            ? "Saving…"
            : "Square works best; you can crop it here."
      }
    >
      {/* THE AVATAR IS THE BUTTON (the wizard's own idiom, 2026-09-01):
          tap the photo — or the empty slot — to open the crop overlay. */}
      <Button
        type="button"
        variant="outline"
        disabled={readOnly || saving}
        onClick={() => setOpen(true)}
        aria-label={current ? "Change photo" : "Add a photo"}
        className={cn(
          "h-20 w-20 shrink-0 overflow-hidden rounded-xl p-0",
          !current && "border-dashed border-border-strong text-muted-foreground"
        )}
      >
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImagePlus className="size-6" aria-hidden="true" />
        )}
      </Button>
      <FormProvider {...form}>
        <HeroPhotoOverlay open={open} onOpenChange={setOpen} />
      </FormProvider>
    </SettingsRow>
  )
}
