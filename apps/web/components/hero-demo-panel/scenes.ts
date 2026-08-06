import type { PollResultItem } from "@/components/favpoll-card/types"

export type Phase =
  | "arriving" // trigger button shown
  | "trigger-hover" // trigger button hovered
  | "triggering" // trigger button pressed
  | "picking" // picker open, browsing, nothing selected
  | "selected" // a favourite is selected
  | "next-hover" // Next button hovered
  | "next-pressed" // Next button pressed
  | "pledge-panel" // amount step shown, nothing chosen, Pledge disabled
  | "amount-picked" // preset selected, £ updates, Pledge enabled
  | "pledge-hover" // Pledge button hovered
  | "pledging" // Pledge button pressed
  | "confirmed" // confirmation shown inside the dialog
  | "clearing" // dialog closes
  | "results" // ranking bars climb, reveal skeleton holds
  | "reveal" // personal reveal types out last

/**
 * Supabase-aligned demo scene.
 *
 * occasion_type + opening_line drive the headline through the REAL
 * getFavpollHeadline (same path the live favpoll page uses) — the eyebrow is
 * no longer hardcoded. about + context live on protagonist, mirroring the
 * real Protagonist row, and the About *withholds* the favourite (it must
 * never name or imply the reveal answer).
 *
 * Data fields mirror the actual DB shape used by FavpollCard:
 *   - protagonist → protagonists row
 *   - poll        → favpoll_polls row + topics + favourites
 *   - charities   → charities rows via favpoll_charities
 *
 * Demo-only fields (selectedIndex, pledgeAmount, results, total) carry
 * animation or display data that has no DB equivalent.
 */
// Visitor-facing kinds for the demo nav. These match the wizard's mental model
// (its three Types + the faceless cause Who), NOT the internal register — which
// collapses both "a person's fundraiser" and "a faceless cause" into `cause`.
// "fundraiser" keeps a protagonist (a runner); "cause" is faceless (none).
export type SceneKind = "memorial" | "celebration" | "fundraiser" | "cause"

export type HeroScene = {
  /** Visitor-facing kind — drives the tap-to-jump nav. */
  kind: SceneKind
  // ── Supabase-aligned ──────────────────────────────────────────────────────
  /** Drives the headline prefix via getFavpollHeadline (e.g. "Memorial") */
  occasion_type: string
  /** Custom opening line override; null = derive prefix from occasion_type */
  opening_line: string | null
  /** null for cause + standalone favpolls — no person is honoured */
  protagonist: {
    name: string
    context: string | null
    /** Withholding intro — introduces the person, never names the favourite */
    about: string
    photo_url: string | null
  } | null
  /** h1 for no-protagonist scenes: the cause label, or the question-as-title */
  heading?: string
  /** small eyebrow prefix inside the card for no-protagonist scenes */
  eyebrow?: string
  /** typed "about"-equivalent line for no-protagonist scenes */
  blurb?: string
  poll: {
    id: string
    personal_reveal: string
    topic: {
      title: string
      favourites: { id: string; label: string }[]
    }
  }
  charities: {
    id: string
    name: string
    logo_url: string | null
    registered_number: string | null
  }[]

  // ── Demo-only ─────────────────────────────────────────────────────────────
  /** Index into poll.topic.favourites — the item selected in the animation */
  selectedIndex: number
  /** Pledge amount shown in the demo animation e.g. "£10" */
  pledgeAmount: string
  /** Results snapshot shown during the results + reveal phases */
  results: PollResultItem[]
  /** Formatted total raised e.g. "£1,005" */
  total: string
}

// ── Scene data ───────────────────────────────────────────────────────────────

