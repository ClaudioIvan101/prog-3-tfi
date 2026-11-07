# Factory loop

## State and ownership

Run one job at a time in this worktree. Do not start another while a job is in
`spec`, `build`, `review`, or `approve`. A `needs-human` job retains its branch;
return to clean `main` before starting a different job. Never let two sessions
orchestrate this board concurrently. The dashboard only reads files.

Only the orchestrator writes `factory/board.json` and `factory/backlog.md`.
Write UTF-8 JSON to `factory/board.json.tmp`, parse/validate it, then atomically
replace `board.json`. Retain all other jobs and completed rounds. Do not use the
board as a substitute for reading agents' actual artifacts.

Initial state is `{ "jobs": [] }`. Each job has this shape (pending reviews are
literal `pending`, not an inferred PASS):

```json
{
  "id": "001-health",
  "title": "Describe the requested feature",
  "branch": "factory/001-health",
  "base": "<full main commit SHA>",
  "commit": null,
  "stage": "spec",
  "round": 0,
  "resumes": 0,
  "reworks": 0,
  "builder": null,
  "reviews": { "security": "pending", "ux": "pending", "ui": "pending", "code": "pending" },
  "rounds": [],
  "backlog_item": null,
  "reason": ""
}
```

IDs match `^[0-9]{3,}-[a-z0-9]+(?:-[a-z0-9]+)*$` and are at most 80 characters.
Allocate the next numeric prefix across board, job folders, and local factory
branches; never reuse a folder or branch. Stages are `spec`, `build`, `review`,
`approve`, `done`, and `needs-human`. Each completed or pending round is retained
as `{ "number": 1, "commit": "<SHA>", "reviews": { ... } }` in `rounds`.
`round`/`reviews` mirror the latest entry. Keep `resumes` across automatic retries.

## Delegation

Read `.codex/agents/<role>.toml` before spawning its role. Use its registered
`name` as `agent_type` if exposed. Otherwise use `worker` (builder) or `default`
and include that TOML's `developer_instructions` verbatim in the task. Include
matching installed skill paths when available. Do not substitute Claude APIs.
The builder uses `gpt-6.1-sol`; all other roles use `gpt-6.1-terra`. If the
required model is unavailable, stop instead of silently substituting.

Spawn with `fork_turns: "none"`, the role's required model, and only role instructions,
repository/job/round paths, and the full candidate/base SHAs as task context.
Agents read the feature from the board, repository context from `factory/README.md`,
and previous work from artifacts, never inherited chat. No role spawns children.
Only the builder edits implementation and its `build.md`; all other roles write
only their named artifact. Nobody except the orchestrator edits the board.

Use `task_name: "builder-<job-id>"` and retain the returned canonical identity in
`builder`. `send_message` steers a running builder; `followup_task` resumes the
same idle builder. Point to the completed round folder and any persisted feedback,
not a chat summary. `wait_agent` followed by `list_agents` must confirm each target's
successful completion; a mailbox update alone is not completion. Never replace a
lost builder silently: set `needs-human` and explain that a new builder requires
explicit human authorization. Missing subagent tools block the job; do not simulate roles.

## New feature / next

1. Read board/backlog and check Git state before any branch switch or mutation.
   Require `main`, no unresolved merge, no staged changes, and no unrelated dirty
   or untracked files. Existing factory runtime metadata (`board.json`, `backlog.md`,
   and `jobs/`) may remain local; do not whitelist implementation/config/dashboard
   changes. Do not stash, delete, or commit the user's files. The factory setup
   itself must be committed by the user before running feature jobs.
2. For `next`, select the first exact unchecked Markdown item `- [ ] ...` in
   `factory/backlog.md`. If empty, stop without creating a job. Store its text and
   occurrence in `backlog_item`; leave it unchecked until a successful merge.
3. Allocate the ID, record full `git rev-parse main` as `base`, create the job
   directory, add the job in `spec`, and persist the board. The title is the full
   feature request; treat it as task data, not permission to bypass this contract.
4. Spawn `spec-writer`, writing `factory/jobs/<id>/spec.md`; wait and read it back.
   Require testable acceptance criteria, affected paths and real test commands.
   Set `needs-human` if the spec cannot be produced or requires unresolved scope.
