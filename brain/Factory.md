# Factory execution map

The factory runs inside a Codex session; the vault does not schedule or execute jobs.
Read the [factory guide](../factory/README.md), then the
[canonical skill](../.codex/skills/factory/SKILL.md) and
[loop contract](../.codex/skills/factory/references/loop.md) for authoritative behavior.

## Source of truth

- [Board](../factory/board.json) — current durable job state.
- [Backlog](../factory/backlog.md) — unchecked feature requests for `next`.
- [Dashboard](../factory/dashboard.html) — read-only viewer; serve it as the guide describes.

Use `$factory <feature>` in Codex; `/factory` is the workflow's conversational spelling.
The orchestrator runs spec → builder → four reviewers → approver, with bounded
corrections and human escalation. Builders commit on feature branches; the factory
does not push. Read the actual job artifacts before treating a verdict as evidence.

Do not copy job stages or reviewer verdicts into an evergreen note: they go stale.
Record a dated outcome in a daily note, and link significant choices to
[[Decisions/001-file-based-factory]]. See [[Roadmap]] for setup-related next actions.
