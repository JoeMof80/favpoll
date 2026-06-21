Here it is:

---

Read `.claude/commands/favpoll-context.md` and `.claude/commands/favpoll-brand.md` in full before writing any code. The context skill covers file naming, Tailwind usage, shadcn reuse, aria requirements, and all other conventions. Everything in those skills applies to every file produced in this task.

---

We are building a `FavpollCard` component — the canonical, recognisable shape of a favpoll. It must be consistent whether it appears on the favpoll page, in the hero demo panel, as an embed, or on the live display. Build it as a set of composable sub-components, each with their own Storybook stories.

---

## Component hierarchy

```
favpoll-card.tsx
├── favpoll-header.tsx        — eyebrow, protagonist name, date range, avatar (right-aligned)
├── favpoll-poll.tsx          — one poll unit; the body of the card
│   ├── poll-title.tsx
│   ├── poll-framing.tsx      — the framing question, shown pre-pledge
│   ├── poll-options.tsx      — pill grid (choose) or locked selected pill (post-choose)
│   ├── poll-reveal.tsx       — reveal card; only rendered when content exists and guest has pledged
│   └── poll-results.tsx      — ranked bar chart; shown post-pledge
├── favpoll-pledge-panel.tsx  — amount selector + CTA + fee line
├── favpoll-shared-fund.tsx   — optional green panel when organiser has enabled shared fund
└── favpoll-charity-row.tsx   — charity dot + name + amount raised; one per charity
```

Each file exports a PascalCase function matching its purpose — `export function FavpollCard`, `export function PollReveal` — but the filename is kebab-case throughout.

---

## Layout rules

The avatar is always right-aligned in `FavpollHeader`. The left edge is a clean typographic rail — eyebrow, protagonist name, date range, divider, poll title, framing, options — all share one left origin. Nothing interrupts that rail.

Avatar slot: if a photo src is provided, render an `<img>` with `alt="[protagonist name]"`. If not, render an initials circle using `bg-[#EEEDFE] border border-[#AFA9EC] text-[#534AB7]`. The slot size and position are identical in both cases.

`FavpollHeader` is always visible. Across guest steps, only `FavpollPoll` and `FavpollPledgePanel` change.

---

## Guest step model

`FavpollPoll` accepts a `step` prop: `'choose' | 'pledge' | 'pledged'`

- `choose` — renders `PollFraming` + `PollOptions` as a full selectable pill grid
- `pledge` — renders the selected pill (locked) + `FavpollPledgePanel` + optionally `FavpollSharedFund`
- `pledged` — renders the selected pill (locked) + `PollReveal` if `personalReveal` is set + `PollResults`

Step dots sit between the header and poll body when `showSteps` is true. Three dots; the active dot elongates to a pill shape. Use `role="list"` on the container, `role="listitem"` on each dot, `aria-label="Step [n] of 3"` on each, and `aria-current="step"` on the active one.

---

## PollReveal — typographic treatment

This is the emotional centrepiece of the product and must read as the most significant element on the card after the protagonist's name.

```
Container:
  bg-[#EEEDFE] border border-[#AFA9EC] rounded-lg p-4
  aria-label="[Protagonist name]'s reveal"

Eyebrow:
  text-[11px] font-medium tracking-[0.09em] uppercase text-[#7F77DD]
  e.g. "Belinda's reveal"

Reveal text:
  text-[18px] font-normal italic text-[#26215C] leading-relaxed
  border-l-[2.5px] border-[#7F77DD] pl-3
```

When `personalReveal` is null or empty, `PollReveal` renders nothing — no placeholder, no empty container. `PollResults` follows immediately with no gap.

When results follow the reveal, separate them with a small uppercase label: `text-[11px] font-medium tracking-[0.07em] uppercase text-[#888780]`, reading "The results".

---

## PollResults — accessibility

Each result row must be a `<li>` inside a `<ul role="list" aria-label="Results">`. The bar width is a visual encoding only — the screen-reader text must convey the label and amount independently of the bar. Do not rely on the visual bar to communicate ranking.

