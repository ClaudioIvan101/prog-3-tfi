---
type: decision
status: accepted
verified: "2026-10-28"
---

# Use a file-based Codex factory

## Decision and reason

Keep orchestration in one Codex skill, specialize seven subagent roles, and use
Markdown artifacts plus `factory/board.json` for handoffs and visible durable state.
The user's build request chose a small factory understandable in a few minutes,
adapted from a Claude Code reference to Codex. This records that existing choice;
it is not approval to run a new job or publish changes.

## Consequences

- Benefit: the loop, evidence, and reviewer output remain inspectable without a service or database.
- Tradeoff: instruction-following and a live Codex session drive execution; this is not a standalone scheduler.
- Boundary: only the orchestrator writes the board; reviewers write their own artifacts.
- Operational limit: preserve named-builder identity, wait for all four reviews,
  and escalate incomplete evidence rather than assuming a PASS.

## Evidence

The [factory guide](../../factory/README.md) and
[canonical loop](../../.codex/skills/factory/references/loop.md) define the current contract.
The implementation exists locally; acceptance of the design is not a claim that
the setup has been committed, a feature job has run, or a merge has completed.
Related: [[Factory]], [[Architecture]].
