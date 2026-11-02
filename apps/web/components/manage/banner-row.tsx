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

// THE BANNER ROW (2026-10-30). PhotoRow's twin, for the wide image above
// the hero's text on a cause favpoll — a hall, a band, a room, the
// subjects the 80px square cannot hold. See
// references/hero-banner-2026-10-29.md.
//
// Three differences from the photo, all of them the point:
//
//   OPTIONAL. The square became mandatory on 2026-10-29 and one required
//   crop per favpoll is enough. A favpoll without a banner renders
//   exactly as it did before banners existed, so the empty state here is
//   an invitation, never a warning.
//
//   WIDE. Cropped at 3:1, roughly what a phone shows; wider columns crop
//   the sides further.
//
//   REMOVABLE. Clearing it is an ordinary thing to want, so the control
//   says so rather than hiding it in the overlay.

/** The crop's shape, the preview's, and the page's — all three agree on
 *  purpose. A fixed display HEIGHT re-framed the organiser's crop at
 *  every width and object-cover trimmed the rest (founder, 2026-10-30:
 *  "this is the image i uploaded after being cropped"). */
const ASPECT = 3

export function BannerRow({
  name,
  bannerUrl,
  readOnly = false,
  onSave,
}: {
  name: string
  bannerUrl: string | null
  readOnly?: boolean
  onSave: (url: string | null) => Promise<void>
}) {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState(bannerUrl)
  const [saving, setSaving] = useState(false)
  const [seen, setSeen] = useState(bannerUrl)
  if (bannerUrl !== seen) {
    setSeen(bannerUrl)
    setCurrent(bannerUrl)
  }

  // The overlay speaks in photo/photoUrl; this scoped form is where it
  // says so, and the row translates. Same trick PhotoRow uses.
  const form = useForm<FavpollFormValues>({
    defaultValues: { name, photoUrl: bannerUrl ?? undefined },
  })
  const lastRef = useRef<{ photo?: File; url?: string }>({
    url: bannerUrl ?? undefined,
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
            : "Couldn't save the banner — try again.",
          { style: TOAST_ERROR_STYLE }
        )
      } finally {
        setSaving(false)
      }
    })
    return () => sub.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form])

  async function remove() {
    setSaving(true)
    try {
      await onSave(null)
      setCurrent(null)
      form.setValue("photo", undefined)
      form.setValue("photoUrl", undefined)
      lastRef.current = { photo: undefined, url: undefined }
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Couldn't remove the banner.",
        { style: TOAST_ERROR_STYLE }
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingsRow
      label="Banner"
      description={
        readOnly
          ? undefined
          : saving
            ? "Saving…"
            : "Optional. A wide photo above the name — the hall, the band, the room."
      }
    >
      {/* FULL WIDTH, like the fields above it (founder, 2026-10-30). A
          192px thumbnail of a wide photograph shows nothing: at the
          column's own width and the crop's own 3:1 the preview IS the
          banner, so what is approved here is what the page draws. */}
      <div className="flex w-full min-w-0 flex-col gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={readOnly || saving}
          onClick={() => setOpen(true)}
          aria-label={current ? "Change banner" : "Add a banner"}
          className={cn(
            "h-auto w-full overflow-hidden rounded-lg p-0",
            !current &&
              "border-dashed border-border-strong text-muted-foreground"
          )}
          style={{ aspectRatio: ASPECT }}
        >
          {current ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="size-6" aria-hidden="true" />
          )}
        </Button>
        {current && !readOnly && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={saving}
            onClick={remove}
            className="h-auto self-start p-0 text-xs text-muted-foreground"
          >
            Remove
          </Button>
        )}
      </div>
      <FormProvider {...form}>
        <HeroPhotoOverlay
          open={open}
          onOpenChange={setOpen}
          aspect={ASPECT}
          label="Banner"
        />
      </FormProvider>
    </SettingsRow>
  )
}
