"use client"

import { useRef, useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { shortTopicLabel } from "@/lib/occasions"
import { cn } from "@/lib/utils"
import type { Category, TopicWithMeta } from "@favpoll/types"
import type { EventFormValues } from "./schema"
import {
  CHIP_IN_INPUT,
  CHIP_IN_INPUT_SIZE,
  CHIP_IN_INPUT_TEXT,
  type PickerSize,
} from "./constants"

export function TopicPickerField({
  topics,
  categories,
  value,
  onChange,
  size = "md",
}: {
  topics: TopicWithMeta[]
  categories: Category[]
  value: EventFormValues["topics"]
  onChange: (v: EventFormValues["topics"]) => void
  size?: PickerSize
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
  const wasOpenRef = useRef(false)

  const activeTopics = topics.filter((t) => t.is_active !== false)
  const hasSelection = value.length > 0
  const selectedId = value[0]?.topicId ?? null

  // Inject any custom-created topic into the display list, sorted alphabetically
  const customEntry: TopicWithMeta | null = value[0]?.isCustom
    ? ({
        id: "__custom__",
        title: value[0].title,
        is_active: true,
        is_finite: false,
        topic_items: [],
        category_ids: [],
        placeholders: {},
      } as unknown as TopicWithMeta)
    : null
  const allDisplayTopics = customEntry
    ? [...activeTopics, customEntry].sort((a, b) =>
        a.title.localeCompare(b.title)
      )
    : activeTopics

  const filtered = allDisplayTopics.filter((t) => {
    const matchesCat =
      t.id === "__custom__" || !catFilter || t.category_ids.includes(catFilter)
    const matchesFinite =
      !finiteFilter || (finiteFilter === "finite" ? t.is_finite : !t.is_finite)
    const matchesSearch =
      !search || t.title.toLowerCase().includes(search.toLowerCase())
    return matchesCat && matchesFinite && matchesSearch
  })

  const trimmedSearch = search.trim()
  const showCreate = trimmedSearch.length > 0 && filtered.length === 0

  function openDropdown() {
    if (anchorRef.current) {
      setPopoverWidth(anchorRef.current.getBoundingClientRect().width)
    }
    setOpen(true)
  }

  function handleFocus() {
    if (!wasOpenRef.current) openDropdown()
  }

  function handleBlur() {
    setTimeout(() => {
      setOpen(false)
      setSearch("")
    }, 150)
  }

  function handleSelect(id: string) {
    if (id === "__custom__") return
    const t = activeTopics.find((t) => t.id === id)
    if (!t) return
    onChange([
      {
        topicId: t.id,
        title: t.title,
        isCustom: false,
        items: t.topic_items.map((i) => ({ id: i.id, label: i.label })),
        customLabels: [],
      },
    ])
    setSearch("")
    setOpen(false)
    inputRef.current?.blur()
  }

  function handleCreateTopic() {
    if (!trimmedSearch) return
    onChange([
      {
        topicId: "",
        title: trimmedSearch,
        isCustom: true,
        items: [],
        customLabels: [],
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
          className={cn(CHIP_IN_INPUT, CHIP_IN_INPUT_SIZE[size])}
          onMouseDown={() => {
            wasOpenRef.current = open
          }}
          onClick={() => inputRef.current?.focus()}
        >
          {hasSelection && (
            <Chip
              selected
              size={size}
              className="gap-1"
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleClear()
              }}
              aria-label={`Remove ${value[0].title}`}
            >
              {shortTopicLabel(value[0].title)}
            </Chip>
          )}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              openDropdown()
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCreateTopic()
              }
              if (e.key === "Delete" && !search && hasSelection) {
                e.preventDefault()
                handleClear()
              }
            }}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={hasSelection ? "" : "Search topics…"}
            className={cn(
              "min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground/50",
              CHIP_IN_INPUT_TEXT[size]
            )}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        style={{ width: popoverWidth || undefined }}
        className="p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Filters — top of dropdown */}
        <div className="border-b border-border p-2">
          <p className="mb-1.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Filter by category
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
          {showCreate ? (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                handleCreateTopic()
              }}
              className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-muted"
            >
              <span className="text-muted-foreground">Add</span>
              <span className="gap-1 rounded-full bg-muted px-3 py-0.5 font-medium text-muted-foreground">
                {trimmedSearch}
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filtered.map((t) => (
                <Chip
                  key={t.id}
                  selected={t.id === selectedId || t.id === "__custom__"}
                  size={size}
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
