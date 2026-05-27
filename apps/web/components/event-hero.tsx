"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import {
  OCCASION_LABELS,
  DATE_LABEL_PLACEHOLDERS,
  type OccasionPlaceholders,
} from "@/lib/occasions"
import { getEventHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { uploadPersonPhoto } from "@/app/events/new/actions"
import type { Event, Protagonist } from "@favpoll/types"

type ViewProps = {
  mode?: "view"
  event: Event
  protagonist: Protagonist
  hideAvatar?: boolean
}

type EditProps = {
  mode: "edit"
  occasion: string
  openingLine: string
  protagonistName: string
  protagonistAbout: string
  dateLabel: string
  initialPhotoUrl?: string | null
  placeholders: Pick<OccasionPlaceholders, "name" | "about">
  onOpeningLineChange: (v: string) => void
  onProtagonistNameChange: (v: string) => void
  onProtagonistAboutChange: (v: string) => void
  onDateLabelChange: (v: string) => void
  onPhotoUrlChange: (url: string) => void
}

type Props = ViewProps | EditProps

export function EventHero(props: Props) {
  const isEdit = props.mode === "edit"

  const [photoPreview, setPhotoPreview] = useState<string | null>(
    isEdit ? (props.initialPhotoUrl ?? null) : null
  )
  const [photoUploading, setPhotoUploading] = useState(false)

  const occasion = isEdit ? props.occasion : props.event.occasion
  const label = OCCASION_LABELS[occasion] ?? "A tribute to"

  const headline = isEdit
    ? null
    : getEventHeadline({
        occasion: props.event.occasion,
        occasionLabel: props.event.opening_line,
        name: props.protagonist.name,
        dateLabel: props.protagonist.context,
      })

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!isEdit) return
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append("photo", file)
      const url = await uploadPersonPhoto(fd)
      props.onPhotoUrlChange(url)
    } catch {
      /* ignore */
    } finally {
      setPhotoUploading(false)
    }
  }

  // Derived view-mode values
  const protagonist = isEdit ? null : props.protagonist

  const editInitials = isEdit
    ? props.protagonistName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : ""

  return (
    <div className="mb-10">
      <div className="flex items-start gap-6">
        {/* Text */}
        <div className="min-w-0 flex-1">
          {/* Occasion label */}
          {isEdit ? (
            <div className="relative mb-2">
              <input
                type="text"
                value={props.openingLine}
                onChange={(e) => props.onOpeningLineChange(e.target.value)}
                placeholder={label || "In memory of"}
                className="peer w-full appearance-none bg-transparent py-0 pr-5 text-xs font-medium tracking-widest text-muted-foreground uppercase outline-none placeholder:text-muted-foreground/30"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-dotted border-border transition-colors peer-focus:border-primary/40" />
              <Pencil
                className="pointer-events-none absolute top-1/2 right-0 h-3 w-3 -translate-y-1/2 text-muted-foreground/25"
                aria-hidden
              />
            </div>
          ) : (
            <SectionEyebrow
              variant="muted"
              className="mb-2 truncate wrap-break-word"
            >
              {headline?.prefix ?? label}
            </SectionEyebrow>
          )}

          {/* Name */}
          {isEdit ? (
            <div className="relative">
              <input
                type="text"
                value={props.protagonistName}
                onChange={(e) => props.onProtagonistNameChange(e.target.value)}
                placeholder={props.placeholders.name}
                className="peer w-full appearance-none bg-transparent py-0 pr-6 text-4xl leading-tight font-medium tracking-tight text-foreground outline-none placeholder:text-muted-foreground/40 sm:text-5xl"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-dotted border-border transition-colors peer-focus:border-primary/40" />
              <Pencil
                className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/25"
                aria-hidden
              />
            </div>
          ) : (
            <h1 className="line-clamp-2 text-4xl leading-tight font-medium tracking-tight wrap-break-word text-[#2C2C2A] sm:text-5xl">
              {protagonist?.name}
            </h1>
          )}

          {/* Dates — edit mode: free text; view mode: rendered from context */}
          {isEdit ? (
            <div className="relative mt-2">
              <input
                type="text"
                value={props.dateLabel}
                onChange={(e) => props.onDateLabelChange(e.target.value)}
                placeholder={
                  DATE_LABEL_PLACEHOLDERS[occasion] ?? "Dates (optional)"
                }
                className="peer w-full appearance-none bg-transparent py-0 pr-5 text-2xl font-normal text-primary outline-none placeholder:text-muted-foreground/40"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-dotted border-border transition-colors peer-focus:border-primary/40" />
              <Pencil
                className="pointer-events-none absolute top-1/2 right-0 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/25"
                aria-hidden
              />
            </div>
          ) : headline?.suffix ? (
            <p className="mt-2 truncate text-2xl font-normal wrap-break-word text-[#534AB7]">
              {headline.suffix}
            </p>
          ) : null}

          {/* Bio (edit mode) / Description (view mode) */}
          {isEdit ? (
            <div className="relative mt-4 w-full">
              {/* Mirror p drives the height — textarea is absolutely positioned over it */}
              <p
                aria-hidden="true"
                className="invisible min-h-13 w-full text-base leading-relaxed wrap-break-word whitespace-pre-wrap text-muted-foreground"
              >
                {(props as EditProps).protagonistAbout || "\u00A0"}
              </p>
              <textarea
                value={(props as EditProps).protagonistAbout}
                onChange={(e) => props.onProtagonistAboutChange(e.target.value)}
                placeholder={props.placeholders.about}
                className="peer absolute inset-0 h-full w-full resize-none appearance-none bg-transparent py-0 pr-5 text-base leading-relaxed text-muted-foreground outline-none placeholder:text-muted-foreground/40"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 border-b-2 border-dotted border-border transition-colors peer-focus:border-primary/40" />
              <Pencil
                className="pointer-events-none absolute top-2 right-0 h-3.5 w-3.5 text-muted-foreground/25"
                aria-hidden
              />
            </div>
          ) : protagonist?.about ? (
            <p className="mt-4 line-clamp-4 text-base leading-relaxed wrap-break-word text-[#5F5E5A]">
              {protagonist.about}
            </p>
          ) : null}
        </div>

        {/* Photo */}
        {isEdit ? (
          <label
            className="group shrink-0 cursor-pointer"
            aria-label="Upload photo"
          >
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-dashed border-border transition-colors group-hover:border-primary">
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoPreview}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <svg
                    className="absolute inset-0 h-full w-full text-border"
                    aria-hidden="true"
                  >
                    <defs>
                      <pattern
                        id="hatch-canvas"
                        patternUnits="userSpaceOnUse"
                        width="8"
                        height="8"
                        patternTransform="rotate(45)"
                      >
                        <line
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="8"
                          stroke="currentColor"
                          strokeWidth="1"
                        />
                      </pattern>
                    </defs>
                    <rect
                      width="100%"
                      height="100%"
                      fill="url(#hatch-canvas)"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
                    {photoUploading ? "…" : editInitials || "Photo"}
                  </span>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoChange}
              disabled={photoUploading}
            />
          </label>
        ) : !props.hideAvatar ? (
          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-[#D3D1C7]">
            {protagonist?.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={protagonist.photo_url}
                alt={protagonist.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <svg
                  className="absolute inset-0 h-full w-full text-[#D3D1C7]"
                  aria-hidden="true"
                >
                  <defs>
                    <pattern
                      id="hatch"
                      patternUnits="userSpaceOnUse"
                      width="8"
                      height="8"
                      patternTransform="rotate(45)"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="8"
                        stroke="currentColor"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#hatch)" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-medium text-[#888780]">
                  {protagonist?.name
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()}
                </span>
              </>
            )}
          </div>
        ) : null}
      </div>

      <hr className="mt-8 border-[#D3D1C7]" />
    </div>
  )
}
