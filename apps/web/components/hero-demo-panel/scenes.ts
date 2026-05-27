import type { PollResultItem } from "@/components/favpoll-card/types"

export type Phase =
  | "arriving" // step 1 — options stagger in
  | "selected" // step 2 — one option highlighted
  | "pledge-panel" // step 3 — amount buttons appear
  | "amount-picked" // step 4 — amount highlighted
  | "pledging" // step 5 — button depressed
  | "confirmed" // step 5 — toast visible
  | "clearing" // step 6 — fade transition
  | "reveal" // step 7–9 — reveal + results

/**
 * Supabase-aligned demo scene.
 *
 * Data fields mirror the actual DB shape used by EventCard / FavpollCard:
 *   - protagonist → protagonists row
 *   - poll        → event_polls row + topics + topic_items
 *   - charities   → charities rows via event_charities
 *
 * Demo-only fields (avatarColor, selectedIndex, pledgeAmount, tagline,
 * results, total) carry animation or display data that has no DB equivalent.
 */
export type HeroScene = {
  // ── Supabase-aligned ──────────────────────────────────────────────────────
  opening_line: string
  protagonist: {
    name: string
    photo_url: string | null
  }
  poll: {
    id: string
    personal_reveal: string
    topic: {
      title: string
      topic_items: { id: string; label: string }[]
    }
  }
  charities: {
    id: string
    name: string
    logo_url: string | null
    registered_number: string | null
  }[]

  // ── Demo-only ─────────────────────────────────────────────────────────────
  /** Background colour for the avatar circle in the demo card */
  avatarColor: string
  /** Index into poll.topic.topic_items — the item selected in the animation */
  selectedIndex: number
  /** Pledge amount shown in the demo animation e.g. "£10" */
  pledgeAmount: string
  /** Custom framing line shown above the option grid in the demo */
  tagline: string
  /** Results snapshot shown during the reveal phase */
  results: PollResultItem[]
  /** Formatted total raised e.g. "£1,005" */
  total: string
}

// ── Scene data ───────────────────────────────────────────────────────────────

