import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { Podium } from "./podium"

// THE PODIUM at a witnessed close (#1048): when a favpoll closes while the
// room is watching, the top three PLEDGED favourites arrive bronze first,
// then silver, then gold, and the personal note follows.
//
// `onDone` is what the room shell waits for before moving on, so each
// story logs rather than leaving it dangling.

const meta = {
  title: "RoomShell/Podium",
  component: Podium,
  parameters: { layout: "fullscreen" },
  args: { onDone: () => console.log("podium done") },
} satisfies Meta<typeof Podium>

export default meta
type Story = StoryObj<typeof meta>

export const ThreeFavourites: Story = {
  name: "A full podium",
  args: {
    topicTitle: "Colour",
    steps: [
      { rank: 1, label: "Blue", pounds: 240 },
      { rank: 2, label: "Green", pounds: 185 },
      { rank: 3, label: "Yellow", pounds: 90 },
    ],
  },
}

// Fewer than three favourites were pledged for, which `podiumSteps` allows:
// it filters to items with pledges and takes at most three.
export const TwoFavourites: Story = {
  name: "Only two favourites were pledged for",
  args: {
    topicTitle: "Colour",
    steps: [
      { rank: 1, label: "Blue", pounds: 60 },
      { rank: 2, label: "Green", pounds: 20 },
    ],
  },
}

export const OneFavourite: Story = {
  name: "A single favourite",
  args: {
    topicTitle: "Funeral song",
    steps: [{ rank: 1, label: "Bring Me Sunshine", pounds: 45 }],
  },
}

// Long labels are the real case for a song topic, where a favourite is a
// recording with its artist.
export const LongLabels: Story = {
  name: "Labels as long as a song and its artist",
  args: {
    topicTitle: "Funeral song",
    steps: [
      {
        rank: 1,
        label: "Somewhere Over the Rainbow — Eva Cassidy",
        pounds: 310,
      },
      { rank: 2, label: "Bring Me Sunshine — Morecambe and Wise", pounds: 150 },
      {
        rank: 3,
        label: "You'll Never Walk Alone — Gerry & The Pacemakers",
        pounds: 75,
      },
    ],
  },
}
