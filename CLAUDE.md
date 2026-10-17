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
(never hardcode a hex — use the tokens in `app/globals.css`).
