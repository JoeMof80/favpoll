"use client"

import { Info, Search } from "lucide-react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { InputGroupButton } from "@/components/ui/input-group"
import { ResponsiveOverlay } from "@/components/ui/responsive-overlay"
import { EventStep } from "@/components/favpoll-flow/event-step"
import { RegisterScope } from "@/components/register-scope"
import { paletteForRegister } from "@/lib/register-palette"
import { deriveRegister } from "@/lib/registers"
// Keyboard on INTENT only (2026-09-16, the pledge picker's recipe): an
// unconditional autoFocus summoned the iOS keyboard the moment the topic/
// charity overlays opened, over a sheet still settling — the reported
// broken-scroll state. Fine pointers keep the instant focus.
import { hasFinePointer } from "@/lib/pointer"
import { TopicStep } from "@/components/favpoll-flow/topic-step"
import { CharityStep } from "@/components/favpoll-flow/charity-step"
import { findOrCreateRegisterCharity } from "@/app/favpolls/new/actions"
import { TopicItemsDialog } from "@/components/favpoll-flow/topic-items-dialog"
import { SeedFundModal } from "@/components/favpoll-form/seed-fund-modal"
import { useWizardState } from "./use-wizard-state"
import { WizardStepRail } from "./wizard-step-rail"
import { WizardGenerateButton } from "./wizard-generate-button"
import { WizardProgressStrip } from "./wizard-progress-strip"
import { WizardNav } from "./wizard-nav"
import { WizardCharityCard } from "./wizard-charity-card"
import { WizardTopicCard } from "./wizard-topic-card"
import { WizardStepShell } from "./wizard-step-shell"
import { WizardInfoStep } from "./wizard-info-step"
import { WizardStoryStep } from "./wizard-story-step"
import { WizardDetailsStep } from "./wizard-details-step"
import type {
  WizardAppeal,
  WizardData,
  WizardEditConfig,
} from "./use-wizard-state"
import type { Charity, FavpollCategory } from "@favpoll/types"

type Props = {
  data: WizardData
  /** Present at /favpolls/[id]/edit — prefilled, clickable rail, Save. */
  edit?: WizardEditConfig
  /** Create mode: seed the Event step (the register CTAs' preselect). */
  initialCategory?: FavpollCategory
  /** Create mode: appeal membership via the join link. */
  appeal?: WizardAppeal
  /** Create mode: the charity page's create tile preselects it. */
  initialCharityId?: string
}

