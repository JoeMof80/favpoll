// THE alias map. One list, imported by both `.storybook/main.ts` (the
// Storybook build) and `../vitest.config.ts` (the browser test run), so a
// story cannot pass in one and fail in the other.
//
// It could, until 2026-10-20: the two configs kept separate lists that had
// drifted, and fifteen stories passed as vitest browser tests while failing
// to render from `storybook build` output. Two different causes, one root:
//
//   "invariant expected app router to be mounted" — FavpollListCard and
//   PledgeDialog call useRouter. The framework's own next/navigation shim
//   wants an App Router context the static build has not set up, so our
//   stub has to win, which means coming first in the list.
//
//   "__dirname is not defined" — PollSection reaches a "use server" module
//   through the ranking list's hide toggle. Importing one pulls Next's
//   server bundle, compiled with ncc, into browser code, where __dirname
//   does not exist. vitest stubbed that module; Storybook did not.
//
// ORDER IS LOAD-BEARING. A string `find` matches by prefix, so every
// specific "@…" entry must precede the bare "@" catch-all, or "@/x" and
// "@favpoll/types" both resolve through it to the wrong place.
import path from "node:path"
import { fileURLToPath } from "node:url"

const storybookDir = path.dirname(fileURLToPath(import.meta.url))
const webDir = path.resolve(storybookDir, "..")

const mock = (file: string) => path.join(storybookDir, "__mocks__", file)
const rootMock = (file: string) => path.join(webDir, "__mocks__", file)

export type StoryAlias = { find: string; replacement: string }

// Everything resolves these, unit tests included: the workspace package, the
// "@" catch-all, and the one server action whose module a jsdom render also
// cannot load.
export const baseAliases: StoryAlias[] = [
  { find: "@/app/favpolls/new/actions", replacement: mock("actions.ts") },
  {
    find: "@favpoll/types",
    replacement: path.resolve(webDir, "../../packages/types/index.ts"),
  },
  // The subpath must precede the bare name: a string `find` matches by
  // prefix, so "@favpoll/charity-register" would otherwise swallow
  // "@favpoll/charity-register/charity-commission".
  {
    find: "@favpoll/charity-register/charity-commission",
    replacement: path.resolve(
      webDir,
      "../../packages/charity-register/charity-commission.ts"
    ),
  },
  {
    find: "@favpoll/charity-register",
    replacement: path.resolve(
      webDir,
      "../../packages/charity-register/index.ts"
    ),
  },
  { find: "@", replacement: webDir },
]

// Only a rendered story gets these. The jsdom unit tests must NOT: several
// of them exercise the real modules, and aliasing those to stubs silently
// passed 45 tests against a mock on 2026-10-20 before this split existed.
const storyOnlyAliases: StoryAlias[] = [
  // ── "use server" modules ────────────────────────────────────────────────
  // Each one drags Next's server bundle into the browser. Stub them all,
  // and add any new one here the day it appears in a rendered component.
  { find: "@/app/favpolls/new/actions", replacement: mock("actions.ts") },
  {
    find: "@/app/favpolls/[id]/actions",
    replacement: mock("favpoll-actions.ts"),
  },
  {
    find: "@/lib/actions/favpoll-poll-favourites",
    replacement: mock("favpoll-poll-favourites.ts"),
  },

  // ── Clients that would want credentials ─────────────────────────────────
  {
    find: "@/lib/supabase/client",
    replacement: rootMock("supabase-client.ts"),
  },
  { find: "@stripe/stripe-js", replacement: rootMock("stripe.ts") },

  // ── Next internals with no context outside the app ──────────────────────
  { find: "next/navigation", replacement: mock("next-navigation.ts") },
  {
    find: "@/components/new-favpoll-button",
    replacement: mock("new-favpoll-button.tsx"),
  },
]

// What a story resolves: the story-only stubs first, then the base, so the
// specific "@…" entries still precede the "@" catch-all.
export const storyAliases: StoryAlias[] = [...storyOnlyAliases, ...baseAliases]
