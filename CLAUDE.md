# favpoll

Monorepo: `apps/web` (the product), `apps/admin`, `packages/*`. Notes and
rulings live in `references/`, starting with `references/PROJECT.md`.

## The web dev server lies about CSS

Turbopack's dev build serves a stale stylesheet in three situations that
have each cost an afternoon. The symptom is always the same — a change
that is correct in the file, correct in a standalone Tailwind compile and
correct in production simply does not appear in the browser — so the first
move is never to redesign the thing. It is to look at what is actually
being served:

```sh
# the stylesheet the page is loading, and whether your new token is in it
c=$(curl -s localhost:3000/<any-page> | grep -o '/_next/static/chunks/[^"]*\.css' | sort -u | head -1)
curl -s "http://localhost:3000$c" | grep -c '<your-new-token-or-class>'
```

Zero means the server, not the code. Then:

1. **A `globals.css` change that arrived by git — a pull, a branch switch,
   a merge — is never recompiled.** Not by a restart, not by deleting
   `.next/dev`. The served sheet keeps every older token and misses only
   the ones the checkout brought in. **Cure: touch the file.** Any edit
   while the server runs (append a line, save, delete it) recompiles the
   whole thing. 2026-10-17: theme-aware skeleton tokens were invisible for
   an hour this way.

2. **A custom breakpoint declared as `--breakpoint-*` in `@theme` never
   registers in dev at all** — the same file through
   `@tailwindcss/postcss` emits all 44 rules, and production was always
   fine. Declare custom variants as `@custom-variant` instead, which is
   read on every compile and hot-reloads (#1065).

3. **A utility whose class first appears after the server started** may
   not be generated. Restart, and clear `.next/dev` if a plain restart
   does not do it.

Related: new dependencies always need a restart. The dev server also
answers `304 Not Modified` for a chunk whose content has changed, so a
phone or a second browser can hold a stale sheet long after the desktop
has the new one — a restart gives the chunk a new ETag.

## Checks CI runs

From `apps/web`: `pnpm exec prettier --check .`, `tsc --noEmit`, `eslint`,
`vitest run`. From the repo root: `node scripts/check-hex-colors.mjs`
(never hardcode a hex — use the tokens in `app/globals.css`),
`node scripts/component-tree.mjs --check` (regenerate and commit
`references/COMPONENT_TREE.md` when you add or remove a component) and
`node scripts/check-dead-messages.mjs` (a key in `messages/en-GB.json`
that no production source renders fails the build; a key referenced only
by a test or a story counts as dead).

Playwright runs as **E2E Tests (advisory)**. It is a real signal, not
noise: in October 2026 it sat red for a day because its beat list had
gone stale, and nobody looked, because the job cannot block anything.

### Which checks actually gate a merge

Only the ones in the `main-protection` ruleset. Everything else reports
and is ignored by the merge button, so read the ruleset rather than the
list of green ticks.

**The build is the only thing that catches a `"use server"` module
exporting something that is not an async function.** Verified on
2026-10-20 by exporting a `const` from `apps/admin/lib/actions/charities.ts`:
`tsc --noEmit` passed, all 177 admin tests passed, and `next build` failed
with "Only async functions are allowed to be exported in a `use server`
file." There is no GitHub Actions build job, because Vercel builds both
apps on every pull request, including ones that touch no application code.
That makes `Vercel – favpoll-web` and `Vercel – favpoll-admin` the build
protection, and they are worth keeping in the ruleset for that reason
alone. The cost is a dependency on Vercel: if a deployment check stops
reporting, merges wait.

## Agent skills

### Issue tracker

GitHub Issues on `JoeMof80/favpoll`, via the `gh` CLI. See
`docs/agents/issue-tracker.md`.

### Triage labels

The five canonical names, unchanged; `wontfix` already existed. See
`docs/agents/triage-labels.md`.

### Domain docs

Single-context. The canonical glossary is `references/GLOSSARY.md`; new
decisions go in `docs/adr/`, and `references/` is the historical archive.
See `docs/agents/domain.md`.
