"use client"

import { useRef, useState } from "react"
import { useWatch, useFormContext } from "react-hook-form"
import { Pencil } from "lucide-react"
import {
  DATE_LABEL_PLACEHOLDERS,
  CONTEXT_PLACEHOLDER,
  effectiveRegister,
} from "@/lib/registers"
import { getEventHeadline } from "@/lib/display"
import { SectionEyebrow } from "@/components/ui/section-eyebrow"
import { ProtagonistAvatar } from "@/components/event-hero-avatar"
import { PollTitle } from "@/components/favpoll-card/poll-title"
import { PollReveal } from "@/components/favpoll-card/poll-reveal"
import { PledgePanel } from "@/components/pledge-panel"
import { PollResults } from "@/components/favpoll-card/poll-results"
import type { PollResultItem } from "@/components/favpoll-card/types"
import { Countdown } from "@/components/countdown"
import { CharityBanner } from "@/components/charity-banner"
import { PledgeCard } from "@/components/pledge-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { DateTimePicker } from "./date-time-picker"
import { PhotoCropModal } from "./photo-crop-modal"
import { cn } from "@/lib/utils"
import type { Charity, TopicWithMeta, TopicItem } from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { toast } from "sonner"
import { OnboardingPanel } from "./onboarding-panel"

type Props = {
  charities: Charity[]
  topics: TopicWithMeta[]
  showReveal: boolean
  onToggleReveal: () => void
  isFirstTime?: boolean
}

// Placeholder charities shown before the user selects any
const PLACEHOLDER_CHARITIES: Charity[] = [
  { id: "ch-1", name: "Chosen charity", is_active: true },
] as unknown as Charity[]

