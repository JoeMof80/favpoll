// THE FAVPOLL'S FIELDS, DEFINED ONCE (founder, 2026-09-30: "match the
// form field styling and labels (everything basically) in the manage
// page from the wizard"). The wizard's steps and the manage page's rows
// both read their labels, limits, hints and state sentences from here,
// so a wording change lands on both and nothing drifts. Ghost text is
// the wizard's own (new-favpoll-wizard/wizard-placeholders, per
// category); pickers and inputs are the shared components in
// components/favpoll-form.

import type { FavpollCategory } from "@favpoll/types"

/** The wizard's own character limits (wizard-info-step, wizard-story-step). */
export const FIELD_LIMITS = {
  openingLine: 50,
  name: 40,
  context: 40,
  about: 300,
  note: 280,
  outcome: 80,
} as const

export const FIELD_LABELS = {
  openingLine: "Opening line",
  context: "Context",
  photo: "Photo",
  about: "About",
  note: "Personal note",
  outcome: "What the picks decide",
  goal: "Pledge goal",
  closeDate: "Close date",
  visibility: "Visibility",
  guestAdditions: "Guest additions",
  showDonations: "Show donations",
} as const

/** "Cause" for a cause, "Name or cause" on a fundraiser, "Name" otherwise. */
export function nameLabel(
  who: "someone" | "cause" | string | null | undefined,
  category: FavpollCategory | string | null | undefined
): string {
  if (who === "cause") return "Cause"
  if (category === "fundraiser") return "Name or cause"
  return "Name"
}

/** ALWAYS-VISIBLE guidance for the two craft fields (founder,
 *  2026-09-17): the wizard is an authoring surface, a sentence of
 *  guidance changes the output, so it must not hide in a popover. */
export const FIELD_HINTS = {
  about:
    "Set the scene, link the topic and the cause. Hint at a note, if there is one.",
  note: "A direct quote, a memory, or a message to guests. Revealed only after a guest pledges.",
  outcome:
    'Leave blank unless the guests\' picks decide the night. Then there is no personal note. Two shapes: "the winner is …" or "the top five are …".',
} as const

// THE ENACTED SHAPE'S SENTENCE (favpoll-topic-rules additions §D, founder
// 2026-10-02): what the guests' picks decide. Two shapes only — the
// generator and the field accept nothing else — so the card's promise
// reads the same on every favpoll that makes one.
export const OUTCOME_SHAPES = [
  /^the winner is\s+\S/i,
  /^the top (\d{1,2}|two|three|four|five|six|seven|eight|nine|ten|twelve|twenty) are\s+\S/i,
] as const

/** True for an outcome sentence in one of the two shapes. */
export function isOutcomeSentence(text: string): boolean {
  const t = text.trim()
  return OUTCOME_SHAPES.some((re) => re.test(t))
}

/** The sentence as stored: trimmed, no trailing full stop, null when blank. */
export function normaliseOutcome(
  text: string | null | undefined
): string | null {
  const t = (text ?? "").trim().replace(/[.\s]+$/, "")
  return t ? t : null
}

export const OUTCOME_INVALID =
  'The outcome must read "the winner is …" or "the top five are …".'

export const GOAL_PRESETS = [100, 250, 500, 1000] as const

export type Visibility = "listed" | "unlisted" | "private"

// The three-notch visibility axis (listed ⊃ unlisted ⊃ private) as one
// control — two stacked switches would leave the hierarchy illegible.
export const VISIBILITY_OPTIONS: {
  value: Visibility
  label: string
  hint: string
}[] = [
  {
    value: "listed",
    label: "Listed",
    hint: "Appears on the public favpolls page.",
  },
  {
    value: "unlisted",
    label: "Link only",
    hint: "Only people with the link can find it.",
  },
  {
    value: "private",
    label: "Private",
    hint: "Guests must sign in; shared links preview no details.",
  },
]

export const visibilityHint = (v: Visibility) =>
  VISIBILITY_OPTIONS.find((o) => o.value === v)?.hint

/** The state, as the sentence beside its switch (SwitchLine). */
export const guestAdditionsSentence = (on: boolean) =>
  on
    ? "Guests can add their own favourites to the topic."
    : "Only your favourites appear."

export const showDonationsSentence = (on: boolean) =>
  on
    ? "Guests can choose to show their donation in the guest book."
    : "Only favourite picks appear in the guest book."