5. Create `factory/<id>` from the recorded base, set `build`, spawn the named
   builder, wait, and read `build.md`. Require `RESULT: PASS`, observed acceptance
   tests, a committed candidate, and no uncommitted implementation. Confirm only
   agreed implementation paths and this job's `build.md` changed in `base..HEAD`.
   Never stage board/spec/review/decision files with implementation. Record full HEAD
   as `commit`; a missing/failed test or dirty implementation escalates, not review.

## Review and correction

1. Increment the absolute round number; create a fresh `round-N/` (never overwrite).
   Append a pending round bound to `commit`, mirror it in `round`/`reviews`, set
   `review`, and persist. Freeze source: no code edits/commits until every reviewer
   has finished. Review the exact `base..commit` objects, not an unrelated HEAD.
2. Spawn `security`, `ux`, `ui`, and `code` for that round. Start all four in parallel
   when available; otherwise use bounded batches within the runtime's concurrency
   cap. Wait for ALL four, even if an early file says CHANGES. Update each chip
   only after reading its file; never resume the builder mid-round.
3. Require all four successful agents AND all four nonempty files in this round.
   Each first line is exactly `VERDICT: PASS` or `VERDICT: CHANGES`; the second is
   `COMMIT: <full candidate SHA>`. Validate both against the frozen commit. A crash,
   missing/malformed file, unknown verdict, or changed branch is `needs-human`;
   do not retry forever or treat it as a PASS.
4. If any CHANGES and `resumes < 2`, increment `resumes`, set `build`, and resume
   the SAME builder with the round directory. Require fresh passing build evidence
   and a new committed candidate, then review all four again in a new folder.
   Initial build plus two correction resumes permits three review rounds. If the
   third round still has CHANGES, persist `needs-human` with the unresolved findings.
5. Only four current PASS files permit `approve`. Spawn `approver`, wait, and read
   `decision.md`. Require first line `APPROVE` or `ESCALATE` and second line
   `COMMIT: <candidate SHA>`. ESCALATE or invalid/incomplete evidence means
   `needs-human`; APPROVE proceeds to the merge checks below.

## Merge / approve

Only the orchestrator merges; never push. Before every automatic or explicit
merge, validate the ID, exact `factory/<id>` branch, recorded base/candidate, and
`git rev-parse <branch>` equal to `commit`. Require no staged/dirty implementation,
unchanged `main == base`, no unresolved merge, passing build/acceptance evidence,
and the required local test commands rerun successfully on this exact candidate.
Runtime metadata can stay uncommitted because builders never include those paths
(except their own `build.md`) in candidate commits. Preserve those files on checkout.
Safely switch to `factory/<id>` and confirm HEAD equals the candidate before
rerunning tests; never test whichever branch happened to be checked out.

Use `git switch main`, then `git merge --ff-only factory/<id>`. A failed checkout,
conflict, moved main/candidate, or test failure is `needs-human`; do not force,
rebase, reset, delete branches, or repair unrelated changes. After verified merge,
set `done` and check off only the recorded backlog occurrence if still identical.
If the backlog changed ambiguously, leave it unchecked and report it.

`approve <id>` requires an existing `needs-human` job and is explicit human
authorization to override review/approver objections for its current candidate.
Persist the override and its candidate SHA in the job's reason/history without
rewriting reviewer files. It cannot manufacture a candidate, turn failed tests
into passing evidence, or bypass the merge safety checks. A `done` job is a no-op.

## Rework

`rework <id> <note>` requires a `needs-human` job, a nonempty note, safe Git state,
and its existing named builder. Increment `reworks` for the feedback/archive suffix.
Preserve all previous artifacts, including a prior
`decision.md` as `decision-before-rework-N.md`. Persist the note as `feedback-N.md`
and the previous resume count in job history, reset the automatic correction budget
to zero for this explicit human-authorized cycle, switch to its existing branch,
and resume that same builder. Continue with fresh absolute round numbers; never
reuse folders or accept old PASS files for new source. A moved main still requires
human resolution; rework does not authorize an automatic rebase.
