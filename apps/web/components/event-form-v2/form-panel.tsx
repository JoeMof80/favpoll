"use client"

import React, { useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import {
  CalendarIcon,
  CircleUserRound,
  Clock2Icon,
  Eye,
  EyeOff,
  X,
} from "lucide-react"
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Chip } from "@/components/ui/chip"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import {
  shortTopicLabel,
  OCCASION_LIST,
  OCCASION_PLACEHOLDERS,
  DEFAULT_PLACEHOLDERS,
  DATE_LABEL_PLACEHOLDERS,
  TOPIC_REVEAL_PLACEHOLDERS,
} from "@/lib/occasions"
import { cn } from "@/lib/utils"
import type { Category, Charity, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"
import { PhotoCropModal } from "./photo-crop-modal"

const SECTION_LABEL =
  "text-[11px] font-medium uppercase tracking-[0.08em] text-[#534AB7]"
const MAX_CHARITIES = 3

function StepSection({
  number,
  title,
  children,
  isLast = false,
}: {
  number: number
  title: string
  children: React.ReactNode
  isLast?: boolean
}) {
  return (
    <div className="flex gap-2.5">
      <div className="flex shrink-0 flex-col items-center">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#534AB7] text-[11px] font-semibold text-white">
          {number}
        </span>
        {!isLast && <div className="mt-1.5 w-px flex-1 bg-[#AFA9EC]" />}
      </div>
      <div className={cn("min-w-0 flex-1 space-y-3", !isLast && "pb-8")}>
        <h2 className="flex h-5 items-center text-xs font-medium tracking-widest text-[#7F77DD] uppercase">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
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
}

// ─── Date + time picker ────────────────────────────────────────────────────
function DateTimePicker({
  value,
  onChange,
}: {
  value: Date | undefined
  onChange: (d: Date) => void
}) {
  const [open, setOpen] = useState(false)

  const dateStr = value
    ? value.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Pick a close date"

  const timeStr = value
    ? `${String(value.getHours()).padStart(2, "0")}:${String(value.getMinutes()).padStart(2, "0")}`
    : "23:59"

  function handleDaySelect(d: Date | undefined) {
    if (!d) return
    const next = value ? new Date(value) : new Date()
    next.setFullYear(d.getFullYear(), d.getMonth(), d.getDate())
    onChange(next)
    setOpen(false)
  }

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [h, m] = e.target.value.split(":").map(Number)
    const next = value ? new Date(value) : new Date()
    next.setHours(h ?? 23, m ?? 59, 0, 0)
    onChange(next)
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start gap-2 font-normal",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 opacity-50" aria-hidden />
          <span className="flex-1 text-left">{dateStr}</span>
          <span className="shrink-0 text-muted-foreground tabular-nums">
            {timeStr}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Card size="sm" className="w-fit shadow-none ring-0">
          <CardContent>
            <Calendar
              mode="single"
              captionLayout="dropdown"
              selected={value}
              defaultMonth={value ?? today}
              startMonth={today}
              endMonth={new Date(new Date().getFullYear() + 5, 11)}
              disabled={{ before: today }}
              onSelect={handleDaySelect}
              className="p-0"
            />
          </CardContent>
          <CardFooter className="bg-card">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="v2-closes-time">Time</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id="v2-closes-time"
                    type="time"
                    step="60"
                    value={timeStr}
                    onChange={handleTimeChange}
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  />
                  <InputGroupAddon align="inline-end">
                    <Clock2Icon className="text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            </FieldGroup>
          </CardFooter>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

// ─── Charity selector ──────────────────────────────────────────────────────
function CharityField({
  charities,
  value,
  onChange,
}: {
  charities: Charity[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const [search, setSearch] = useState("")
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const atMax = value.length >= MAX_CHARITIES
  const selected = charities.filter((c) => value.includes(c.id))

  const visible = charities.filter(
    (c) => !search || c.name.toLowerCase().includes(search.toLowerCase())
  )

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id))
    } else if (!atMax) {
      onChange([...value, id])
      setSearch("")
      inputRef.current?.focus()
    }
  }

  function openDropdown() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      setSearch("")
    }, 150)
  }

  return (
    <div className="space-y-0.5">
      <div className="flex items-center justify-between">
        {value.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{MAX_CHARITIES}
          </span>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div
            ref={anchorRef}
            className={CHIP_IN_INPUT}
            onClick={() => inputRef.current?.focus()}
          >
            {selected.map((c) => (
              <span key={c.id} className={CHIP_PILL}>
                {c.name}
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    toggle(c.id)
                  }}
                  className="hover:text-[#534AB7]/70"
                  aria-label={`Remove ${c.name}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            {!atMax && (
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  openDropdown()
                }}
                onFocus={openDropdown}
                onBlur={handleBlur}
                placeholder={
                  selected.length === 0 ? "Select a charity…" : "Add another…"
                }
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
              />
            )}
          </div>
        </PopoverAnchor>

        <PopoverContent
          style={{ width: popoverWidth || undefined }}
          className="p-0"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="max-h-60 overflow-y-auto p-2">
            {visible.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No results.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {visible.map((c) => (
                  <Chip
                    key={c.id}
                    selected={value.includes(c.id)}
                    disabled={!value.includes(c.id) && atMax}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      toggle(c.id)
                    }}
                  >
                    {c.name}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

// Shared chip-in-input appearance used by occasion, topic, and item pickers
const CHIP_IN_INPUT =
  "flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 cursor-text focus-within:ring-2 focus-within:ring-ring"
const CHIP_PILL =
  "inline-flex shrink-0 items-center gap-0.5 rounded-full bg-[#EEEDFE] px-2.5 py-0.5 text-xs font-medium text-[#534AB7]"

// ─── Occasion picker ─────────────────────────────────────────────────────────
function OccasionPickerField({
  value,
  onChange,
  onClear,
}: {
  value: string
  onChange: (v: string) => void
  onClear: () => void
}) {
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const [search, setSearch] = useState("")
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedLabel =
    OCCASION_LIST.find((o) => o.value === value)?.label ?? null

  const visible = OCCASION_LIST.filter(
    (o) => !search || o.label.toLowerCase().includes(search.toLowerCase())
  )

  function openDropdown() {
    if (anchorRef.current)
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    setOpen(true)
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      setSearch("")
    }, 150)
  }

  function handleSelect(v: string) {
    onChange(v)
    setSearch("")
    setOpen(false)
    inputRef.current?.blur()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={CHIP_IN_INPUT}
          onClick={() => inputRef.current?.focus()}
        >
          {selectedLabel && (
            <span className={CHIP_PILL}>
              {selectedLabel}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  onClear()
                }}
                className="hover:text-[#534AB7]/70"
                aria-label="Clear occasion"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              openDropdown()
            }}
            onFocus={openDropdown}
            onBlur={handleBlur}
            placeholder={selectedLabel ? "" : "Select an occasion…"}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        style={{ width: popoverWidth || undefined }}
        className="p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-60 overflow-y-auto p-2">
          {visible.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              No results.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {visible.map((o) => (
                <Chip
                  key={o.value}
                  selected={o.value === value}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(o.value)
                  }}
                >
                  {o.label}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ─── Topic picker with filters inside dropdown ─────────────────────────────
function TopicPickerField({
  topics,
  categories,
  value,
  onChange,
}: {
  topics: TopicWithMeta[]
  categories: Category[]
  value: EventFormValues["topics"]
  onChange: (v: EventFormValues["topics"]) => void
}) {
  const [open, setOpen] = useState(false)
  const [popoverWidth, setPopoverWidth] = useState(0)
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [finiteFilter, setFiniteFilter] = useState<
    "finite" | "infinite" | null
  >(null)
  const anchorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const activeTopics = topics.filter((t) => t.is_active !== false)
  const selectedId = value[0]?.topicId ?? null

  const filtered = activeTopics.filter((t) => {
    const matchesCat = !catFilter || t.category_ids.includes(catFilter)
    const matchesFinite =
      !finiteFilter || (finiteFilter === "finite" ? t.is_finite : !t.is_finite)
    const matchesSearch =
      !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesFinite && matchesSearch
  })

  function openDropdown() {
    if (anchorRef.current) {
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    }
    setOpen(true)
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      setSearch("")
    }, 150)
  }

  function handleSelect(id: string) {
    const t = activeTopics.find((t) => t.id === id)
    if (!t) return
    onChange([
      {
        topicId: t.id,
        title: t.title,
        items: t.topic_items.map((i) => ({ id: i.id, label: i.label })),
      },
    ])
    setSearch("")
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleClear() {
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          ref={anchorRef}
          className={CHIP_IN_INPUT}
          onClick={() => inputRef.current?.focus()}
        >
          {selectedId && (
            <span className={CHIP_PILL}>
              {shortTopicLabel(value[0].title)}
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleClear()
                }}
                className="hover:text-[#534AB7]/70"
                aria-label={`Remove ${value[0].title}`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          )}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              openDropdown()
            }}
            onFocus={openDropdown}
            onBlur={handleBlur}
            placeholder={selectedId ? "" : "Search topics…"}
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        style={{ width: popoverWidth || undefined }}
        className="p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {/* Filters — top of dropdown */}
        <div className="border-b border-border p-2">
          <p className="mb-1.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Filter
          </p>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                setCatFilter(null)
                setFiniteFilter(null)
              }}
              className={cn(
                "rounded px-2.5 py-1 text-xs font-medium",
                !catFilter && !finiteFilter
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              All
            </button>
            {(["finite", "infinite"] as const).map((val) => (
              <button
                key={val}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setFiniteFilter(finiteFilter === val ? null : val)
                }}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium",
                  finiteFilter === val
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {val.charAt(0).toUpperCase() + val.slice(1)}
              </button>
            ))}
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  setFiniteFilter(null)
                  setCatFilter(catFilter === cat.id ? null : cat.id)
                }}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-medium",
                  catFilter === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Topic chips */}
        <div className="max-h-52 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="py-3 text-center text-sm text-muted-foreground">
              No results.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filtered.map((t) => (
                <Chip
                  key={t.id}
                  selected={t.id === selectedId}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(t.id)
                  }}
                >
                  {shortTopicLabel(t.title)}
                </Chip>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}


// ─── Main form panel ────────────────────────────────────────────────────────
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
}: Props) {
  const form = useFormContext<EventFormValues>()
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [photoFileName, setPhotoFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const occasion = form.watch("occasion")
  const name = form.watch("name")
  const selectedTopics = form.watch("topics")
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
  const revealPlaceholder = basePlaceholders
    ? topicTitle
      ? (
          TOPIC_REVEAL_PLACEHOLDERS[topicTitle]?.reveal ??
          basePlaceholders.reveal
        ).replace("{name}", firstName)
      : basePlaceholders.reveal
    : ""

  return (
    <div className="px-5 py-6">
      {/* Step 1 — Occasion */}
      <StepSection number={1} title="Occasion">
        <FormField
          control={form.control}
          name="occasion"
          render={({ field }) => (
            <FormItem>
              <OccasionPickerField
                value={field.value}
                onChange={field.onChange}
                onClear={() => form.reset()}
              />
              <FormMessage />
              <FieldDescription className="mx-3 text-sm text-muted-foreground">
                We recommend looking through different occasion types to see
                different profiles that might inspire your own event.
              </FieldDescription>
            </FormItem>
          )}
        />
      </StepSection>

      {/* Step 2 — Personal information */}
      <StepSection number={2} title="Profile">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  className="h-10 bg-background placeholder:text-muted-foreground/50"
                  placeholder={basePlaceholders?.name ?? ""}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <FieldDescription className="mx-3 text-sm text-muted-foreground">
                Use the name or nickname of the individual, couple, family or
                group the event is for.
              </FieldDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="suffix"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputGroup className="h-10 bg-background">
                  <InputGroupInput
                    placeholder={datePlaceholder}
                    className="placeholder:text-muted-foreground/50"
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
              <FieldDescription className="mx-3 text-sm text-muted-foreground">
                Add important context to the occasion such as dates (optional).
              </FieldDescription>
            </FormItem>
          )}
        />

        {/* Picture field */}
        <FormItem>
          <FormControl>
            <div>
              <InputGroup className="h-10 bg-background">
                <InputGroupAddon
                  align="inline-start"
                  className="cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CircleUserRound />
                </InputGroupAddon>
                <InputGroupInput
                  readOnly
                  value={photoFileName ?? "No file chosen"}
                  className={
                    photoFileName
                      ? "cursor-pointer"
                      : "cursor-pointer text-muted-foreground"
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
                  setPhotoFileName(file.name)
                  setCropSrc(URL.createObjectURL(file))
                  e.target.value = ""
                }}
              />
            </div>
          </FormControl>
          <FieldDescription className="mx-3 text-sm text-muted-foreground">
            Upload a special photo and click{" "}
            <Eye className="inline-block h-4 w-4" /> to show/hide it in your
            event.
          </FieldDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="about"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder={aboutPlaceholder}
                  rows={4}
                  {...field}
                  value={field.value ?? ""}
                  className="bg-background placeholder:text-muted-foreground/50"
                />
              </FormControl>
              <FormMessage />
              <FieldDescription className="mx-3 text-sm text-muted-foreground">
                Use the name or nickname of the individual, couple, family or
                group the event is for.
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

      {/* Step 3 — favpoll */}
      <StepSection number={3} title="Topic">
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="topics"
            render={({ field }) => (
              <FormItem>
                <TopicPickerField
                  topics={topics}
                  categories={categories}
                  value={field.value}
                  onChange={field.onChange}
                />
                {field.value[0]?.items && field.value[0].items.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {[...field.value[0].items]
                      .sort((a, b) => a.label.localeCompare(b.label))
                      .map((item) => (
                        <Chip key={item.id}>{item.label}</Chip>
                      ))}
                  </div>
                )}
                <FormMessage />
                <FieldDescription className="mx-3 text-sm text-muted-foreground">
                  Use the name or nickname of the individual, couple, family or
                  group the event is for.
                </FieldDescription>
              </FormItem>
            )}
          />
        </div>
      </StepSection>

      {/* Step 4 — Reveal */}
      <StepSection number={4} title="Reveal">
        <FormField
          control={form.control}
          name="reveal"
          render={({ field }) => (
            <FormItem>
              <FormDescription>
                Shown to guests after they pledge.
              </FormDescription>
              <FormControl>
                <Textarea
                  className="bg-background placeholder:text-muted-foreground/50"
                  placeholder={revealPlaceholder}
                  rows={5}
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
              <FieldDescription className="mx-3 text-sm text-muted-foreground">
                Use the name or nickname of the individual, couple, family or
                group the event is for.
              </FieldDescription>
            </FormItem>
          )}
        />
      </StepSection>

      {/* Step 5 — Event information */}
      <StepSection number={5} title="Event" isLast>
        <FormField
          control={form.control}
          name="closesAt"
          render={({ field }) => (
            <FormItem>
              <DateTimePicker value={field.value} onChange={field.onChange} />
              <FormMessage />
              <FieldDescription className="mx-3 text-sm text-muted-foreground">
                Use the name or nickname of the individual, couple, family or
                group the event is for.
              </FieldDescription>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="charities"
          render={({ field }) => (
            <FormItem>
              <CharityField
                charities={charities}
                value={field.value}
                onChange={field.onChange}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPrivate"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <FormLabel className={SECTION_LABEL}>Private event</FormLabel>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Only people with the link can find and pledge.
                  </p>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </div>
              <FormMessage />
              <FieldDescription className="mx-3 text-sm text-muted-foreground">
                Use the name or nickname of the individual, couple, family or
                group the event is for.
              </FieldDescription>
            </FormItem>
          )}
        />
      </StepSection>
    </div>
  )
}