export const SCENES: HeroScene[] = [
  {
    kind: "memorial",
    occasion_type: "Memorial",
    opening_line: null,
    protagonist: {
      name: "Belinda Hartley",
      context: "1945 - 2024",
      about:
        "A headmistress for forty-one years with a gift for knowing every pupil's name. She had a signature colour that she loved.",
      photo_url: "/demo/belinda.jpg",
    },
    poll: {
      id: "demo-poll-0",
      personal_reveal:
        "Belinda said: My favourite colour was purple. I wore it to every occasion that mattered.",
      topic: {
        title: "Colour",
        favourites: [
          { id: "c-black", label: "Black" },
          { id: "c-blue", label: "Blue" },
          { id: "c-brown", label: "Brown" },
          { id: "c-gold", label: "Gold" },
          { id: "c-green", label: "Green" },
          { id: "c-grey", label: "Grey" },
          { id: "c-orange", label: "Orange" },
          { id: "c-pink", label: "Pink" },
          { id: "c-purple", label: "Purple" },
          { id: "c-red", label: "Red" },
          { id: "c-silver", label: "Silver" },
          { id: "c-white", label: "White" },
          { id: "c-yellow", label: "Yellow" },
        ],
      },
    },
    charities: [
      {
        id: "ch-mc",
        name: "Marie Curie",
        logo_url: null,
        registered_number: "207994",
      },
    ],
    selectedIndex: 1,
    pledgeAmount: "£10",
    results: [
      { label: "Purple", amount: "£350", widthPercent: 100 },
      { label: "Blue", amount: "£220", widthPercent: 63 },
      { label: "Red", amount: "£165", widthPercent: 47 },
      { label: "Green", amount: "£120", widthPercent: 34 },
      { label: "Pink", amount: "£90", widthPercent: 26 },
      { label: "Black", amount: "£60", widthPercent: 17 },
    ],
    total: "£1,005",
  },
  {
    kind: "celebration",
    occasion_type: "Birthday",
    opening_line: null,
    protagonist: {
      name: "Poppy Chen",
      context: "Sweet Sixteen",
      about:
        "Poppy wants to celebrate with ice cream. She has strong opinions about the best flavour. All proceeds go to St Ormond Street, who took such good care of her little brother.",
      photo_url: "/demo/poppy.jpg",
    },
    poll: {
      id: "demo-poll-1",
      personal_reveal:
        "Mint choc chip is the best, of course. What do you mean you don't agree?",
      topic: {
        title: "Ice cream",
        favourites: [
          { id: "ic-banana", label: "Banana" },
          { id: "ic-blackcurr", label: "Blackcurrant" },
          { id: "ic-brownbread", label: "Brown bread" },
          { id: "ic-bubblegum", label: "Bubblegum" },
          { id: "ic-butterscotch", label: "Butterscotch" },
          { id: "ic-cherry", label: "Cherry" },
          { id: "ic-choc", label: "Chocolate" },
          { id: "ic-chocchip", label: "Chocolate chip" },
          { id: "ic-clotted", label: "Clotted cream" },
          { id: "ic-coconut", label: "Coconut" },
          { id: "ic-coffee", label: "Coffee" },
          { id: "ic-cookies", label: "Cookies and cream" },
          { id: "ic-elderflower", label: "Elderflower" },
          { id: "ic-honeycomb", label: "Honeycomb" },
          { id: "ic-mango", label: "Mango" },
          { id: "ic-mintchoc", label: "Mint choc chip" },
          { id: "ic-neapolitan", label: "Neapolitan" },
          { id: "ic-peach", label: "Peach" },
          { id: "ic-peanut", label: "Peanut butter" },
          { id: "ic-pistachio", label: "Pistachio" },
          { id: "ic-raspripple", label: "Raspberry ripple" },
          { id: "ic-rhubcust", label: "Rhubarb and custard" },
          { id: "ic-rockyroad", label: "Rocky road" },
          { id: "ic-rum", label: "Rum and raisin" },
          { id: "ic-saltcar", label: "Salted caramel" },
          { id: "ic-strawberry", label: "Strawberry" },
          { id: "ic-tiramisu", label: "Tiramisu" },
          { id: "ic-toffee", label: "Toffee" },
          { id: "ic-toffeefudge", label: "Toffee fudge" },
          { id: "ic-vanilla", label: "Vanilla" },
          { id: "ic-violet", label: "Violet" },
          { id: "ic-whitechoc", label: "White chocolate" },
        ],
      },
    },
    charities: [
      {
        id: "ch-gosh",
        name: "Great Ormond Street Hospital",
        logo_url: null,
        registered_number: "235825",
      },
    ],
    selectedIndex: 15,
    pledgeAmount: "£20",
    results: [
      { label: "Vanilla", amount: "£210", widthPercent: 100 },
      { label: "Chocolate", amount: "£175", widthPercent: 83 },
      { label: "Strawberry", amount: "£130", widthPercent: 62 },
      { label: "Mint choc chip", amount: "£95", widthPercent: 45 },
      { label: "Salted caramel", amount: "£60", widthPercent: 29 },
      { label: "Pistachio", amount: "£35", widthPercent: 17 },
    ],
    total: "£705",
  },
  {
    // ── Fundraiser: a person doing a sponsored challenge. A Type, not a Who —
    //    so it keeps a protagonist (the runner). Register-wise it derives to
    //    `cause`, but it is nothing like a faceless appeal. ──
    kind: "fundraiser",
    occasion_type: "Sponsored event",
    opening_line: null,
    protagonist: {
      name: "Marcus Bell",
      context: "London Marathon · 26.2 miles",
      about:
        "Running his first marathon for the British Heart Foundation, in memory of his dad. There's one dance he's promised to bust out at the finish line.",
      photo_url: "/demo/marcus.jpg",
    },
    poll: {
      id: "demo-poll-fundraiser",
      personal_reveal:
        "Northern Soul. Marcus has been spinning at all-nighters since he was nineteen.",
      topic: {
        title: "Dance",
        favourites: [
          { id: "d-ballet", label: "Ballet" },
          { id: "d-ballroom", label: "Ballroom" },
          { id: "d-breakdancing", label: "Breakdancing" },
          { id: "d-charleston", label: "Charleston" },
          { id: "d-disco", label: "Disco" },
          { id: "d-flamenco", label: "Flamenco" },
          { id: "d-jive", label: "Jive" },
          { id: "d-linedancing", label: "Line dancing" },
          { id: "d-northernsoul", label: "Northern Soul" },
          { id: "d-salsa", label: "Salsa" },
          { id: "d-tango", label: "Tango" },
          { id: "d-waltz", label: "Waltz" },
        ],
      },
    },
    charities: [
      {
        id: "ch-bhf",
        name: "British Heart Foundation",
        logo_url: null,
        registered_number: "225971",
      },
    ],
    selectedIndex: 9,
    pledgeAmount: "£20",
    results: [
      { label: "Salsa", amount: "£240", widthPercent: 100 },
      { label: "Ballroom", amount: "£190", widthPercent: 79 },
      { label: "Northern Soul", amount: "£150", widthPercent: 63 },
      { label: "Tango", amount: "£110", widthPercent: 46 },
      { label: "Jive", amount: "£75", widthPercent: 31 },
      { label: "Disco", amount: "£45", widthPercent: 19 },
    ],
    total: "£810",
  },
  {
    // ── Cause: no person honoured; the money still goes to a registered
    //    charity (mirrors the live subject="cause" shape). ──
    kind: "cause",
    occasion_type: "Cause",
    opening_line: null,
    protagonist: null,
    // Hospice, not YoungMinds (founder, 2026-08-06): hospices are the channel
    // being approached next, and this scene now carries the whole guest arc in
    // ProcessOverview, so it is the example most visitors will read.
    //
    // NAMED but not BRANDED, deliberately. St Luke's is a prospect, not a
    // customer: naming them matches how the other scenes name Marie Curie,
    // Macmillan and Barnardo's, but a logo on the homepage would read as
    // endorsement before any conversation — and the mark is theirs to grant.
    // The occasion is a generic team walk rather than one of their real named
    // appeals, for the same reason. If they say yes, the logo is one field
    // (logo_url) and the card already renders it.
    heading: "Walking for St Luke's",
    eyebrow: "A cause",
    blurb:
      "A team walk for our local hospice — pledge your favourite, and every penny goes to St Luke's.",
    poll: {
      id: "demo-poll-cause",
      // "helps St Luke's care for people" garden-paths — "St Luke's care" reads
      // as a noun before the verb arrives. Leading with the fact avoids that
      // and teaches the thing most people do not know about hospices.
      personal_reveal:
        "Hospice care is free. Every pledge helps St Luke's keep it that way.",
      topic: {
        title: "Hot drink",
        favourites: [
          { id: "hd-chai", label: "Chai" },
          { id: "hd-coffee", label: "Coffee" },
          { id: "hd-espresso", label: "Espresso" },
          { id: "hd-flatwhite", label: "Flat white" },
          { id: "hd-greentea", label: "Green tea" },
          { id: "hd-hotchoc", label: "Hot chocolate" },
          { id: "hd-latte", label: "Latte" },
          { id: "hd-mocha", label: "Mocha" },
          { id: "hd-peppermint", label: "Peppermint tea" },
          { id: "hd-tea", label: "Tea" },
        ],
      },
    },
    charities: [
      {
        // Registered name and number as published on slhospice.co.uk. The card
        // prints the number, so it has to be right — getting a prospect's
        // charity number wrong on your own homepage is not a good opening.
        id: "ch-slh",
        name: "St Luke's (Cheshire) Hospice",
        logo_url: null,
        registered_number: "515595",
      },
    ],
    selectedIndex: 1,
    pledgeAmount: "£10",
    results: [
      { label: "Tea", amount: "£240", widthPercent: 100 },
      { label: "Coffee", amount: "£205", widthPercent: 85 },
      { label: "Hot chocolate", amount: "£120", widthPercent: 50 },
      { label: "Latte", amount: "£85", widthPercent: 35 },
      { label: "Chai", amount: "£55", widthPercent: 23 },
      { label: "Flat white", amount: "£35", widthPercent: 15 },
    ],
    total: "£740",
  },
]

export const PLEDGE_AMOUNTS = ["£5", "£10", "£20", "£50"]

export type NavTab = {
  label: string
  kind: SceneKind
  /** Scene index the tab jumps to (first scene of its kind). */
  sceneIndex: number
}

// Softened, visitor-facing labels (distinct from the organiser create-flow
// chips) for the demo's tap-to-jump nav — so a visitor can see their kind of
// favpoll without waiting for the auto-cycle to reach it. Cut by visitor kind,
// so "A fundraiser" (a person's challenge) and "For a cause" (a faceless
// appeal) read as the different things they are.
const NAV_TAB_DEFS: { label: string; kind: SceneKind }[] = [
  { label: "Memorial", kind: "memorial" },
  { label: "Celebration", kind: "celebration" },
  { label: "Fundraiser", kind: "fundraiser" },
  { label: "Cause", kind: "cause" },
]

export const NAV_TABS: NavTab[] = NAV_TAB_DEFS.map((tab) => ({
  ...tab,
  sceneIndex: Math.max(
    0,
    SCENES.findIndex((s) => s.kind === tab.kind)
  ),
}))