export function NewFavpollWizard({
  data,
  edit,
  initialCategory,
  appeal,
  initialCharityId,
}: Props) {
  // Register-added charities (consent-gate) — appended to the catalogue
  // for this wizard session, and folded into the data handed to the hook
  // so selectedCharities/primaryCharity, the rail and the review card all
  // resolve them (founder bug report, 2026-09-08: picked from the
  // register, the field stayed “Pick a charity”).
  const [extraCharities, setExtraCharities] = useState<Charity[]>([])
  const wizardData = useMemo(
    () => ({
      ...data,
      charities: [
        ...data.charities,
        ...extraCharities.filter(
          (x) => !data.charities.some((c) => c.id === x.id)
        ),
      ],
    }),
    [data, extraCharities]
  )
  const w = useWizardState(
    wizardData,
    edit,
    initialCategory,
    appeal,
    initialCharityId
  )
  const [topicSearch, setTopicSearch] = useState("")
  const [charitySearch, setCharitySearch] = useState("")
  // SINGLE-SELECT PICKER (founder, 2026-09-15): a tap picks and closes.
  // The entry point sets the meaning — the card's "Add another charity"
  // appends; a row's pencil REPLACES that charity (charityReplaceId).
  // The set is managed on the card (remove icons), never in the overlay.
  const [charityReplaceId, setCharityReplaceId] = useState<string | null>(null)

  function openCharityPicker(replaceId?: string) {
    setCharityReplaceId(replaceId ?? null)
    w.setCharityOpen(true)
  }

  function closeCharityPicker() {
    w.setCharityOpen(false)
    setCharitySearch("")
    setCharityReplaceId(null)
  }

  function pickCharity(id: string) {
    if (!w.charityIds.includes(id)) {
      if (charityReplaceId) {
        // Replace in place — the row keeps its position on the card
        w.setCharityIds((ids) =>
          ids.map((i) => (i === charityReplaceId ? id : i))
        )
      } else if (w.charityIds.length < 3) {
        w.setCharityIds((ids) => [...ids, id])
      }
    }
    // Tapping an already-selected charity just closes — deselection
    // lives on the card
    closeCharityPicker()
  }

  async function handleRegisterAdd(pick: {
    registeredNumber: string
    displayName: string
  }) {
    const c = await findOrCreateRegisterCharity(pick)
    setExtraCharities((prev) =>
      prev.some((x) => x.id === c.id) ? prev : [...prev, c]
    )
    pickCharity(c.id)
  }

  const trimmedTopicSearch = topicSearch.trim()
  const topicShowCreate =
    trimmedTopicSearch.length > 0 &&
    !data.topics
      .filter((t) => t.is_active !== false)
      .some((t) => t.title.toLowerCase() === trimmedTopicSearch.toLowerCase())

  function handleCreateTopic() {
    if (!trimmedTopicSearch) return
    w.setTopics([
      {
        topicId: "",
        title: trimmedTopicSearch,
        isCustom: true,
        items: [],
        customLabels: [],
      },
    ])
    w.setTopicOpen(false)
    setTopicSearch("")
  }

  // THE WIZARD WEARS THE REGISTER AS IT IS CHOSEN (founder, 2026-08-31).
  // Derived the way the product derives it, so a cause picked on the
  // Name field's who control goes green the same way.
  const palette = paletteForRegister(
    deriveRegister(w.category, w.grouping, w.subject)
  )

  // Publish succeeded — offer the shared-fund head start (a payment
  // needs the created favpoll), then land on the real page.
  if (w.seedFavpollId) {
    return (
      <RegisterScope palette={palette}>
        <SeedFundModal
          favpollId={w.seedFavpollId}
          onComplete={w.completeSeed}
        />
      </RegisterScope>
    )
  }

  // Money has moved: the step keeps its summary but takes no changes.
  const lockedBody = (value: string) => (
    <div className="space-y-2 text-sm">
      <p className="text-base font-medium">{value || "—"}</p>
      <p className="text-muted-foreground">
        Locked — guests have already pledged.
      </p>
    </div>
  )

  return (
    <RegisterScope palette={palette}>
      <main>
        <div className="md:grid md:min-h-[calc(100vh-4rem)] md:grid-cols-[320px_1fr] md:items-stretch">
          <WizardStepRail
            currentStep={w.step}
            summary={w.railSummary}
            done={w.railDone}
            onStepClick={w.goToStep}
            canJump={w.canJumpTo}
          />

          <div className="px-6 pt-12 pb-10 md:px-12 md:pt-20">
            <div className="mx-auto w-full max-w-2xl">
              <WizardProgressStrip
                currentStep={w.step}
                done={w.railDone}
                onStepClick={w.goToStep}
                canJump={w.canJumpTo}
              />

              {w.step === "event" && (
                <WizardStepShell title="Event">
                  {w.stepLocked.event ? (
                    <div className="space-y-3">
                      <EventStep
                        value={w.category}
                        onChange={() => {}}
                        disabled
                      />
                      <p className="text-sm text-muted-foreground">
                        Locked — guests have already pledged.
                      </p>
                    </div>
                  ) : (
                    <EventStep value={w.category} onChange={w.handleCategory} />
                  )}
                </WizardStepShell>
              )}

              {w.step === "charity" && (
                <WizardStepShell title="Charity">
                  {w.stepLocked.charity ? (
                    w.selectedCharities.length > 0 ? (
                      <WizardCharityCard
                        charities={w.selectedCharities}
                        lockedReason={
                          w.appeal
                            ? `Locked — part of ${w.appeal.name}.`
                            : "Locked — guests have already pledged."
                        }
                      />
                    ) : (
                      lockedBody(w.railSummary.charity.join(" · "))
                    )
                  ) : w.selectedCharities.length > 0 ? (
                    <WizardCharityCard
                      charities={w.selectedCharities}
                      onEdit={(id) => openCharityPicker(id)}
                      onRemove={(id) =>
                        w.setCharityIds((ids) => ids.filter((i) => i !== id))
                      }
                      onPickAnother={() => openCharityPicker()}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      className="h-11 w-full md:text-base"
                      onClick={() => openCharityPicker()}
                    >
                      Pick a charity
                    </Button>
                  )}
                </WizardStepShell>
              )}

              {w.step === "topic" && (
                <WizardStepShell title="Topic">
                  {w.stepLocked.topic ? (
                    w.topics.length > 0 ? (
                      <WizardTopicCard
                        topic={w.topics[0]!}
                        sortedExistingItems={w.sortedExistingItems}
                        customLabels={w.customLabels}
                        showItemsSection={w.showItemsSection}
                        onEdit={() => {}}
                        onOpenItemsDialog={() => {}}
                        lockedReason="Locked — guests have already pledged."
                      />
                    ) : (
                      lockedBody(w.railSummary.topic.join(" · "))
                    )
                  ) : w.topics.length > 0 ? (
                    <WizardTopicCard
                      topic={w.topics[0]!}
                      sortedExistingItems={w.sortedExistingItems}
                      customLabels={w.customLabels}
                      showItemsSection={w.showItemsSection}
                      onEdit={() => w.setTopicOpen(true)}
                      onOpenItemsDialog={() => w.setItemsDialogOpen(true)}
                    />
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      className="h-11 w-full md:text-base"
                      onClick={() => w.setTopicOpen(true)}
                    >
                      Pick a topic
                    </Button>
                  )}
                </WizardStepShell>
              )}

              {w.step === "info" && (
                <WizardStepShell title="Header">
                  <WizardInfoStep w={w} />
                </WizardStepShell>
              )}

              {w.step === "story" && (
                <WizardStepShell
                  title="Story"
                  action={<WizardGenerateButton w={w} />}
                >
                  <WizardStoryStep w={w} />
                </WizardStepShell>
              )}

              {w.step === "details" && (
                <WizardStepShell title="Settings">
                  <WizardDetailsStep w={w} />
                  {/* The PROACTIVE half of the lock story (founder,
                      2026-09-02) — said once, at the moment of
                      commitment; the reactive half is lockedBody's
                      "Locked — guests have already pledged." Hidden
                      once the lock has actually bitten. */}
                  {!w.stepLocked.event && (
                    <p className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Info
                        className="h-3.5 w-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      Once a guest pledges, the event, charity and topic are
                      locked in.
                    </p>
                  )}
                </WizardStepShell>
              )}

              {w.error && (
                <p className="mt-6 text-sm text-destructive" role="alert">
                  {w.error}
                </p>
              )}

              <WizardNav
                isFirst={w.isFirst}
                isLast={w.isLast}
                nextDisabled={w.nextDisabled}
                submitting={w.submitting}
                finishLabel={w.isEdit ? "Save" : "Publish"}
                submittingLabel={w.isEdit ? "Saving…" : "Publishing…"}
                onBack={w.handleBack}
                onNext={w.handleNext}
                onFinish={w.handleFinish}
              />
            </div>
          </div>
        </div>

        {/* Topic overlay — single-select like the charity picker
            (founder, 2026-09-15): a tap (or custom-topic Add) picks and
            closes, so there is no Done; Cancel is the only other act. */}
        <ResponsiveOverlay
          open={w.topicOpen}
          onOpenChange={(o) => {
            w.setTopicOpen(o)
            if (!o) setTopicSearch("")
          }}
          title="Pick a topic"
          hideCloseButton
          hideMobileTitleBar
          separators
          headerClassName="px-5 pt-4 pb-3"
          bodyClassName="p-0"
          fullscreenOnMobile
          header={
            <div>
              {/* The eyebrow IS the ask (pledge-dialog treatment,
                  2026-09-16) — no mobile title bar; Cancel rides the
                  bottom footer. */}
              <span className="mb-2 block text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Pick a topic
              </span>
              <div className="flex items-center gap-2">
                {/* Field-not-subtitle treatment (2026-09-16): search glyph
                  + hairline give the bare input shape across pickers */}
                <Search
                  className="size-4 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  autoFocus={hasFinePointer()}
                  placeholder="Search topics…"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && topicShowCreate) {
                      e.preventDefault()
                      handleCreateTopic()
                    }
                  }}
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
                />
                {topicShowCreate && (
                  <InputGroupButton
                    variant="secondary"
                    onClick={handleCreateTopic}
                  >
                    Add
                  </InputGroupButton>
                )}
              </div>
            </div>
          }
          footer={
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full md:text-base"
              onClick={() => {
                w.setTopicOpen(false)
                setTopicSearch("")
              }}
            >
              Cancel
            </Button>
          }
        >
          <TopicStep
            topics={data.topics}
            categories={data.categories}
            value={w.topics}
            onChange={(v) => {
              // A tap on the already-selected topic arrives as [] (the
              // step's toggle) — under the single-select grammar that tap
              // just closes; the pick is never cleared from the overlay.
              if (v.length > 0) w.setTopics(v)
              w.setTopicOpen(false)
              setTopicSearch("")
            }}
            hideItemsPanel
            suggestedTopics={w.suggestedTopics}
            primaryCharityName={w.primaryCharity?.name}
            search={topicSearch}
            onSearchChange={setTopicSearch}
          />
        </ResponsiveOverlay>

        {/* Charity overlay — single-select: a tap picks and closes, so
            there is no Done; Cancel is the only footer act. */}
        <ResponsiveOverlay
          separators
          open={w.charityOpen}
          onOpenChange={(o) => {
            if (!o) closeCharityPicker()
            else w.setCharityOpen(true)
          }}
          title="Pick a charity"
          hideCloseButton
          hideMobileTitleBar
          headerClassName="px-5 pt-4 pb-3"
          bodyClassName="p-0"
          fullscreenOnMobile
          header={
            <div>
              <span className="mb-2 block text-xs font-medium tracking-widest text-muted-foreground uppercase">
                Pick a charity
              </span>
              <div className="flex items-center gap-2">
                <Search
                  className="size-4 shrink-0 text-muted-foreground/50"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  autoFocus={hasFinePointer()}
                  placeholder="Search charities…"
                  value={charitySearch}
                  onChange={(e) => setCharitySearch(e.target.value)}
                  className="w-full bg-transparent text-lg outline-none placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          }
          footer={
            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full md:text-base"
              onClick={closeCharityPicker}
            >
              Cancel
            </Button>
          }
        >
          <CharityStep
            charities={wizardData.charities}
            value={w.charityIds}
            onPick={pickCharity}
            search={charitySearch}
            onRegisterAdd={handleRegisterAdd}
            onSeedSearch={setCharitySearch}
            eventCategory={w.category}
          />
        </ResponsiveOverlay>

        {/* Items dialog */}
        {w.topics.length > 0 && (
          <TopicItemsDialog
            open={w.itemsDialogOpen}
            onOpenChange={w.setItemsDialogOpen}
            topicTitle={w.topics[0]!.title}
            existingItems={w.dialogExistingItems}
            addedItems={w.customLabels}
            onAdd={w.handleAddItem}
            onRemove={w.handleRemoveItem}
            isNewTopic={w.topics[0]!.isCustom ?? false}
          />
        )}
      </main>
    </RegisterScope>
  )
}