---

## PollOptions — accessibility

Render the pill grid as a `role="radiogroup"` with `aria-label="Choose your favourite [topic title]"`. Each pill is `role="radio"` with `aria-checked`. Selected state is `bg-[#534AB7] text-white border-[#534AB7]`. Unselected is `bg-[#F1EFE8] text-[#5F5E5A] border-[#D3D1C7]`.

---

## FavpollPledgePanel — accessibility

Amount buttons follow the same `role="radiogroup"` + `role="radio"` + `aria-checked` pattern, with `aria-label="Pledge amount"` on the group. The confirm strip that appears after a successful pledge uses `role="status"` so it is announced. Live-updating totals (amount raised, fee) use `aria-live="polite"`.

---

## Size variants

`FavpollCard` accepts a `size` prop: `'full' | 'demo' | 'embed'`

| size    | context           | protagonist name | avatar | showSteps | pledge panel |
| ------- | ----------------- | ---------------- | ------ | --------- | ------------ |
| `full`  | favpoll page      | text-[22px]      | 56px   | false     | inline       |
| `demo`  | hero demo panel   | text-[16px]      | 36px   | true      | inline       |
| `embed` | third-party embed | text-[14px]      | 32px   | false     | hidden       |

Pass `size` as a prop through the tree. Sub-components read it to apply the correct scale. Do not hardcode pixel values in sub-components outside of this table.

---

## Design tokens

Use these exact values via Tailwind bracket notation. Do not substitute Tailwind named colours for brand colours.

```
bg-[#534AB7]     purple primary — buttons, active states
bg-[#7F77DD]     purple mid — bars, reveal border
bg-[#EEEDFE]     purple light — reveal bg, initials bg, selected states
border-[#AFA9EC] purple border — reveal border, initials border, edit underlines
text-[#3C3489]   purple dark — reveal text (normal weight)
text-[#26215C]   purple 900 — reveal text (18px prominent treatment)
bg-[#1D9E75]     green — shared fund
bg-[#E1F5EE]     green light — shared fund background
bg-[#F1EFE8]     gray 50 — page background, unselected pill background
border-[#D3D1C7] gray 100 — borders, dividers
text-[#888780]   gray 400 — secondary text, section labels
text-[#5F5E5A]   gray 600 — body text
text-[#2C2C2A]   gray 900 — primary text
```

Typeface is Plus Jakarta Sans, weights 400 and 500 only. Never `font-semibold` or `font-bold`.

---

## Storybook stories

### `favpoll-card.stories.tsx`

- `Memorial` — Belinda Hartley, Colour poll, `step="pledged"`, with reveal, `size="full"`
- `Birthday` — Poppy Chen, Ice cream poll, `step="choose"`, `size="full"`
- `Retirement` — Ros Turner, Season poll, `step="pledge"`, `size="full"`
- `Engagement` — Alex & Jordan, Animal poll, `step="pledged"`, with reveal, `size="full"`
- `NoReveal` — any occasion, `step="pledged"`, `personalReveal={null}`, `size="full"`
- `DemoSize` — `size="demo"`, `showSteps={true}`, interactive — clicking a pill advances to the pledge step, confirming advances to pledged
- `EmbedSize` — `size="embed"`, `step="pledged"`

### `poll-reveal.stories.tsx`

- `WithReveal` — full reveal text rendered
- `Empty` — `personalReveal={null}`, confirms nothing is rendered

### `favpoll-header.stories.tsx`

- `WithPhoto` — avatar src provided
- `InitialsOnly` — no src, initials circle shown
- `Couple` — protagonist name "Alex & Jordan", initials "AJ"

---

## Before finishing

- Run `pnpm test:run` — all 261 existing tests must still pass
- Check that no raw `<button>` elements exist — use shadcn `Button` throughout
- Check that no inline `style={{}}` props exist where a Tailwind class would do
- Check that every interactive element has an aria label or role as specified above
- Do not introduce new dependencies without flagging them first
