# Triage Labels

The skills speak in terms of five canonical triage roles. This file maps those roles to the actual label strings used in this repo's issue tracker.

| Label in mattpocock/skills | Label in our tracker | Meaning                                  |
| -------------------------- | -------------------- | ---------------------------------------- |
| `needs-triage`             | `needs-triage`       | Maintainer needs to evaluate this issue  |
| `needs-info`               | `needs-info`         | Waiting on reporter for more information |
| `ready-for-agent`          | `ready-for-agent`    | Fully specified, ready for an AFK agent  |
| `ready-for-human`          | `ready-for-human`    | Requires human implementation            |
| `wontfix`                  | `wontfix`            | Will not be actioned                     |

When a skill mentions a role (e.g. "apply the AFK-ready triage label"), use the corresponding label string from this table.

Edit the right-hand column to match whatever vocabulary you actually use.

## Repo notes (2026-10-20)

`wontfix` already existed on `JoeMof80/favpoll` and is reused as-is. The
other four are created the first time triage applies one
(`gh label create <name> --description "..."`).

The nine GitHub defaults already on the repo — `bug`, `documentation`,
`duplicate`, `enhancement`, `good first issue`, `help wanted`, `invalid`,
`question`, `wontfix` — are untouched and can be applied alongside a triage
label. `good first issue` in particular is worth keeping in play: the debt
register marks several items as suitable for someone learning the codebase.
