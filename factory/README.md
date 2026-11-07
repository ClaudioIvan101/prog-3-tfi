# Software factory

A Codex session is the orchestrator. Files are the handoff; JSON is the board.
There is no backend service, API key, package installation, or background worker.

```text
feature -> spec-writer -> builder -> security + ux + ui + code
                            ^               | wait for all four
                            +--- CHANGES ---+   (two correction resumes max)
                                            |
                                      all four PASS
                                            v
                                         approver
                                       /          \
                                  APPROVE        ESCALATE
                                     v               v
                                local main      needs-human
```

## Use

Commit the factory setup and resolve unrelated local changes before running a job.
Open Codex at the repository root with subagents available. Use `$factory <feature>`
to invoke the skill; `/factory <feature>` is its conversational command spelling,
not an extra Codex slash-command registration. If the new skill/roles do not appear,
reopen the chat or restart Codex. No global configuration was changed.

- `/factory next`: process the first unchecked item in `backlog.md`.
- `/factory approve <job-id>`: explicitly override review objections for a
  `needs-human` candidate; passing build evidence and safe Git state are still required.
- `/factory rework <job-id> <note>`: preserve feedback/history and resume the same builder.

The canonical instructions are `.codex/skills/factory/SKILL.md`, discovered through
the small `.agents/skills/factory/SKILL.md` bridge. Seven native TOML definitions
live in `.codex/agents/`. The builder uses `gpt-6.1-sol`; the spec writer, reviewers,
and approver use `gpt-6.1-terra`. Only the orchestrator writes
`board.json`; builders commit on `factory/<job-id>`. Reviews never fix source.
An initial build plus two correction resumes means at most three review rounds.
Jobs remain in `jobs/<id>/`; rounds are immutable. Lost builder sessions, missing
evidence, failed tests, or exhausted corrections require human attention.
The factory never pushes. Board, spec and review metadata stay local unless you commit them.

## View

From this `factory/` directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

On Windows, `python -m http.server 8765 --bind 127.0.0.1` is equivalent.
Open [the dashboard](http://127.0.0.1:8765/dashboard.html). It polls `board.json`
every two seconds; click a job to read its Markdown files as safe plain text.
Do not open the HTML directly with `file://`. Keep the server bound to loopback:
it serves local job artifacts, not a public dashboard. Stop it with Ctrl+C.

## Repository context

- `express/`: Express 5, JavaScript/CommonJS; routes -> controllers -> services ->
  repositories. `src/app.js` composes the app; `src/server.js` manages startup.
  Run `npm test` from `express/` (Node's built-in `node:test`).
- `python/`: independent standard-library WSGI backend. Run
  `python -m unittest discover -s tests -v` from `python/`; start with `python -m backend`.
- Identifiers and response messages are English. Existing source comments are Spanish;
  preserve that convention when extending backend code. Technical factory artifacts are English.
- Inspect affected files before each job; re-verify commands rather than treating this
  snapshot as permanent. Never mix pre-existing edits into a factory commit.

## Check the factory

From the repository root, run `python -m unittest discover -s factory/tests -v`.
Python 3.11+ and Node 18+ are sufficient; no third-party test dependencies are needed.
Tests parse the native agent contracts, validate local links/state, and execute the
dashboard JavaScript with a small DOM harness. They do not execute live agent jobs
or Git merges; those require a real Codex session and an explicitly requested feature.

## Sources

- [Original inspiration](https://github.com/zazencodes/zazencodes-season-3/tree/main/src/software-factory-claude-code).
  This implementation follows the attached build prompt's shared `board.json`, not
  the reference repository's later worktree/per-job-JSON evolution.
- [Official Codex custom agents](https://learn.chatgpt.com/docs/agent-configuration/subagents).
- [Official Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).