function CountdownPlaceholder() {
  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <p className="mb-2 text-xs text-muted-foreground">Poll closes in</p>
      <div className="flex items-end gap-3">
        {(["days", "hrs", "min", "sec"] as const).map((label) => (
          <div key={label} className="text-center">
            <p className="text-2xl leading-none font-medium text-foreground/25 tabular-nums">
              00
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Shared edit affordance wrapper
const EDIT_BTN =
  "group relative block h-auto w-full whitespace-normal rounded-sm p-0 text-left border-b-2 border-dotted border-transparent hover:border-primary/40 focus-visible:border-primary/40"

const PENCIL_ICON =
  "absolute top-0 right-0 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"

function CharCounter({ value, max }: { value: string; max: number }) {
  const remaining = max - value.length
  return (
    <p
      className={cn(
        "mt-1 text-right text-xs",
        remaining < 10
          ? "text-destructive"
          : remaining < 20
            ? "text-amber-500"
            : "text-muted-foreground"
      )}
    >
      {remaining}
    </p>
  )
}

export function PreviewPanel({
  charities,
  topics,
  showReveal,
  onToggleReveal,
  isFirstTime = false,
}: Props) {
  // Local preview toggles
  const [previewSuffix, setPreviewSuffix] = useState(true)
  const [previewPhoto, setPreviewPhoto] = useState(true)

  // Pledge amount for the dimmed preview card
  const [pledgeAmount, setPledgeAmount] = useState("")

  // Onboarding panel state
  const [showOnboarding, setShowOnboarding] = useState(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("favpoll_show_onboarding") === "1"
  )

  // Overlay open states
  const [nameOpen, setNameOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [photoOpen, setPhotoOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [openingLineOpen, setOpeningLineOpen] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)
  const [closesAtOpen, setClosesAtOpen] = useState(false)

  // Draft states — initialised on overlay open, discarded on cancel
  const [nameDraft, setNameDraft] = useState("")
  const [contextDraft, setContextDraft] = useState("")
  const [photoDraft, setPhotoDraft] = useState<{
    file: File
    previewUrl: string
  } | null>(null)
  const [aboutDraft, setAboutDraft] = useState("")
  const [openingLineDraft, setOpeningLineDraft] = useState("")
  const [revealDraft, setRevealDraft] = useState("")
  const [closesAtDraft, setClosesAtDraft] = useState<Date | undefined>(
    undefined
  )
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useFormContext<EventFormValues>()
  const values = useWatch({ control: form.control })

  const register = values.register ?? ""
  const occasionType = (values.occasionType ?? "") || null
  const isPlural = values.isPlural ?? false
  const name = values.name ?? ""
  const context = values.context ?? ""
  const openingLine = values.openingLine ?? ""
  const about = values.about ?? ""
  const reveal = values.reveal ?? ""
  const photo = values.photo as File | undefined
  const photoUrl = values.photoUrl
  const closesAt = values.closesAt
  const charityIds = values.charities ?? []
  const selectedTopics = values.topics ?? []

  const firstSelectedTopicId = selectedTopics[0]?.topicId
  const firstTopicMeta = topics.find((t) => t.id === firstSelectedTopicId)

  function handleHowItWorks() {
    localStorage.setItem("favpoll_show_onboarding", "1")
    setShowOnboarding(true)
  }

  if (!register) {
    if (isFirstTime || showOnboarding) {
      return <OnboardingPanel onHowItWorks={handleHowItWorks} />
    }
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">
          Select an occasion to begin.
        </p>
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[13px] text-muted-foreground hover:text-foreground"
          onClick={handleHowItWorks}
        >
          How favpoll works →
        </Button>
      </div>
    )
  }

  const datePlaceholder = occasionType
    ? (DATE_LABEL_PLACEHOLDERS[occasionType] ?? "")
    : ""
  const resolvedOpeningLine =
    openingLine || getEventHeadline({ register, occasionType, name: "" }).prefix

  const resolvedPhotoUrl = photo
    ? URL.createObjectURL(photo)
    : (photoUrl ?? null)

  const effReg = effectiveRegister(occasionType, isPlural)

  // Grey placeholder text for unfilled about — keyed by effective register + topic
  const aboutPlaceholder = !about
    ? (firstTopicMeta?.placeholders?.[effReg]?.about ?? "")
    : ""

  // Grey placeholder text for unfilled reveal — keyed by effective register + topic
  const revealPlaceholder = !reveal
    ? (firstTopicMeta?.placeholders?.[effReg]?.reveal ?? "")
    : ""

  // Computed opening line placeholder for the overlay
  const openingLinePlaceholder = getEventHeadline({
    register,
    occasionType,
    name: "",
  }).prefix

  const firstTopic = selectedTopics[0]
  const firstTopicCustomLabels = firstTopic?.customLabels ?? []

  const isInfinite = firstTopic
    ? firstTopic.isCustom
      ? true
      : !(firstTopicMeta?.is_finite ?? true)
    : false

  const topicItems: TopicItem[] = firstTopic
    ? [
        ...((firstTopic.items ?? []) as { id: string; label: string }[]).map(
          (item) =>
            ({
              id: item.id,
              label: item.label,
              topic_id: firstTopic.topicId ?? "",
              all_time_pledged: 0,
              all_time_count: 0,
              is_canonical: true,
              is_active: true,
              created_at: "",
            }) as unknown as TopicItem
        ),
        ...firstTopicCustomLabels.map(
          (label, i) =>
            ({
              id: `custom-preview-${i}`,
              label,
              topic_id: firstTopic.topicId ?? "",
              all_time_pledged: 0,
              all_time_count: 0,
              is_canonical: false,
              is_active: true,
              created_at: "",
            }) as unknown as TopicItem
        ),
      ]
    : []

  const pollResults: PollResultItem[] = topicItems.map((item) => ({
    label: item.label,
    amount: "£0",
    widthPercent: 0,
  }))

  const selectedCharities = charities.filter((c) => charityIds.includes(c.id))
  const displayCharities =
    selectedCharities.length > 0 ? selectedCharities : PLACEHOLDER_CHARITIES

  const hasTopicSelected = !!firstTopic
  const protagonistFirstName = name.split(" ")[0] || ""
  const topicTitle = firstTopic?.title ?? "Colour"
  const revealValue = showReveal ? reveal || null : null

  // Save handlers
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
  function saveReveal() {
    form.setValue("reveal", revealDraft, { shouldValidate: true })
    setRevealOpen(false)
  }
  function saveClosesAt() {
    if (closesAtDraft) {
      form.setValue("closesAt", closesAtDraft, { shouldValidate: true })
    }
    setClosesAtOpen(false)
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

  const overlayFooter = (onSave: () => void, onCancel: () => void) => (
    <div className="flex gap-2">
      <Button type="button" className="flex-1" onClick={onSave}>
        Save
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="flex-1"
        onClick={onCancel}
      >
        Cancel
      </Button>
    </div>
  )

  return (
    <div className="mx-auto min-h-full max-w-5xl bg-background p-16 drop-shadow-lg">
      <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
        {/* Left — hero + poll */}
        <div>
          {/* Inlined EventHero with per-field edit affordances */}
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
                  <Pencil className={PENCIL_ICON} aria-hidden />
                </Button>

                {/* Name */}
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
                        Name or nickname
                      </span>
                    )}
                  </h1>
                  <Pencil className={PENCIL_ICON} aria-hidden />
                </Button>

                {/* Context/suffix — always visible with grey placeholder when empty */}
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
                      "truncate text-xl font-normal md:text-2xl",
                      context && previewSuffix
                        ? "text-[#534AB7]"
                        : "text-muted-foreground/40"
                    )}
                  >
                    {previewSuffix && context
                      ? context
                      : datePlaceholder || CONTEXT_PLACEHOLDER}
                  </p>
                  <Pencil className={PENCIL_ICON} aria-hidden />
                </Button>
              </div>

              {/* Photo */}
              <Button
                type="button"
                variant="ghost"
                className="group relative h-auto shrink-0 rounded-full p-0"
                onClick={() => setPhotoOpen(true)}
                aria-label="Edit photo"
              >
                <ProtagonistAvatar
                  name={name || "Name"}
                  photoUrl={previewPhoto ? resolvedPhotoUrl : null}
                />
                <Pencil
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-background p-0.5 text-muted-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden
                />
              </Button>
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
              ) : aboutPlaceholder ? (
                <p className="line-clamp-4 text-base leading-relaxed wrap-break-word text-muted-foreground/50">
                  {aboutPlaceholder}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground/40">+ about</p>
              )}
              <Pencil className={PENCIL_ICON} aria-hidden />
            </Button>

            <hr className="mt-4 border-[#D3D1C7] md:mt-8" />
          </div>

          {/* Poll area skeleton — visible before topic is chosen */}
          {!hasTopicSelected && (
            <div className="pointer-events-none mt-4 space-y-4 opacity-20">
              <div className="h-5 w-36 rounded bg-foreground" />
              <div className="space-y-2.5">
                {[92, 78, 64, 58, 50].map((w) => (
                  <div
                    key={w}
                    className="h-12 rounded-xl bg-foreground"
                    style={{ width: `${w}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          {hasTopicSelected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-2">
                <PollTitle title={topicTitle} />
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {showReveal ? "Post-reveal" : "Pre-reveal"}
                  </span>
                  <Switch
                    checked={showReveal}
                    onCheckedChange={(v) => {
                      if (v !== showReveal) onToggleReveal()
                    }}
                  />
                </div>
              </div>
              {revealValue && (
                <PollReveal
                  personalReveal={revealValue}
                  protagonistFirstName={protagonistFirstName}
                  role="status"
                  aria-live="polite"
                />
              )}

              {/* Reveal edit affordance */}
              {showReveal ? (
                reveal ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto gap-1.5 px-0 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      setRevealDraft(reveal)
                      setRevealOpen(true)
                    }}
                  >
                    <Pencil className="h-3 w-3" aria-hidden />
                    Edit reveal
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className={cn(EDIT_BTN, "mt-1")}
                    onClick={() => {
                      setRevealDraft(reveal)
                      setRevealOpen(true)
                    }}
                    aria-label="Add reveal"
                  >
                    {revealPlaceholder ? (
                      <p className="text-base leading-relaxed wrap-break-word text-muted-foreground/50 italic">
                        {revealPlaceholder}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/40">
                        Add reveal…
                      </p>
                    )}
                    <Pencil className={PENCIL_ICON} aria-hidden />
                  </Button>
                )
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setRevealDraft(reveal)
                    setRevealOpen(true)
                  }}
                >
                  Add reveal →
                </Button>
              )}

              {revealValue ? (
                <PollResults results={pollResults} />
              ) : (
                /* Dimmed + inert — organiser is composing, not pledging */
                <div className="pointer-events-none opacity-40">
                  <PledgePanel
                    items={topicItems}
                    totalAmount={pledgeAmount}
                    onSelectionsChange={() => {}}
                    isInfinite={isInfinite}
                    onAddItem={
                      isInfinite
                        ? async () => {
                            toast.warning(
                              "Items added here won't be saved — add them to your event after publishing.",
                              {
                                style: {
                                  background: "#fffbeb",
                                  color: "#f59e0b",
                                  border: "1px solid #f59e0b",
                                },
                                position: "top-center",
                              }
                            )
                          }
                        : undefined
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — sticky meta */}
        <div className="sticky top-20 space-y-4 self-start">
          {/* Countdown — click to edit closes_at */}
          <Button
            type="button"
            variant="ghost"
            className="group relative block h-auto w-full rounded-lg p-0 text-left"
            onClick={() => {
              setClosesAtDraft(closesAt instanceof Date ? closesAt : undefined)
              setClosesAtOpen(true)
            }}
            aria-label="Edit poll close date"
          >
            {closesAt instanceof Date ? (
              <div className="rounded-lg border border-border bg-card px-5 py-4">
                <Countdown closesAt={closesAt.toISOString()} />
              </div>
            ) : (
              <CountdownPlaceholder />
            )}
            <Pencil
              className="absolute top-2 right-2 h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              aria-hidden
            />
          </Button>

          <CharityBanner charities={displayCharities} totalRaised={0} />

          {/* Pledge card — dimmed and inert during creation */}
          <div className="pointer-events-none opacity-40">
            <PledgeCard
              prePublish
              pledgeAmount={pledgeAmount}
              onPledgeAmountChange={setPledgeAmount}
              charityNames={selectedCharities.map((c) => c.name)}
            />
          </div>
        </div>
      </div>

      {/* ── Overlays ───────────────────────────────────────────── */}

      {/* Name */}
      <ResponsiveOverlay
        open={nameOpen}
        onOpenChange={(o) => !o && setNameOpen(false)}
        title="Name"
        description="Shown throughout the event. 40 characters."
        footer={overlayFooter(saveName, () => setNameOpen(false))}
      >
        <div>
          <Input
            autoFocus
            placeholder="Name or nickname"
            value={nameDraft}
            maxLength={40}
            onChange={(e) => setNameDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveName()}
            className="bg-background"
          />
          <CharCounter value={nameDraft} max={40} />
        </div>
      </ResponsiveOverlay>

      {/* Context */}
      <ResponsiveOverlay
        open={contextOpen}
        onOpenChange={(o) => !o && setContextOpen(false)}
        title="Context"
        description="Dates, years, or other context. Optional."
        footer={overlayFooter(saveContext, () => setContextOpen(false))}
      >
        <div className="space-y-4">
          <div>
            <Input
              autoFocus
              placeholder={datePlaceholder || "e.g. turning 40, class of 2024"}
              value={contextDraft}
              maxLength={40}
              onChange={(e) => setContextDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveContext()}
              className="bg-background"
            />
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

      {/* Opening line */}
      <ResponsiveOverlay
        open={openingLineOpen}
        onOpenChange={(o) => !o && setOpeningLineOpen(false)}
        title="Opening line"
        description="Replaces the default opening prefix. Optional."
        footer={overlayFooter(saveOpeningLine, () => setOpeningLineOpen(false))}
      >
        <div>
          <Input
            autoFocus
            placeholder={openingLinePlaceholder}
            value={openingLineDraft}
            maxLength={60}
            onChange={(e) => setOpeningLineDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveOpeningLine()}
            className="bg-background"
          />
          <CharCounter value={openingLineDraft} max={60} />
        </div>
      </ResponsiveOverlay>

      {/* About */}
      <ResponsiveOverlay
        open={aboutOpen}
        onOpenChange={(o) => !o && setAboutOpen(false)}
        title="About"
        description="Tease the topic domain — save the specific favourite for the reveal."
        footer={overlayFooter(saveAbout, () => setAboutOpen(false))}
      >
        <div>
          <Textarea
            autoFocus
            placeholder={aboutPlaceholder || "A little about them…"}
            value={aboutDraft}
            maxLength={300}
            rows={5}
            onChange={(e) => setAboutDraft(e.target.value)}
            className="bg-background"
          />
          <CharCounter value={aboutDraft} max={300} />
        </div>
      </ResponsiveOverlay>

      {/* Reveal */}
      <ResponsiveOverlay
        open={revealOpen}
        onOpenChange={(o) => !o && setRevealOpen(false)}
        title="The reveal"
        description="Disclosed after pledging — this is the payoff."
        footer={overlayFooter(saveReveal, () => setRevealOpen(false))}
      >
        <div>
          <Textarea
            autoFocus
            placeholder={revealPlaceholder || "Share something they loved…"}
            value={revealDraft}
            maxLength={280}
            rows={5}
            onChange={(e) => setRevealDraft(e.target.value)}
            className="bg-background"
          />
          <CharCounter value={revealDraft} max={280} />
        </div>
      </ResponsiveOverlay>

      {/* Closes at */}
      <ResponsiveOverlay
        open={closesAtOpen}
        onOpenChange={(o) => !o && setClosesAtOpen(false)}
        title="Poll closes"
        footer={overlayFooter(saveClosesAt, () => setClosesAtOpen(false))}
      >
        <DateTimePicker value={closesAtDraft} onChange={setClosesAtDraft} />
      </ResponsiveOverlay>

      {/* Photo */}
      <ResponsiveOverlay
        open={photoOpen}
        onOpenChange={(o) => {
          if (!o) cancelPhoto()
        }}
        title="Photo"
        footer={overlayFooter(savePhoto, cancelPhoto)}
      >
        <div className="space-y-4">
          {/* Preview */}
          <div className="flex justify-center">
            <ProtagonistAvatar
              name={name || "Name"}
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

      {/* Hidden file input */}
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

      {/* Photo crop modal — stacks on top of photo overlay */}
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
    </div>
  )
}
