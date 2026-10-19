# Express backend structure

A small, layered starting point for this API. It now wires the core plumbing:
`src/app.js` builds the app, `src/server.js` listens, `src/config/env.js` validates
environment settings and `src/routes` serves `GET /` plus a `GET /health` check.
The first controller maps the health response, and the first validator checks
the listening port. Services and repositories remain empty until real business
rules or persistence require them.

Express has [no prescribed folder structure](https://expressjs.com/en/starter/faq/)
and does not choose a database or authentication scheme. This layout is a project
convention, not an Express standard or a security certification.

## Layout

```text
express/
|-- index.js                  # Entry point: requires src/server.js
|-- package.json              # Package configuration
|-- package-lock.json         # Dependency lockfile
|-- .env.example              # Environment variable template (copy to .env)
|-- src/
|   |-- app.js                # Builds the Express app (no listen)
|   |-- server.js             # Listens and handles shutdown
|   |-- config/               # Validated environment settings
|   |-- routes/               # express.Router() definitions
|   |-- controllers/          # HTTP response mapping (healthController.js)
|   |-- services/
|   |-- repositories/
|   |-- middlewares/          # notFound and error handlers
|   `-- validators/           # Decimal listening-port validation (port.js)
|-- database/
|   `-- migrations/
|-- tests/
|   |-- unit/                # Controllers, configuration and error boundaries
|   `-- integration/          # Health/404 smoke tests
`-- docs/
    `-- security.md
```

Each empty leaf has a zero-byte `.gitkeep`: Git tracks files, not empty folders.
Remove a placeholder when adding the first real file to that folder.

## Responsibilities

| Folder | Put here |
| --- | --- |
| `src/config` | Validated environment settings and infrastructure configuration; no secrets. |
| `src/routes` | `express.Router()` definitions and ordered middleware wiring. |
| `src/controllers` | HTTP input/output mapping and status codes; no database queries. |
| `src/services` | Business rules and resource-level authorization; independent of `req`/`res`. |
| `src/repositories` | Data access, scoped queries and persistence details; no HTTP objects. |
| `src/middlewares` | Shared request controls, authentication, not-found and error handlers. |
| `src/validators` | Boundary validation, including startup settings and future request schemas. |
| `database/migrations` | Versioned schema changes after choosing a database and migration tool. |
| `tests/unit` | Isolated business-rule and validation tests. |
| `tests/integration` | API/persistence tests, including denied access and invalid input. |

## Adding the first feature

1. Define its request/response contract and failing tests before implementation.
2. Add validation, a controller and a service; add a repository only if persistence
   is needed. Use a consistent resource name across the layers.
3. Wire the route in this order: request limits/security controls, required
   authentication, validation, controller, service authorization, repository.
   The controller maps the result to the response.
4. Mount the router, then a not-found handler, then the four-argument error handler.
   [Express middleware executes in registration order](https://expressjs.com/en/guide/using-middleware/).

`src/app.js` builds the app and `src/server.js` handles listening/shutdown; both
exist and `index.js` requires the server. `npm test` runs the `node:test` suite,
which covers health, startup settings, errors, body limits and response headers.

## First files in use

`NODE_ENV` accepts `development`, `test` or `production` and defaults to
`development` when unset. Unsupported modes fail before listening so a typo
cannot silently bypass production behavior. Use `NODE_ENV=production` for a
staging deployment too; identify the deployment environment separately.

| File | Responsibility |
| --- | --- |
| `src/controllers/healthController.js` | Return process liveness and uptime; it is not a database readiness check. |
| `src/validators/port.js` | Accept decimal ports from 0 to 65535; use 3000 when unset. Port 0 asks the OS for an available port. |
| `src/middlewares/errorHandler.js` | Bound error statuses to 400–599, hide server failures and malformed JSON details, and delegate started responses. |
| `src/middlewares/notFound.js` | Return 404 without reflecting query-string values in the response. |
| `src/app.js` | Register middleware and routes without listening; omit `X-Powered-By`. |

Run `npm test` from this directory. HTTP tests listen on temporary ports and close
their servers; configuration tests run in isolated processes. No new dependencies
are required. Existing `GET /` and `GET /health` responses remain unchanged.

Layered folders keep a small API easy to navigate. If related feature files
become scattered as it grows, co-locate them by feature while preserving these
responsibilities. No generic utilities or speculative infrastructure are included.

## Security readiness

Use the [pending security checklist](docs/security.md) before deployment.
Omitting a framework header reduces an unnecessary disclosure; it is not an
authentication, authorization, TLS or rate-limiting control. Those controls and
production-safe logging still require implementation for the actual deployment.
Folders do not enable its controls. The repository-level `.gitignore` already
excludes dependencies, environment files except `.env.example`, logs and generated
outputs; ignoring a file does not protect a secret already committed.
