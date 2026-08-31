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
  /**
   * A faceless cause's own photo — favpolls.photo_url on a cause favpoll,
   * which CauseHero renders in the avatar slot. Null = no avatar, as on the
   * real page.
   */
  photo_url?: string | null
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
  /** favpolls.goal_amount — pounds; null = no goal (most favpolls). */
  goal_amount: number | null

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
    goal_amount: null,
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
    goal_amount: null,
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
    goal_amount: null,
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
    //    THE HOMEMADE TOPIC (founder, 2026-08-28), and the shape it took five
    //    goes to find. Dance, a Mascot, his dad's own objects, a chippy
    //    order, a cake costume — each failed one of FOUR tests that have to
    //    pass together. Worth keeping, because the next person to improve
    //    this scene will re-derive them otherwise.
    //
    //    1. HOMEMADE means the topic could only ever exist for THIS favpoll,
    //       not merely that the catalogue lacks it today. Dance and chippy
    //       order fail: they are good topics, which is exactly why they would
    //       be catalogue topics (founder: "it feels like it should already be
    //       a topic").
    //    2. THE GUEST MUST HOLD A REAL PREFERENCE. Mascots and a dead man's
    //       pockets fail: a gnome against a rubber duck, or a hankie against
    //       a keyring, gives the guest nothing of their own to say (founder:
    //       "some of the mementos are meaningless and create a false
    //       choice").
    //    3. THE REVEAL MUST BE WRITABLE ON DAY ONE. Any topic that IS the
    //       outcome fails: the organiser's "favourite" becomes a bet on an
    //       undecided result rather than a fact about them.
    //    4. THE CONSEQUENCE MUST BE SOURCEABLE AT THE LAST MINUTE. The cake
    //       costume died here (founder: "how is Marcus supposed to source
    //       different cake costumes on the day of the marathon?"). A costume
    //       is ordered weeks ahead, which drags the decision back before the
    //       race and revives the very problem test 3 solved.
    //
    //    A HAT passes all four, and it is test 4 that it passes where
    //    everything else failed: a hat costs a fiver, packs flat, and Marcus
    //    can plausibly own all eight and pick on the morning. That is exactly
    //    the property that made the founder's original illustration work
    //    (2026-08-29: "favourite colour and the leading colour will be
    //    Marcus's socks on the run") — socks and hats are both bought the
    //    night before.
    //
    //    The rule underneath it: a REAL favourite, with the winner made
    //    physical. The guest picks a hat, which is a visual, funny, genuinely
    //    held preference; the winner becomes what he wears for 26.2 miles;
    //    and the homemade-ness lives in the FRAMING, because nobody has a
    //    favourite hat in the abstract — it only means anything as "which
    //    should he wear", which no catalogue will ever stock.
    //
    //    "MARATHON HAT", NOT "HAT" (founder, 2026-08-29). A hat is a thing
    //    that exists generically and reads like a catalogue entry; a marathon
    //    hat only means anything for this one event, which is the homemade
    //    test stated exactly. It survives the three transformations the
    //    product puts a topic title through — "Favourite marathon hat", "pick
    //    your favourite marathon hat", "+5 more marathon hats" — which is
    //    what rules out anything possessive.
    //
    //    A NOTE ON THE RECORD, since it was argued the other way earlier: a
    //    homemade topic contributes nothing to the all-time rankings, and
    //    that is true of EVERY homemade topic by definition — the grandad
    //    stories on /features aggregate to nothing either. It is a property
    //    of the create path, not a fault in this scene.
    //
    //    IT DECIDES SOMETHING, which no other scene does. Do not spread it:
    //    the memorial and the wedding measure what people love and stop
    //    there, and should.
    kind: "fundraiser",
    occasion_type: "Sponsored event",
    opening_line: null,
    protagonist: {
      name: "Marcus Bell",
      context: "London Marathon run",
      about:
        "Running his first marathon for Mind. Whichever hat is leading on the day, he'll wear for all 26.2 miles.",
      photo_url: "/demo/marcus.jpg",
    },
    poll: {
      id: "demo-poll-fundraiser",
      // A REMARK, NOT HIS FAVOURITE (founder, 2026-08-29: "the reveal
      // shouldn't be Marcus' favourite. it should be a remark or comment").
      // Right, and for a reason worth keeping: on a poll with a consequence,
      // the protagonist's own favourite is hollow. Marcus has no real stake
      // in hats — he wears whatever the room picks — so disclosing that he
      // likes the fez only invites "then why not just wear the fez?". The
      // memorial and the wedding disclose a favourite because theirs are
      // facts the poll cannot touch; his is not.
      //
      // A remark has none of that. It is writable on day one, it cannot
      // campaign, and it gives back something better than a preference
      // nobody asked about.
      //
      // The exclamation mark is deliberate and allowed here. The brand rule
      // bans them in anything MEMORIAL-adjacent; this is a man in a sombrero
      // running for a mental health charity, and the joke is the point.
      //
      // THIS IS THE ONLY SURFACE DEMONSTRATING isMessageReveal. The opening
      // sentence names no hat, so the poster's step 3 and the unlock pill
      // both say "message" rather than "favourite", with no field set. If a
      // future edit gives Marcus a favourite back, that capability goes
      // undemonstrated again — see lib/mechanic-steps.ts.
      personal_reveal:
        "Thank you for your pledge. If we reach the goal, I'll eat the hat as well! (Only kidding)",
      topic: {
        title: "Marathon hat",
        // EIGHT, where Colour has twelve and Holiday destination
        // twenty-eight. A homemade list should look homemade: nobody sits
        // down and writes thirty of these, and the short list is itself a
        // signal that no catalogue supplied it.
        favourites: [
          { id: "h-beret", label: "Beret" },
          { id: "h-bowler", label: "Bowler" },
          { id: "h-deerstalker", label: "Deerstalker" },
          { id: "h-fez", label: "Fez" },
          { id: "h-sombrero", label: "Sombrero" },
          { id: "h-stetson", label: "Stetson" },
          { id: "h-tophat", label: "Top hat" },
          { id: "h-viking", label: "Viking helmet" },
        ],
      },
    },
    charities: [
      {
        // Mind (founder, 2026-08-29: "it could be a silly idea for a mental
        // health charity to choose which hat Marcus should wear"), and the
        // pairing is better than a joke. Being visible and refusing to take
        // yourself too seriously is what mental health campaigns actually run
        // on, so a ridiculous hat is on-message rather than at odds with the
        // cause.
        //
        // It also takes the last of the memorial shadow off this page. The
        // scene ran "in memory of his dad" for a while, which sat close to
        // /memorials; Marcus now needs no bereavement to justify a marathon.
        //
        // 219830 is from scripts/seed.ts, the repo's own charity data, not
        // from memory.
        id: "ch-mind",
        name: "Mind",
        logo_url: null,
        registered_number: "219830",
      },
    ],
    // Sombrero (index 4) — a GUEST's pick, and the one a room lands on.
    //
    // Nothing has to be dodged here, unlike the memorial and the wedding: with
    // the reveal a remark rather than a favourite, Marcus has no answer for a
    // selection to collide with. The sombrero is simply the funniest thing to
    // land on, and the standings agree with it.
    // £1,000, with £810 raised: 81% and short. The goal is what makes this a
    // FUNDRAISER rather than a poll with a charity attached — /fundraisers'
    // copy says "reach the goal" and Marcus's reveal says "If we reach the
    // goal", and until 2026-08-30 neither pointed at a number the page
    // showed. Unreached on purpose: a reached goal would make the reveal's
    // condition a past event, and the landing's goal vignette already owns
    // the crossing moment. Agrees with DisplayStill's fallback DEMO_GOAL.
    goal_amount: 1000,
    selectedIndex: 4,
    pledgeAmount: "£20",
    results: [
      { label: "Sombrero", amount: "£240", widthPercent: 100 },
      { label: "Viking helmet", amount: "£190", widthPercent: 79 },
      { label: "Fez", amount: "£150", widthPercent: 63 },
      { label: "Top hat", amount: "£110", widthPercent: 46 },
      { label: "Deerstalker", amount: "£75", widthPercent: 31 },
      { label: "Beret", amount: "£45", widthPercent: 19 },
    ],
    total: "£810",
  },
  {
    // ── Cause: no person honoured; the money still goes to a registered
    //    charity (mirrors the live subject="cause" shape). ──
    kind: "cause",
    occasion_type: "Cause",
    // "Walkies for St Mark's Hospice" (2026-08-31, founder asked for a better
    // opening line than the register's "In support of"). The word every dog
    // in Britain knows, and it makes the card, the wallet card and the
    // keepsake all say what the event is before the context line does. The
    // fundraiser register carries a light touch; a hospice's sponsored dog
    // walk is exactly where it belongs.
    opening_line: "Walkies for",
    protagonist: null,
    // Hospice, not YoungMinds (founder, 2026-08-06): hospices are the channel
    // being approached next, and this scene carries the whole guest arc in
    // ProcessOverview, so it is the example most visitors will read.
    //
    // FICTIONAL, FOR NOW (founder, 2026-08-31). It was St Luke's (Cheshire)
    // Hospice — a real prospect, named but not branded, with their real
    // charity number. Naming a prospect on the homepage before a conversation
    // is the wrong opening, so the scene wears a made-up hospice until there
    // is a real one to name: no number (the card prints it, and a fake one
    // is worse than none), no logo. When a hospice says yes, this is a name,
    // a number and a logo_url.
    //
    // THE HEADING IS THE CAUSE, the context is the event. "Walking for St
    // Luke's" rendered as "In support of / Walking for St Luke's" — the
    // register prefix doubled the verb.
    heading: "St Mark's Hospice",
    eyebrow: "A cause",
    // No distance (founder, 2026-08-31): "· 5 miles" wrapped the context
    // line on a phone and added nothing the walk needs.
    context: "Sponsored dog walk",
    // The About and the reveal are the founder's, verbatim (2026-08-31).
    blurb:
      "5 miles for our local hospice. Pledge your favourite biscuit and every penny goes to St Mark’s.",
    // BISCUIT, THE THERAPY DOG. A faceless cause has no avatar on the real
    // page unless it uploads one; this one has the thing itself — a beagle
    // mid-walk — which says "sponsored dog walk" before a word is read and
    // pairs with the topic. (Founder's photo, 2026-08-31.)
    photo_url: "/demo/biscuit.jpg",
    poll: {
      id: "demo-poll-cause",
      // A MESSAGE, NOT A FAVOURITE (founder, 2026-08-31). The opening sentence
      // names Biscuit the dog, not a biscuit, so isMessageReveal is true and
      // the copy says "A message will be revealed" — and it is one: the dog
      // is named after his favourite treat, and the walkers' pick decides
      // which treat he gets. A cause cannot bet on its own poll (the Marcus
      // lesson); this gives something back without doing so.
      personal_reveal:
        "Our favourite is Biscuit, our therapy dog. Named after his favourite treat, he’s a good boy who can have one after the walk.",
      topic: {
        // BISCUIT (founder, 2026-08-31), and the dog is named after it. A real
        // catalogue topic carrying all 31 of its seeded favourites, as Dog
        // breed carried its 48 before it — a demo whose picker is the real
        // list, not a hand-written ten.
        title: "Biscuit",
        favourites: [
          { id: "b-biscoff", label: "Biscoff" },
          { id: "b-bourbon", label: "Bourbon" },
          { id: "b-chocoleibniz", label: "Choco Leibniz" },
          { id: "b-chocolatechipcookie", label: "Chocolate chip cookie" },
          { id: "b-chocolatedigestive", label: "Chocolate digestive" },
          { id: "b-chocolatefinger", label: "Chocolate finger" },
          { id: "b-custardcream", label: "Custard cream" },
          { id: "b-digestive", label: "Digestive" },
          { id: "b-figroll", label: "Fig roll" },
          { id: "b-foxscrunchcream", label: "Fox's Crunch Cream" },
          { id: "b-garibaldi", label: "Garibaldi" },
          { id: "b-gingernut", label: "Ginger nut" },
          { id: "b-gingerbread", label: "Gingerbread" },
          { id: "b-hobnob", label: "Hobnob" },
          { id: "b-icedgems", label: "Iced gems" },
          { id: "b-jaffacake", label: "Jaffa Cake" },
          { id: "b-jammiedodger", label: "Jammie Dodger" },
          { id: "b-lemonpuff", label: "Lemon puff" },
          { id: "b-maltedmilk", label: "Malted milk" },
          { id: "b-marylandcookie", label: "Maryland cookie" },
          { id: "b-nicebiscuit", label: "Nice biscuit" },
          { id: "b-oreo", label: "Oreo" },
          { id: "b-partyring", label: "Party ring" },
          { id: "b-penguin", label: "Penguin" },
          { id: "b-pinkwafer", label: "Pink Wafer" },
          { id: "b-richtea", label: "Rich Tea" },
          { id: "b-shortbread", label: "Shortbread" },
          { id: "b-tunnockscaramelwafer", label: "Tunnock's Caramel Wafer" },
          { id: "b-tunnocksteacake", label: "Tunnock's Tea Cake" },
          { id: "b-viennesewhirl", label: "Viennese Whirl" },
          { id: "b-wagonwheel", label: "Wagon Wheel" },
        ],
      },
    },
    charities: [
      {
        // Fictional (see the scene note): no number, because the card prints
        // it and a made-up charity number is worse than none.
        id: "ch-stmarks",
        name: "St Mark's Hospice",
        logo_url: null,
        registered_number: null,
      },
    ],
    // Hobnob — the runner-up in the standings, so the pick the demo makes is
    // one the results then show climbing. Same pattern as the memorial
    // scene, whose pick is Blue behind Purple. Index into the alphabetical
    // favourites above.
    goal_amount: null,
    selectedIndex: 13,
    pledgeAmount: "£10",
    // The total is the sum of these ten — sceneFavourites derives the live
    // display's total from `results`.
    results: [
      { label: "Chocolate digestive", amount: "£240", widthPercent: 100 },
      { label: "Hobnob", amount: "£205", widthPercent: 85 },
      { label: "Custard cream", amount: "£120", widthPercent: 50 },
      { label: "Jaffa Cake", amount: "£85", widthPercent: 35 },
      { label: "Bourbon", amount: "£55", widthPercent: 23 },
      { label: "Shortbread", amount: "£35", widthPercent: 15 },
      { label: "Jammie Dodger", amount: "£30", widthPercent: 13 },
      { label: "Rich Tea", amount: "£25", widthPercent: 10 },
      { label: "Digestive", amount: "£20", widthPercent: 8 },
      { label: "Ginger nut", amount: "£15", widthPercent: 6 },
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
  { label: "Celebration", kind: "celebration" },
  { label: "Fundraiser", kind: "fundraiser" },
  { label: "Memorial", kind: "memorial" },
  { label: "Cause", kind: "cause" },
]

export const NAV_TABS: NavTab[] = NAV_TAB_DEFS.map((tab) => ({
  ...tab,
  sceneIndex: Math.max(
    0,
    SCENES.findIndex((s) => s.kind === tab.kind)
  ),
}))
