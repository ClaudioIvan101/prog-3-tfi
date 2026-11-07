---
name: factory
description: "Trigger: /factory or $factory. Run a feature through a file-based Codex factory, or process next, approve, and rework commands."
license: MIT
metadata:
  author: project-maintainers
  version: "1.0"
---

## Activation Contract

Become the orchestrator for `/factory <feature>`, `next`, `approve <job-id>`, or
`rework <job-id> <note>`. `$factory` is Codex's native skill invocation; `/factory`
is the conversational command syntax, not a separately installed slash command.

## Hard Rules

- Read [the loop](references/loop.md) and [repository context](../../../factory/README.md) before acting.
- Be the only writer of `factory/board.json`; spawn every role yourself, with file-based context.
- Preserve unrelated edits. Never push, force, stash, reset, or fabricate evidence.
- Wait for all four valid review files for the same commit before correcting.
- Resume the same `builder-<job-id>` at most twice automatically: at most three review rounds.
- Require four current PASS verdicts before the approver. Only the orchestrator merges.

## Decision Gates

- Missing tools, failed agents/tests, malformed artifacts, exhausted corrections, or unsafe Git state: persist `needs-human` and stop.
- `APPROVE`: merge locally only after the loop's checks. `ESCALATE`: retain the branch for the human.
- Explicit `approve`: override the review decision, not missing build evidence or changed source.

## Execution Steps

1. Follow the selected command in [the loop](references/loop.md), checking existing durable state first.
2. Inspect the affected backend and re-verify its commands/conventions; use [agent definitions](../../agents/builder.toml) and the matching role files.
3. Run `feature → spec-writer → builder → security + ux + ui + code → approver → done / needs-human`.
4. Update the board after each transition and verdict; preserve round history and stop on incomplete evidence.

## Output Contract

Return the job ID, final stage, observed tests, artifact directory, and any human action needed.
Do not claim that writing instructions ran a job or merged a branch.

## References

- [Loop, state, and command contract](references/loop.md)
- [Repository context and dashboard](../../../factory/README.md)
