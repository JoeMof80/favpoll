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
by a test or a story counts as dead) and
`node scripts/check-e2e-projects.mjs` (an e2e spec matching no Playwright
project, or a project matching no spec — see below).

Playwright runs as **E2E Tests (advisory)**. It is a real signal, not
noise: in October 2026 it sat red for a day because its beat list had
gone stale, and nobody looked, because the job cannot block anything.

**The worse failure is green-but-empty, and the badge cannot show it.**
Each project in `playwright.config.ts` names its specs by filename
pattern, and Playwright does not complain when a pattern matches nothing
— it runs zero tests and reports success. "No tests found" appears only
when you name the file explicitly. #897 renamed
`reveal-after-pledge.spec.ts` to `note-after-pledge.spec.ts` and left the
`guest` project pointing at the old name, so for two and a half months
the guest pledge flow — the only end-to-end cover the money path has —
never ran, behind a green tick. `scripts/check-e2e-projects.mjs` now
fails on both halves of that: a spec no project matches, and a project no
spec matches. It asks Playwright itself (`--list`), so it cannot drift
from the real glob behaviour, and it runs in **Format check** rather than
in the advisory job — the job that would have shown this green is the
wrong place to catch it.

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

## Toolchain versions

One pnpm and one Node, pinned in the repo, and nothing else names a version:

- `packageManager: "pnpm@10.28.0"` in the root `package.json`. Corepack
  honours it on a fresh clone, and `pnpm/action-setup` reads it when its
  `version` input is omitted.
- `24` in `.nvmrc`, plus `engines.node: "24.x"` in the root package.json and
  in **both apps** — Vercel reads `engines` from the project's root directory,
  which for these two is `apps/web` and `apps/admin`, not the repo root.

**pnpm 10.28.0 because that is what Vercel builds with.** Its build log says
`Using pnpm@10.x based on project creation date`: the choice comes from when
the project was created, not from anything in the repo, and Vercel reads
`packageManager` only behind an experimental corepack flag. Vercel is the only
build check there is, so its version is the one to agree with rather than
argue with. The lockfile is `lockfileVersion: 9.0`, which pnpm 9, 10 and 11
all write, so the pin cost no lockfile churn.

**Node 24 because both Vercel projects already build and run on 24.x**, and
Vercel deprecated Node 20 on 1 October 2026. CI had been testing on 20 while
production ran on 24.

`.nvmrc` holds the major, `24`, not an exact patch, so CI jobs in one run can
land on different 24.x patches — the first run after the pin drew 24.21.0 in
two jobs and 24.22.0 in three, because `setup-node` takes the newest 24.x the
runner has cached. That is deliberate: Vercel resolves its own patch inside
`24.x` too, so pinning CI to one patch would make CI stricter than the thing
it is meant to mirror. The major is what changes behaviour.

Bump either by hand, in its own commit — corepack needs an exact pnpm
version, so there is no range to track. Left to choose for itself, corepack
fetched pnpm 12.14.0 on 2026-10-20 and broke every `pnpm` call on the
founder's machine: 12 ships `pnpm.mjs` where the installed shim looked for
`pnpm.cjs` (#1121).

`pnpm-workspace.yaml` carries an `allowBuilds` allowlist. pnpm 10 and 11 run
no dependency build script that is not on it, and pnpm 9 ran them all — so CI
never exercised that list until this pin landed.

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
