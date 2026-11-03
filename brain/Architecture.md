# Two independent backend starters

Verified against repository files on **2026-10-28**. Recheck sources when behavior changes.
There is no documented integration between the Express and Python runtimes.

## Express

JavaScript/CommonJS with Express 5. The documented layering is routes → controllers
→ services → repositories; business services and persistence are not established yet.
[App composition](../express/src/app.js) registers JSON limits, routes, and error
middleware without opening a socket. [Server lifecycle](../express/src/server.js)
owns listening and shutdown. See the [backend guide](../express/README.md).

From `express/`: run `npm test` (Node's built-in `node:test`). The package's
`npm start` and `npm run dev` both target `index.js`, **not** `src/server.js` directly.
The [current entrypoint](../express/index.js) contains unrelated, unfinished users-route
work, including `get.post(...)`. Do not assume passing app tests prove that entrypoint
works; reconcile it deliberately instead of overwriting the local experiment.

## Python

The [WSGI app](../python/backend/app.py) handles `/health` and JSON error responses.
The [module entrypoint](../python/backend/__main__.py) opens a standard-library
development server and handles expected startup failures. No third-party packages
are required. See [limits and responsibilities](../python/README.md).

From `python/`: run `python -m backend` to start locally, and
`python -m unittest discover -s tests -v` to test. This is a development server,
not a production deployment choice; liveness is not database readiness.

## Boundaries

English identifiers/messages and existing Spanish source comments are current
conventions. Preserve them when extending code. Avoid choosing a database, auth
scheme, or backend consolidation without a concrete requirement.
[[Project]] owns unanswered product questions; [[Factory]] owns the execution map.