export const SCENES: HeroScene[] = [
  {
    opening_line: "Memorial",
    protagonist: { name: "Belinda Hartley", photo_url: null },
    poll: {
      id: "demo-poll-0",
      personal_reveal:
        "Mine was purple. I wore it to every occasion that mattered.",
      topic: {
        title: "Colour",
        topic_items: [
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
    avatarColor: "#7F77DD",
    selectedIndex: 1,
    pledgeAmount: "£10",
    tagline: "Belinda had a colour she always wore — do you?",
    results: [
      { label: "Purple", amount: "£350", widthPercent: 78 },
      { label: "Blue", amount: "£220", widthPercent: 51 },
      { label: "Red", amount: "£165", widthPercent: 38 },
      { label: "Green", amount: "£120", widthPercent: 28 },
      { label: "Pink", amount: "£90", widthPercent: 21 },
      { label: "Black", amount: "£60", widthPercent: 14 },
    ],
    total: "£1,005",
  },
  {
    opening_line: "Birthday",
    protagonist: { name: "Poppy Chen", photo_url: null },
    poll: {
      id: "demo-poll-1",
      personal_reveal:
        "Mint choc chip, of course. What do you mean you didn't know?",
      topic: {
        title: "Ice cream",
        topic_items: [
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
    avatarColor: "#E87D6A",
    selectedIndex: 15,
    pledgeAmount: "£20",
    tagline: "Tell us your favourite ice cream to find out Poppy's.",
    results: [
      { label: "Vanilla", amount: "£210", widthPercent: 84 },
      { label: "Chocolate", amount: "£175", widthPercent: 71 },
      { label: "Strawberry", amount: "£130", widthPercent: 52 },
      { label: "Mint choc chip", amount: "£95", widthPercent: 38 },
      { label: "Salted caramel", amount: "£60", widthPercent: 24 },
      { label: "Pistachio", amount: "£35", widthPercent: 14 },
    ],
    total: "£705",
  },
  {
    opening_line: "Retirement",
    protagonist: { name: "Ros Turner", photo_url: null },
    poll: {
      id: "demo-poll-2",
      personal_reveal:
        "Autumn, always. Childhood memories of walking through leaves.",
      topic: {
        title: "Season",
        topic_items: [
          { id: "s-autumn", label: "Autumn" },
          { id: "s-spring", label: "Spring" },
          { id: "s-summer", label: "Summer" },
          { id: "s-winter", label: "Winter" },
        ],
      },
    },
    charities: [
      {
        id: "ch-wt",
        name: "The Woodland Trust",
        logo_url: null,
        registered_number: "294344",
      },
    ],
    avatarColor: "#4AAB8A",
    selectedIndex: 2,
    pledgeAmount: "£50",
    tagline: "Which time of year do you love? Is it the same as Ros's?",
    results: [
      { label: "Spring", amount: "£290", widthPercent: 71 },
      { label: "Summer", amount: "£195", widthPercent: 48 },
      { label: "Autumn", amount: "£140", widthPercent: 35 },
      { label: "Winter", amount: "£75", widthPercent: 18 },
    ],
    total: "£700",
  },
  {
    opening_line: "Engagement",
    protagonist: { name: "Alex & Jordan", photo_url: null },
    poll: {
      id: "demo-poll-3",
      personal_reveal:
        "The giant panda. They met at a conservation centre in Chengdu. Did you really need to ask?",
      topic: {
        title: "Animal",
        topic_items: [
          { id: "a-afrelephant", label: "African elephant" },
          { id: "a-arcticfox", label: "Arctic fox" },
          { id: "a-barnowl", label: "Barn owl" },
          { id: "a-bluewhale", label: "Blue whale" },
          { id: "a-dolphin", label: "Bottlenose dolphin" },
          { id: "a-cheetah", label: "Cheetah" },
          { id: "a-empenguin", label: "Emperor penguin" },
          { id: "a-flamingo", label: "Flamingo" },
          { id: "a-giantotter", label: "Giant otter" },
          { id: "a-giantpanda", label: "Giant panda" },
          { id: "a-giraffe", label: "Giraffe" },
          { id: "a-goldeneagle", label: "Golden eagle" },
          { id: "a-gorilla", label: "Gorilla" },
          { id: "a-hare", label: "Hare" },
          { id: "a-hedgehog", label: "Hedgehog" },
          { id: "a-humpback", label: "Humpback whale" },
          { id: "a-jaguar", label: "Jaguar" },
          { id: "a-kingfisher", label: "Kingfisher" },
          { id: "a-leopard", label: "Leopard" },
          { id: "a-lion", label: "Lion" },
          { id: "a-mantaray", label: "Manta ray" },
          { id: "a-mtgorilla", label: "Mountain gorilla" },
          { id: "a-narwhal", label: "Narwhal" },
          { id: "a-octopus", label: "Octopus" },
          { id: "a-orangutan", label: "Orangutan" },
          { id: "a-orca", label: "Orca" },
          { id: "a-peregrine", label: "Peregrine falcon" },
          { id: "a-polarbear", label: "Polar bear" },
          { id: "a-redfox", label: "Red fox" },
          { id: "a-redpanda", label: "Red panda" },
          { id: "a-redsquirrel", label: "Red squirrel" },
          { id: "a-seaturtle", label: "Sea turtle" },
          { id: "a-snowleopard", label: "Snow leopard" },
          { id: "a-tiger", label: "Tiger" },
          { id: "a-wolf", label: "Wolf" },
        ],
      },
    },
    charities: [
      {
        id: "ch-wwf",
        name: "WWF",
        logo_url: null,
        registered_number: "1081247",
      },
    ],
    avatarColor: "#D4936B",
    selectedIndex: 4,
    pledgeAmount: "£20",
    tagline: "What's your favourite animal? Alex & Jordan have one…",
    results: [
      { label: "Giant panda", amount: "£310", widthPercent: 74 },
      { label: "African elephant", amount: "£200", widthPercent: 48 },
      { label: "Bottlenose dolphin", amount: "£160", widthPercent: 38 },
      { label: "Snow leopard", amount: "£130", widthPercent: 31 },
      { label: "Sea turtle", amount: "£90", widthPercent: 22 },
      { label: "Tiger", amount: "£60", widthPercent: 14 },
    ],
    total: "£950",
  },
  {
    opening_line: "Leaving do",
    protagonist: { name: "Dave Kowalski", photo_url: null },
    poll: {
      id: "demo-poll-4",
      personal_reveal:
        "Bourbon. He kept a not-so-secret stash in his desk drawer.",
      topic: {
        title: "Biscuit",
        topic_items: [
          { id: "b-biscoff", label: "Biscoff" },
          { id: "b-bourbon", label: "Bourbon" },
          { id: "b-carwafer", label: "Caramel wafer" },
          { id: "b-chocdig", label: "Chocolate digestive" },
          { id: "b-chochobnob", label: "Chocolate Hobnob" },
          { id: "b-club", label: "Club" },
          { id: "b-custardcream", label: "Custard cream" },
          { id: "b-digestive", label: "Digestive" },
          { id: "b-figroll", label: "Fig roll" },
          { id: "b-fruitshor", label: "Fruit shortcake" },
          { id: "b-garibaldi", label: "Garibaldi" },
          { id: "b-gingernut", label: "Ginger nut" },
          { id: "b-hobnob", label: "Hobnob" },
          { id: "b-icedgem", label: "Iced gem" },
          { id: "b-jaffacake", label: "Jaffa Cake" },
          { id: "b-jammydodger", label: "Jammy Dodger" },
          { id: "b-leibniz", label: "Leibniz" },
          { id: "b-maltedmilk", label: "Malted milk" },
          { id: "b-maryland", label: "Maryland cookie" },
          { id: "b-nice", label: "Nice" },
          { id: "b-oreo", label: "Oreo" },
          { id: "b-partyring", label: "Party ring" },
          { id: "b-penguin", label: "Penguin" },
          { id: "b-pinkwafer", label: "Pink wafer" },
          { id: "b-richtea", label: "Rich Tea" },
          { id: "b-shortbread", label: "Shortbread" },
          { id: "b-shortcake", label: "Shortcake" },
          { id: "b-tunnocks", label: "Tunnock's Tea Cake" },
          { id: "b-viennese", label: "Viennese whirl" },
          { id: "b-viscount", label: "Viscount" },
          { id: "b-wagonwheel", label: "Wagon Wheel" },
          { id: "b-wafer", label: "Wafer" },
        ],
      },
    },
    charities: [
      {
        id: "ch-cr",
        name: "Comic Relief",
        logo_url: null,
        registered_number: "326568",
      },
    ],
    avatarColor: "#534AB7",
    selectedIndex: 7,
    pledgeAmount: "£10",
    tagline:
      "We've had eight years of Dave's biscuit opinions. What about yours?",
    results: [
      { label: "Bourbon", amount: "£185", widthPercent: 69 },
      { label: "Digestive", amount: "£145", widthPercent: 54 },
      { label: "Hobnob", amount: "£100", widthPercent: 38 },
      { label: "Custard cream", amount: "£75", widthPercent: 28 },
      { label: "Shortbread", amount: "£50", widthPercent: 18 },
      { label: "Ginger nut", amount: "£30", widthPercent: 11 },
    ],
    total: "£585",
  },
  {
    opening_line: "Graduation",
    protagonist: { name: "James Okafor", photo_url: null },
    poll: {
      id: "demo-poll-5",
      personal_reveal: "Jurassic Park.",
      topic: {
        title: "Film",
        topic_items: [
          { id: "f-2001", label: "2001: A Space Odyssey" },
          { id: "f-alien", label: "Alien" },
          { id: "f-amadeus", label: "Amadeus" },
          { id: "f-apocalypse", label: "Apocalypse Now" },
          { id: "f-bttf", label: "Back to the Future" },
          { id: "f-bladerunner", label: "Blade Runner" },
          { id: "f-casablanca", label: "Casablanca" },
          { id: "f-cityofgod", label: "City of God" },
          { id: "f-drstrange", label: "Dr. Strangelove" },
          { id: "f-et", label: "E.T." },
          {
            id: "f-eternalsun",
            label: "Eternal Sunshine of the Spotless Mind",
          },
          { id: "f-fargo", label: "Fargo" },
          { id: "f-forrestgump", label: "Forrest Gump" },
          { id: "f-goodfellas", label: "Goodfellas" },
          { id: "f-itswonderful", label: "It's a Wonderful Life" },
          { id: "f-jurassic", label: "Jurassic Park" },
          { id: "f-lawrence", label: "Lawrence of Arabia" },
          { id: "f-leon", label: "Leon" },
          { id: "f-montypython", label: "Monty Python's Life of Brian" },
          { id: "f-nocountry", label: "No Country for Old Men" },
          { id: "f-parasite", label: "Parasite" },
          { id: "f-psycho", label: "Psycho" },
          { id: "f-pulpfiction", label: "Pulp Fiction" },
          { id: "f-rearwindow", label: "Rear Window" },
          { id: "f-schindlers", label: "Schindler's List" },
          { id: "f-singin", label: "Singin' in the Rain" },
          { id: "f-spiritedaway", label: "Spirited Away" },
          { id: "f-godfather", label: "The Godfather" },
          { id: "f-shawshank", label: "The Shawshank Redemption" },
          { id: "f-silencelambs", label: "The Silence of the Lambs" },
          { id: "f-trumanshow", label: "The Truman Show" },
          { id: "f-wizardofoz", label: "The Wizard of Oz" },
          { id: "f-vertigo", label: "Vertigo" },
          { id: "f-whiplash", label: "Whiplash" },
        ],
      },
    },
    charities: [
      {
        id: "ch-pt",
        name: "The Prince's Trust",
        logo_url: null,
        registered_number: "1079675",
      },
    ],
    avatarColor: "#5B9BD5",
    selectedIndex: 12,
    pledgeAmount: "£20",
    tagline:
      "James' favourite film was the reason he applied to study engineering — what's yours?",
    results: [
      { label: "The Shawshank Redemption", amount: "£280", widthPercent: 72 },
      { label: "Jurassic Park", amount: "£240", widthPercent: 61 },
      { label: "Forrest Gump", amount: "£185", widthPercent: 48 },
      { label: "The Godfather", amount: "£150", widthPercent: 38 },
      { label: "Pulp Fiction", amount: "£110", widthPercent: 28 },
      { label: "Back to the Future", amount: "£65", widthPercent: 17 },
    ],
    total: "£1,030",
  },
]

export const OCCASION_CHIPS = SCENES.map((s, i) => ({
  label: s.opening_line,
  index: i,
}))

export const PLEDGE_AMOUNTS = ["£5", "£10", "£20", "£50"]

export const SCENE_EYEBROWS = [
  "In memory of someone special",
  "On the birthday they'll always remember",
  "After a lifetime of good work",
  "For the yes that changes everything",
  "For the one who's moving on",
  "As they take their next step",
]
