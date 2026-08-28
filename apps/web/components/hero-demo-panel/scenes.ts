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
  /**
   * Sub-heading line for no-protagonist scenes — the cause's equivalent of a
   * protagonist's `context` ("1945 - 2024", "London Marathon run").
   * The real product stores this on favpolls.context for cause favpolls (see
   * the favpoll_cause_photo_context migration); the scene type had it only
   * inside `protagonist`, so cause scenes could not show one at all.
   */
  context?: string
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
        "My favourite colour was purple. I wore it to every occasion that mattered.",
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
        "Poppy wants to celebrate with ice cream. She has strong opinions about the best flavour. All proceeds go to Great Ormond Street, who took such good care of her little brother.",
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
    // ── Wedding: the celebration register's exemplar (founder, 2026-08-28).
    //
    //    THE BEHAVIOUR ALREADY EXISTS THERE. "Donations in lieu of favours"
    //    is standard at UK weddings, so favpoll is not introducing giving at
    //    a life event — it is improving something guests already do badly. A
    //    card on the table saying "we have donated to X" becomes something
    //    they take part in. That is a far easier sell than persuading anyone
    //    to run a game at a teenager's birthday.
    //
    //    It also suits the product's constraints better than any other
    //    celebration: table stationery is native (a tent card at each place
    //    setting needs no justification), guest counts and budgets are real,
    //    and the planning horizon is months — which is what the 90-day poll
    //    and the charity-onboarding window both want.
    //
    //    THE REGISTER STAYS BROAD. kind is "celebration" and the page still
    //    says birthdays, retirements, weddings. A wedding is the best single
    //    exemplar OF that breadth, not a narrowing of it.
    //
    //    celebrating_many, not celebrating_one — "Wedding" is already in that
    //    register in lib/registers, and getFavpollHeadline already gives it
    //    "Congratulations to". The couple needed no new modelling; even the
    //    first-name derivation splits on "&" already.
    kind: "celebration",
    occasion_type: "Wedding",
    opening_line: null,
    protagonist: {
      // ALEX & JORDAN, to match the portrait. public/demo/alex-jordan.jpg
      // arrived in #144 — "protagonist portraits for five of six hero demo
      // scenes" — and has sat unused ever since: a couple photograph
      // authored for a couple scene that was never built. Naming them
      // anything else would leave the asset and the scene disagreeing, which
      // is the drift this file exists to prevent.
      //
      // It reads as a couple without presuming which kind, which a wedding
      // exemplar should.
      name: "Alex & Jordan",
      // "At the boathouse" (founder, 2026-08-28), and short enough not to
      // wrap — which is why the venue-and-date version went. At phone width
      // it took two lines, and no binding of the date fixed the fact that a
      // subtitle taking two lines is a subtitle carrying too much.
      //
      // Lowercase, and descriptive rather than a name. That is the better
      // call for a second reason: the cause scene deliberately keeps St
      // Luke's "named but not branded" because a real name on a demo card
      // reads as endorsement. "At the boathouse" is not a venue's name at
      // all, so the question does not arise.
      //
      // The date is gone with it and is not missed. The field is only a
      // label — Poppy's is "Sweet Sixteen", which is not a date either.
      context: "At the boathouse",
      about:
        "The happy couple have requested donations to the WWF rather than gifts, given their passion for conservation.",
      photo_url: "/demo/alex-jordan.jpg",
    },
    poll: {
      id: "demo-poll-wedding",
      // THE HONEYMOON IS THE REVEAL, and it is why this topic beats every
      // other wedding candidate (founder, 2026-08-28).
      //
      // Cake was the first attempt and it failed a test worth naming: NEVER
      // PICK A TOPIC THAT COLLIDES WITH A CHOICE THE COUPLE HAS ALREADY MADE
      // AND PUT ON DISPLAY. There is a real cake in the room, chosen and paid
      // for and often made by family — so inviting guests to pick a different
      // favourite turns the poll into a referendum on it by proximity, and
      // the couple's answer placing second reads as a verdict rather than a
      // joke. Flowers fail the same test; first dance song fails it worst,
      // because that one actually gets played.
      //
      // A honeymoon collides with nothing. Better still, the couple's answer
      // is not competing with the guests' at all — it is NEWS. That turns the
      // reveal into something a room genuinely wants to unlock, which is the
      // withhold/reveal mechanic working at full strength rather than as a
      // formality. The About withholds it in as many words.
      //
      // First person and plural, the couple writing it in advance — the voice
      // the brand guide calls the most powerful version.
      // THE REVEAL RETRO-EXPLAINS THE CHARITY (founder, 2026-08-28), which is
      // the best thing about this exemplar. Reading down the card, WWF is
      // just a charity someone picked. Then the reveal says Chengdu and
      // pandas, and you understand WHY — the charity was never arbitrary,
      // you simply could not see the reason until you had unlocked it.
      //
      // That is the wizard's own charity guidance made visible: "pick one
      // that means something here." A demo where the charity is incidental
      // teaches the opposite.
      //
      // "will hopefully be", not "is" (founder wording, 2026-08-28), and it
      // solves the tense problem better than the "will be" it replaced. The
      // topic asks for a favourite holiday destination; they have not been
      // yet. The hope is not about whether they are GOING — that is booked —
      // it is about whether Chengdu turns out to be the favourite, which is
      // the honest answer to the question actually asked.
      personal_reveal:
        "Ours will hopefully be Chengdu. We're planning to visit the pandas on our honeymoon.",
      topic: {
        title: "Holiday destination",
        favourites: [
          { id: "hd-amalfi", label: "Amalfi Coast" },
          { id: "hd-amsterdam", label: "Amsterdam" },
          { id: "hd-bali", label: "Bali" },
          { id: "hd-barcelona", label: "Barcelona" },
          { id: "hd-chengdu", label: "Chengdu" },
          { id: "hd-cornwall", label: "Cornwall" },
          { id: "hd-croatia", label: "Croatia" },
          { id: "hd-cyprus", label: "Cyprus" },
          { id: "hd-edinburgh", label: "Edinburgh" },
          { id: "hd-greece", label: "Greece" },
          { id: "hd-iceland", label: "Iceland" },
          { id: "hd-ireland", label: "Ireland" },
          { id: "hd-italy", label: "Italy" },
          { id: "hd-japan", label: "Japan" },
          { id: "hd-lakes", label: "Lake District" },
          { id: "hd-lisbon", label: "Lisbon" },
          { id: "hd-maldives", label: "Maldives" },
          { id: "hd-morocco", label: "Morocco" },
          { id: "hd-newyork", label: "New York" },
          { id: "hd-norway", label: "Norway" },
          { id: "hd-paris", label: "Paris" },
          { id: "hd-portugal", label: "Portugal" },
          { id: "hd-santorini", label: "Santorini" },
          { id: "hd-scotland", label: "Scotland" },
          { id: "hd-srilanka", label: "Sri Lanka" },
          { id: "hd-thailand", label: "Thailand" },
          { id: "hd-tuscany", label: "Tuscany" },
          { id: "hd-venice", label: "Venice" },
          { id: "hd-vietnam", label: "Vietnam" },
          { id: "hd-yorkshire", label: "Yorkshire Dales" },
        ],
      },
    },
    charities: [
      {
        id: "ch-wwf",
        name: "WWF-UK",
        logo_url: null,
        registered_number: "1081247",
      },
    ],
    selectedIndex: 4,
    pledgeAmount: "£20",
    // LUMPY ON PURPOSE (founder, 2026-08-28: "the rankings don't seem very
    // realistic"). The old set ran 210/175/130/95/60/35 — a near-arithmetic
    // sequence, every gap 25 to 45, which is what authored numbers look like
    // and not what forty people pledging 5s, 10s and 20s look like. Real
    // standings are top-heavy and irregular.
    //
    // Chengdu sits LAST, on £30. A couple of guests happened to name it —
    // enough that it is on the board, nowhere near enough to be the room's
    // answer. That is truer than either extreme: absent, and the reveal has
    // nothing to land against; high, and it stops being a surprise.
    //
    // The total is the sum of these six. It has to be: sceneFavourites
    // derives the live display's total from `results`, so a scene whose
    // `total` said anything else would show one number on the phone and a
    // different one on the screen.
    results: [
      { label: "Italy", amount: "£185", widthPercent: 100 },
      { label: "Greece", amount: "£140", widthPercent: 76 },
      { label: "Japan", amount: "£110", widthPercent: 59 },
      { label: "New York", amount: "£75", widthPercent: 41 },
      { label: "Cornwall", amount: "£55", widthPercent: 30 },
      { label: "Chengdu", amount: "£30", widthPercent: 16 },
    ],
    total: "£595",
  },
  {
    // ── Fundraiser: a person doing a sponsored challenge. A Type, not a Who —
    //    so it keeps a protagonist (the runner). Register-wise it derives to
    //    `cause`, but it is nothing like a faceless appeal.
    //
    //    THE HOMEMADE TOPIC (founder, 2026-08-28). This scene is the site's
    //    one exemplar of a topic an organiser wrote themselves, which is why
    //    it is a mascot and not the favourite Dance it ran until now. Dance
    //    could sit in the catalogue tomorrow — it is a preference, like
    //    Colour or Season. A list of the specific objects Marcus's colleagues
    //    offered to lend him could not, and that is the whole point of it.
    //
    //    IT ALSO DECIDES SOMETHING, which no other scene does. A mascot
    //    actually rides the 26.2 miles, so a pledge here changes an outcome
    //    rather than recording an opinion — a reason to give more, and one
    //    that suits this register and no other. Do not spread it: the
    //    memorial and the wedding measure what people love, and should.
    //
    //    "LEADING WHEN HE SETS OFF", NOT "WINS" (founder, 2026-08-29: "the
    //    poll has to end before the marathon"). It did, and that was the
    //    defect. A consequence taken at the CLOSE forces the favpoll to end
    //    the day before the thing everyone cares about — where /memorials
    //    runs through and past the funeral and /celebrations through and
    //    past the wedding, both containing their event. It would also have
    //    cut off the "he did it" sponsorship, which is when a great deal of
    //    a sponsored fundraiser's money actually lands.
    //
    //    A snapshot fixes it and costs one clause, because the standings are
    //    live to anyone who has pledged: "leading" is a thing a supporter can
    //    go and look at, not a fiction written to dodge the problem. The
    //    urgency survives — pledge before race day or you have no say — and
    //    the poll runs on afterwards for the total. It is also how people
    //    really phrase these: nobody says "the winner of the poll", they say
    //    whoever is top when I set off comes with me.
    //
    //    FUNDRAISER_KEEPSAKE_DATA depends on this. It closes 3rd May, the
    //    week after the race, which only makes sense while the favpoll
    //    outlives the marathon. ──
    kind: "fundraiser",
    occasion_type: "Sponsored event",
    opening_line: null,
    protagonist: {
      name: "Marcus Bell",
      context: "London Marathon run",
      about:
        "Running his first marathon for the British Heart Foundation, in memory of his dad. Whichever mascot is leading when he sets off rides the whole 26.2 miles, pinned to his vest.",
      photo_url: "/demo/marcus.jpg",
    },
    poll: {
      id: "demo-poll-fundraiser",
      // The joke has something underneath it, and the reveal is where that
      // lands. The room backed the rubber duck because the rubber duck is
      // funny and funny raises money, which is true of every workplace
      // fundraiser; only after pledging do you find out what Marcus was
      // quietly hoping for. Second sentence does all the work and never says
      // anything heavy.
      personal_reveal:
        "Kevin the gnome. He stood in Dad's front garden for thirty years.",
      topic: {
        title: "Mascot",
        // EIGHT, where Colour has twelve and Holiday destination
        // twenty-eight. A homemade list should look homemade: nobody sits
        // down and writes thirty of these, and the short list is itself a
        // signal that no catalogue supplied it.
        favourites: [
          { id: "m-barnaby", label: "Barnaby the bear" },
          { id: "m-conker", label: "Conker" },
          { id: "m-dice", label: "Fluffy dice" },
          { id: "m-gnome", label: "Kevin the gnome" },
          { id: "m-heart", label: "Knitted heart" },
          { id: "m-2p", label: "Lucky 2p" },
          { id: "m-duck", label: "Rubber duck" },
          { id: "m-spoon", label: "Wooden spoon" },
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
    // Rubber duck (index 6) — a GUEST's pick, not Marcus's. Kevin is third,
    // the same shape Northern Soul had and Purple has on the memorial: the
    // demo selection must never land on the protagonist's own answer, or the
    // reveal is spent before it arrives.
    selectedIndex: 6,
    pledgeAmount: "£20",
    results: [
      { label: "Rubber duck", amount: "£240", widthPercent: 100 },
      { label: "Barnaby the bear", amount: "£190", widthPercent: 79 },
      { label: "Kevin the gnome", amount: "£150", widthPercent: 63 },
      { label: "Knitted heart", amount: "£110", widthPercent: 46 },
      { label: "Lucky 2p", amount: "£75", widthPercent: 31 },
      { label: "Fluffy dice", amount: "£45", widthPercent: 19 },
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
    context: "A sponsored dog walk · 5 miles",
    blurb:
      "A sponsored dog walk for our local hospice — pledge your favourite, and every penny goes to St Luke's.",
    poll: {
      id: "demo-poll-cause",
      // "helps St Luke's care for people" garden-paths — "St Luke's care" reads
      // as a noun before the verb arrives. Leading with the fact avoids that
      // and teaches the thing most people do not know about hospices.
      personal_reveal:
        "Hospice care is free. Every pledge helps St Luke's keep it that way.",
      topic: {
        // A REAL topic (2026-08-09). "Hot drink" was not one — the catalogue
        // has 135 topics and that was not among them, so the demo showed a
        // question nobody could pick, with ten items written by hand. Dog
        // breed is real, carries all 48 of its seeded favourites, and pairs
        // with the occasion: a sponsored dog walk asks this question of
        // itself. Ten chips left the picker looking sparse; 48 fills it the
        // way a guest's actually does.
        title: "Dog breed",
        favourites: [
          { id: "db-bassethound", label: "Basset Hound" },
          { id: "db-beagle", label: "Beagle" },
          { id: "db-bernesemountaindog", label: "Bernese Mountain Dog" },
          { id: "db-bichonfrise", label: "Bichon Frise" },
          { id: "db-bordercollie", label: "Border Collie" },
          { id: "db-borderterrier", label: "Border Terrier" },
          { id: "db-boxer", label: "Boxer" },
          { id: "db-britishbulldog", label: "British Bulldog" },
          {
            id: "db-cavalierkingcharlesspaniel",
            label: "Cavalier King Charles Spaniel",
          },
          { id: "db-chihuahua", label: "Chihuahua" },
          { id: "db-cockapoo", label: "Cockapoo" },
          { id: "db-cockerspaniel", label: "Cocker Spaniel" },
          { id: "db-corgi", label: "Corgi" },
          { id: "db-dachshund", label: "Dachshund" },
          { id: "db-dalmatian", label: "Dalmatian" },
          { id: "db-dobermann", label: "Dobermann" },
          { id: "db-englishsetter", label: "English Setter" },
          { id: "db-frenchbulldog", label: "French Bulldog" },
          { id: "db-germanshepherd", label: "German Shepherd" },
          { id: "db-goldenretriever", label: "Golden Retriever" },
          { id: "db-greatdane", label: "Great Dane" },
          { id: "db-greyhound", label: "Greyhound" },
          { id: "db-jackrussell", label: "Jack Russell" },
          { id: "db-labradoodle", label: "Labradoodle" },
          { id: "db-labrador", label: "Labrador" },
          { id: "db-lurcher", label: "Lurcher" },
          { id: "db-newfoundland", label: "Newfoundland" },
          { id: "db-oldenglishsheepdog", label: "Old English Sheepdog" },
          { id: "db-pointer", label: "Pointer" },
          { id: "db-pomeranian", label: "Pomeranian" },
          { id: "db-poodle", label: "Poodle" },
          { id: "db-pug", label: "Pug" },
          { id: "db-rottweiler", label: "Rottweiler" },
          { id: "db-roughcollie", label: "Rough Collie" },
          { id: "db-saintbernard", label: "Saint Bernard" },
          { id: "db-samoyed", label: "Samoyed" },
          { id: "db-schnauzer", label: "Schnauzer" },
          { id: "db-shihtzu", label: "Shih Tzu" },
          { id: "db-siberianhusky", label: "Siberian Husky" },
          { id: "db-spaniel", label: "Spaniel" },
          { id: "db-springerspaniel", label: "Springer Spaniel" },
          {
            id: "db-staffordshirebullterrier",
            label: "Staffordshire Bull Terrier",
          },
          { id: "db-vizsla", label: "Vizsla" },
          { id: "db-weimaraner", label: "Weimaraner" },
          { id: "db-welshterrier", label: "Welsh Terrier" },
          { id: "db-westhighlandterrier", label: "West Highland Terrier" },
          { id: "db-whippet", label: "Whippet" },
          { id: "db-yorkshireterrier", label: "Yorkshire Terrier" },
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
    // Cockapoo — the runner-up in the standings, so the pick the demo makes
    // is one the results then show climbing. Same pattern as the memorial
    // scene, whose pick is Blue behind Purple.
    selectedIndex: 10,
    pledgeAmount: "£10",
    results: [
      { label: "Labrador", amount: "£240", widthPercent: 100 },
      { label: "Cockapoo", amount: "£205", widthPercent: 85 },
      { label: "Border Collie", amount: "£120", widthPercent: 50 },
      { label: "Greyhound", amount: "£85", widthPercent: 35 },
      { label: "Jack Russell", amount: "£55", widthPercent: 23 },
      { label: "Whippet", amount: "£35", widthPercent: 15 },
      { label: "Springer Spaniel", amount: "£30", widthPercent: 13 },
      { label: "Dachshund", amount: "£25", widthPercent: 10 },
      { label: "Golden Retriever", amount: "£20", widthPercent: 8 },
      { label: "Pug", amount: "£15", widthPercent: 6 },
    ],
    total: "£830",
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
