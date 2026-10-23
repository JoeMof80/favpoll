// THE LIBRARY (founder, 2026-10-15: "We need a place to organise important
// documents for easy reading. maybe on the admin app.")
//
// favpoll's documents live in three places: Claude artifacts (built pages
// like The Rail Decision), Claude Docs (the use-cases doc), and this repo's
// references/ folder — ninety markdown files only legible in an editor. This
// registry is the one list of the ones that matter, in the sections the
// founder reaches for them by. Adding a document is one entry here, in a
// PR, so the library cannot drift from the work.
//
// A `reference` entry is rendered in-page by /library/[slug] (a reading
// column); `artifact` and `doc` open on claude.ai in a new tab (they need
// the founder's login; nothing to embed); `external` is any other link. No
// PDF kind: references/*.pdf is gitignored, so the files are not in the
// checkout Vercel builds from — the IoF template links to its publisher.
// Only files named here can be read — the reader checks the registry before
// touching the disk.

export type LibraryKind = "reference" | "artifact" | "doc" | "external"

export type LibraryEntry = {
  /** Shown as the title; the registry's own words, not the file's heading. */
  title: string
  /** One line: what it is and why you would open it. */
  summary: string
  kind: LibraryKind
  /** reference: the filename under references/. Otherwise: the URL. */
  source: string
  /** ISO date of the document's last substantive revision. */
  date: string
  section: LibrarySection
}

export const SECTIONS = [
  "The rail & the law",
  "Product & research",
  "Channels & outreach",
  "Running the company",
] as const
export type LibrarySection = (typeof SECTIONS)[number]

