import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { FavpollSheet } from "./index"
import type {
  Charity,
  FavpollPollWithItems,
  FavpollWithDetails,
} from "@favpoll/types"

// THE SHEET IS THE FAVPOLL PAGE, and the live display is the same sheet in
// a room shell rather than a second surface. That is the whole point of the
// component and the reason it is worth seeing in isolation: `presentation`
// decides whether you are looking at a guest's phone or a projector, and
// almost everything else follows from it.
//
// The fixture is lifted from components/favpoll-sheet/__tests__ rather than
// invented, so a story and its test describe the same favpoll.

const CHARITY: Charity = {
  id: "charity-1",
  name: "Ocean Trust",
  description: null,
  logo_url: null,
  registered_number: null,
  created_at: "2024-01-01T00:00:00Z",
}

const FAVPOLL: FavpollWithDetails = {
  id: "favpoll-1",
  occasion_type: null,
  opening_line: null,
  market: "en-GB",
  created_by: "user-1",
  closes_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  original_closes_at: null,
  hard_close_at: null,
  extension_count: 0,
  closed_at: null,
  total_raised: 0,
  is_private: false,
  is_plural: null,
  is_listed: true,
  category: "fundraiser",
  grouping: "individual",
  created_at: "2024-01-01T00:00:00Z",
  favpoll_charities: [{ charities: CHARITY }],
  protagonist_id: "prot-1",
  subject: "someone",
  cause_label: null,
  description: null,
  protagonists: {
    id: "prot-1",
    name: "Alice Pemberton",
    context: "1943 – 2026",
    about: null,
    photo_url: null,
    pronoun: "she",
    created_by: "user-1",
    created_at: "2024-01-01T00:00:00Z",
  },
}

const POLL: FavpollPollWithItems = {
  id: "poll-1",
  favpoll_id: "favpoll-1",
  topic_id: "topic-1",
  personal_note: "Hers was Blue. Her bathroom was full of dolphin pictures.",
  created_at: "2024-01-01T00:00:00Z",
  topics: {
    id: "topic-1",
    title: "Colour",
    description: null,
    is_finite: false,
    is_active: true,
    created_by: null,
    created_at: "2024-01-01T00:00:00Z",
    favourites: [
      { id: "i1", label: "Blue", topic_id: "topic-1" },
      { id: "i2", label: "Green", topic_id: "topic-1" },
      { id: "i3", label: "Yellow", topic_id: "topic-1" },
    ] as FavpollPollWithItems["topics"]["favourites"],
  },
}

const WALL = [
  { id: "w1", name: "Priya", labels: ["Blue"], created_at: "2026-10-14" },
  { id: "w2", name: null, labels: ["Green"], created_at: "2026-10-13" },
  { id: "w3", name: "Tom", labels: ["Blue"], created_at: "2026-10-12" },
]

const meta = {
  title: "FavpollSheet/FavpollSheet",
  component: FavpollSheet,
  parameters: { layout: "fullscreen" },
  args: {
    favpoll: FAVPOLL,
    pollWithItems: POLL,
    totalRaised: 600,
    pledgeCount: 3,
    isClosed: false,
    isOrganiser: false,
    wallEntries: WALL,
    rankHistory: null,
  },
} satisfies Meta<typeof FavpollSheet>

export default meta
type Story = StoryObj<typeof meta>

// A guest arrives having pledged nothing, so the standings are visible and
// the personal note is not: the note is what pledging buys.
export const GuestBeforePledging: Story = {
  name: "A guest, before pledging",
  args: { presentation: "guest" },
}

// THE ROOM NEVER SHOWS THE NOTE and never offers a pledge: a projector has
// no one guest to charge, and the note belongs to whoever pledged.
export const Room: Story = {
  name: "The room (a projector), tribute dial",
  args: { presentation: "room", heroVariant: "tribute" },
}

// The presence dial turned up: the money becomes the hero's heading rather
// than sitting quiet under the person.
export const RoomFundraiser: Story = {
  name: "The room, fundraiser dial",
  args: { presentation: "room", heroVariant: "fundraiser" },
}

// The picks are in (lib/picks-suspended): the standings say they are frozen
// and the lock card teaches the shared pot's path instead.
export const PicksSuspended: Story = {
  name: "Picks suspended, pledges still welcome",
  args: { presentation: "guest", picksSuspended: true },
}

export const Closed: Story = {
  name: "Closed, so the favpoll is a record",
  args: {
    presentation: "guest",
    isClosed: true,
    favpoll: { ...FAVPOLL, closed_at: "2026-10-14T19:00:00Z" },
  },
}

// Nobody has pledged yet, which is every favpoll's first hour.
export const NoPledgesYet: Story = {
  name: "Published, before the first pledge",
  args: {
    presentation: "guest",
    totalRaised: 0,
    pledgeCount: 0,
    wallEntries: [],
  },
}
