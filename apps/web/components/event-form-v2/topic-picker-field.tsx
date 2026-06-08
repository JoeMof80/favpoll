"use client"

import { useState } from "react"
import { Chip } from "@/components/ui/chip"
import { Button } from "@/components/ui/button"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { shortTopicLabel } from "@/lib/registers"
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
  const [search, setSearch] = useState("")
  const [catFilter, setCatFilter] = useState<string | null>(null)
  const [finiteFilter, setFiniteFilter] = useState<
    "finite" | "infinite" | null
  >(null)

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
  }

  function handleClear() {
    onChange([])
  }

  function handleClose() {
    setSearch("")
    setCatFilter(null)
    setFiniteFilter(null)
  }

  return (
    <div>
      {/* Trigger */}
      <div
        className={cn(
          CHIP_IN_INPUT,
          CHIP_IN_INPUT_SIZE[size],
          "cursor-pointer"
        )}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {hasSelection ? (
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
        ) : (
          <span
            className={cn(
              "min-w-0 flex-1 text-muted-foreground/50",
              CHIP_IN_INPUT_TEXT[size]
            )}
          >
            Search topics…
          </span>
        )}
      </div>

      {/* Overlay */}
      <ResponsiveOverlay
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) handleClose()
        }}
        title="favpoll topic"
        description="Choose what everyone votes on."
        footer={
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              setOpen(false)
              handleClose()
            }}
          >
            Done
          </Button>
        }
      >
        <div className="space-y-3">
          {/* Search input */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleCreateTopic()
              }
            }}
            placeholder="Search topics…"
            autoFocus
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring"
          />

          {/* Filters */}
          <div>
            <p className="mb-1.5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              Filter by category
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
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
                  onClick={() =>
                    setFiniteFilter(finiteFilter === val ? null : val)
                  }
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
                  onClick={() => {
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
          <div>
            {showCreate ? (
              <button
                type="button"
                onClick={handleCreateTopic}
                className="flex w-full items-center gap-1.5 rounded px-2.5 py-1.5 text-sm hover:bg-muted"
              >
                <span className="text-muted-foreground">Add</span>
                <span className="gap-1 rounded-full bg-muted px-3 py-0.5 font-medium text-muted-foreground">
                  {trimmedSearch}
                </span>
              </button>
            ) : filtered.length === 0 ? (
              <p className="py-3 text-center text-sm text-muted-foreground">
                No topics found.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {filtered.map((t) => (
                  <Chip
                    key={t.id}
                    selected={t.id === selectedId || t.id === "__custom__"}
                    size="lg"
                    onClick={() => handleSelect(t.id)}
                  >
                    {shortTopicLabel(t.title)}
                  </Chip>
                ))}
              </div>
            )}
          </div>
        </div>
      </ResponsiveOverlay>
    </div>
  )
}