export const LIBRARY: LibraryEntry[] = [
  // ── The rail & the law ──────────────────────────────────────────────────
  {
    title: "The Rail Decision",
    summary:
      "The flowchart and the case: PPGF as the rail, GoFundMe's practices as the guide, what Pippa is for and when.",
    kind: "artifact",
    source: "https://claude.ai/artifact/G1Di4i8FNdDdSVG3TNdNYr",
    date: "2026-10-14",
    section: "The rail & the law",
  },
  {
    title: "The PPGF record",
    summary:
      "Everything learned about PayPal Giving Fund since July: their terms, Joe Metcalfe's two replies, GoFundMe and Thrift+ compared, Bates Wells, contact routes, the costing.",
    kind: "reference",
    source: "ppgf-enquiry-draft-2026-07.md",
    date: "2026-10-14",
    section: "The rail & the law",
  },
  {
    title: "Who we are — for PPGF",
    summary:
      "One page for the partner application: the company, the product, the register machinery, where we actually are.",
    kind: "reference",
    source: "ppgf-who-we-are-2026-10.md",
    date: "2026-10-14",
    section: "The rail & the law",
  },
  {
    title: "Expected donation volume — for PPGF",
    summary:
      "The £10k-a-year question answered through funeral directors: one relationship at modest uptake clears it. Direct cremations are inside the market, not outside it, and the £20 leg is conservative by half.",
    kind: "reference",
    source: "ppgf-volume-note-2026-10.md",
    date: "2026-10-21",
    section: "The rail & the law",
  },
  {
    title: "Proposed donation wording under PPGF",
    summary:
      "Draft terms and donation-page copy written against PPGF's own donor terms, and what the 'suggested charity' framing costs us.",
    kind: "reference",
    source: "ppgf-wording-draft-2026-10.md",
    date: "2026-10-14",
    section: "The rail & the law",
  },
  {
    title: "Instruction brief — two structures, one determination",
    summary:
      "The brief for whichever firm takes the Part II question: PPGF as NPO of record versus trust account plus per-charity agency. Hold until PPGF's agreement is in hand.",
    kind: "reference",
    source: "legal-brief-the-fork-2026-10.md",
    date: "2026-10-13",
    section: "The rail & the law",
  },
  {
    title: "IoF / Bates Wells standard-form agreement (Charities Act 1992)",
    summary:
      "The free drafting template a commercial participator agreement starts from, with the IoF's guidance notes. Published by PPGF's own solicitors; a copy sits in references/ (gitignored).",
    kind: "external",
    source:
      "https://www.dsc.org.uk/wp-content/uploads/2016/11/StandardFormofAgreementGuidanceNotes.doIoF-c.pdf",
    date: "2026-10-14",
    section: "The rail & the law",
  },
  {
    title: "Disbursement rail enquiries — Goodstack and Swiftaid",
    summary:
      "The July–August round: what each rail offered, what killed Goodstack, Pledge.to evaluated and set aside.",
    kind: "reference",
    source: "disbursement-enquiries-2026-07.md",
    date: "2026-08-07",
    section: "The rail & the law",
  },
  {
    title: "The disbursement-provider seam",
    summary:
      "Where the code meets the rail: the interface a provider implements, and the banner on what changes under PPGF.",
    kind: "reference",
    source: "disbursement-provider-seam.md",
    date: "2026-10-14",
    section: "The rail & the law",
  },
  {
    title: "Counsel enquiries — a third and fourth firm",
    summary:
      "The firms approached for the PF/CP opinion, what each said, and the chasers sent.",
    kind: "reference",
    source: "counsel-enquiries-2026-09-28.md",
    date: "2026-09-28",
    section: "The rail & the law",
  },
  {
    title: "Draft Terms of Service",
    summary:
      "The terms as drafted on 15 September; the money paragraph will be PPGF's to constrain.",
    kind: "reference",
    source: "draft-terms-of-service-2026-09-15.md",
    date: "2026-10-13",
    section: "The rail & the law",
  },
  {
    title: "Draft Privacy Policy",
    summary:
      "The privacy policy as drafted on 15 September, now live at /privacy.",
    kind: "reference",
    source: "draft-privacy-policy-2026-09-15.md",
    date: "2026-09-15",
    section: "The rail & the law",
  },
  {
    title: "JustGiving — assessment and positioning",
    summary:
      "How JustGiving's trust-account model works and where favpoll stands beside it; the posture the pledge economics later adopted.",
    kind: "reference",
    source: "justgiving-positioning-2026-07.md",
    date: "2026-07-29",
    section: "The rail & the law",
  },

  // ── Product & research ──────────────────────────────────────────────────
  {
    title: "Use cases, shapes and exemplars",
    summary:
      "The founder's one-place doc: the registers, memento versus provision, the five topic tests, the charities, the fifty exemplars. Edit it, never recreate it.",
    kind: "doc",
    source: "https://claude.ai/artifact/DRqBxT8zjRhwucDH7ZNgRK",
    date: "2026-10-01",
    section: "Product & research",
  },
  {
    title: "Seeded Stories — 39 from the pairing table",
    summary:
      "Every seeded favpoll as a guest sees it, with the About, the note and the edges the pairing table computed. Staging, 3 October.",
    kind: "artifact",
    source: "https://claude.ai/artifact/K8P6To1qAg2yKgGvKYzg2E",
    date: "2026-10-03",
    section: "Product & research",
  },
  {
    title: "Why the poll doesn't land — Gary's reaction",
    summary:
      "The cold read that drove the home hero: 'what is the vote poll thing about?', the allocative misread, and the three scenarios that got to 'Got it'.",
    kind: "reference",
    source: "linkedin-feedback-concept-clarity-2026-09-23.md",
    date: "2026-09-24",
    section: "Product & research",
  },
  {
    title: "The concept model (v1)",
    summary:
      "What favpoll IS versus what it is FOR, locked in July; the vocabulary the copy still follows.",
    kind: "reference",
    source: "favpoll-concept-model-2026-07.md",
    date: "2026-07-20",
    section: "Product & research",
  },
  {
    title: "The pairing table",
    summary:
      "Occasion × topic × charity: which triples carry an edge, the constituent test, and the rows that decide a night.",
    kind: "reference",
    source: "favpoll-pairing-table-2026-09-23.md",
    date: "2026-09-27",
    section: "Product & research",
  },
  {
    title: "Subsets × the pairing table — the revisit",
    summary:
      "The 1 October pass: which subsets earn rows, the enacted sentences, section D's accepted set.",
    kind: "reference",
    source: "subsets-pairing-revisit-2026-10-01.md",
    date: "2026-10-14",
    section: "Product & research",
  },
  {
    title: "Appeals — concept note",
    summary:
      "Parent campaigns: aggregation only, charity-locked, the hospice pilot as the trigger, post-launch.",
    kind: "reference",
    source: "appeals-concept-2026-09-05.md",
    date: "2026-09-06",
    section: "Product & research",
  },
  {
    title: "A page ready for every charity — design note",
    summary:
      "Charity profiles from the register mirror: what a page can say about a charity nobody has onboarded.",
    kind: "reference",
    source: "charity-profiles-2026-09-27.md",
    date: "2026-10-04",
    section: "Product & research",
  },
  {
    title: "Yvette session → improvement tracks",
    summary:
      "The cold-reader session that settled 'personal note' and the generator's age and tense rules.",
    kind: "reference",
    source: "yvette-session-improvements-2026-09-17.md",
    date: "2026-09-17",
    section: "Product & research",
  },
  {
    title: "Glossary — the ubiquitous language",
    summary: "The words favpoll uses and the ones it has banned, with reasons.",
    kind: "reference",
    source: "GLOSSARY.md",
    date: "2026-07-20",
    section: "Product & research",
  },

  // ── Channels & outreach ─────────────────────────────────────────────────
  {
    title: "The funeral sector map",
    summary:
      "Who to approach and in what order: OurCoop first (150+ homes, 16,966 funerals), East of England and Scotmid as the easier yes, Co-op Funeralcare as the prize not the first call, SAIF/NAFD for the 4,000 independents.",
    kind: "reference",
    source: "co-operative-funeral-societies-2026-10-21.md",
    date: "2026-10-21",
    section: "Channels & outreach",
  },
  {
    title: "How to approach a funeral society",
    summary:
      "The five-part shape that reached a stranger cold, the never-in-a-first-approach list, and the Glenn Barsby InMail as sent — with the subject lines that were rejected and why.",
    kind: "reference",
    source: "funeral-society-approaches-2026-10-21.md",
    date: "2026-10-21",
    section: "Channels & outreach",
  },
  {
    title: "The will-directed favpoll",
    summary:
      "A favpoll specified in a will or letter of wishes, written by the person themselves and created by an executor when the time comes. The first-person note is the point of it.",
    kind: "reference",
    source: "will-directed-favpoll-2026-10-21.md",
    date: "2026-10-21",
    section: "Channels & outreach",
  },
  {
    title: "The exemplar for Palins",
    summary:
      "Nicola Thorne · Memorial · Song · Alzheimer's Society — the dementia-themed favpoll built for the funeral director, as seeded.",
    kind: "reference",
    source: "seeded-stories-2026-10-15-palins.md",
    date: "2026-10-15",
    section: "Channels & outreach",
  },
  {
    title: "For Organisers — the pitch",
    summary: "favpoll explained to the person who would create one.",
    kind: "reference",
    source: "organiser-pitch.md",
    date: "2026-10-13",
    section: "Channels & outreach",
  },
  {
    title: "For Charities — the pitch",
    summary:
      "favpoll explained to a charity: what it receives, what it has to do (nothing).",
    kind: "reference",
    source: "charity-pitch.md",
    date: "2026-07-04",
    section: "Channels & outreach",
  },
  {
    title: "For Will Writers and Estate Planners — the pitch",
    summary:
      "The memorial register pitched to the professionals who meet families first.",
    kind: "reference",
    source: "will-writers-pitch.md",
    date: "2026-07-04",
    section: "Channels & outreach",
  },
  {
    title: "Meeting with Angela — St Luke's Hospice",
    summary:
      "The hospice call sheet: what to ask, what to offer, the pilot shape.",
    kind: "reference",
    source: "hospice-call-sheet-angela-PRINT.md",
    date: "2026-10-13",
    section: "Channels & outreach",
  },
  {
    title: "Call with Joy — celebrant discovery",
    summary:
      "The celebrant call sheet, and the route that led to Palins and Tresidders.",
    kind: "reference",
    source: "celebrant-call-sheet-joy-PRINT.md",
    date: "2026-10-13",
    section: "Channels & outreach",
  },
  {
    title: "Outreach notes — advancing favpoll",
    summary: "The running notes on who to approach, in what order, and why.",
    kind: "reference",
    source: "outreach-notes.md",
    date: "2026-08-05",
    section: "Channels & outreach",
  },
  {
    title: "Growth ideas",
    summary:
      "July's list of ways to grow Honour, Charity and Love — several since built (the bump chart, the keepsake, register verification).",
    kind: "reference",
    source: "growth-ideas-2026-07.md",
    date: "2026-07-05",
    section: "Channels & outreach",
  },

  // ── Running the company ─────────────────────────────────────────────────
  {
    title: "Session handoff — 14/15 October 2026",
    summary:
      "The latest: PPGF groundwork, the home hero, the podium, the manage fixes, charcoal dark. What is deferred and what was learned.",
    kind: "reference",
    source: "session-handoff-2026-10-15.md",
    date: "2026-10-15",
    section: "Running the company",
  },
  {
    title: "Outstanding tasks",
    summary:
      "The long-running task table, annotated as things move; the legal opinion row carries the counsel story.",
    kind: "reference",
    source: "outstanding-tasks-2026-07.md",
    date: "2026-09-09",
    section: "Running the company",
  },
  {
    title: "PROJECT.md — the project document",
    summary:
      "The whole system described: stack, schema, design system, every settled decision with its date. Long; search it.",
    kind: "reference",
    source: "PROJECT.md",
    date: "2026-09-01",
    section: "Running the company",
  },
  {
    title: "Session handoff — the money-and-checkout marathon",
    summary:
      "6/7 September: the pledge economics reversed, the three-step flow, wallets, the renames.",
    kind: "reference",
    source: "session-handoff-2026-09-07.md",
    date: "2026-09-07",
    section: "Running the company",
  },
  {
    title: "The favpoll story",
    summary: "The founding story, as first written.",
    kind: "reference",
    source: "founding-story.md",
    date: "2026-05-19",
    section: "Running the company",
  },
]

/** The slug a reference reads at: its filename without the extension. */
export function slugFor(entry: LibraryEntry): string {
  return entry.source.replace(/\.md$/i, "")
}

export function findBySlug(slug: string): LibraryEntry | undefined {
  return LIBRARY.find((e) => e.kind === "reference" && slugFor(e) === slug)
}

export function entriesIn(section: LibrarySection): LibraryEntry[] {
  return LIBRARY.filter((e) => e.section === section).sort((a, b) =>
    b.date.localeCompare(a.date)
  )
}
