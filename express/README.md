# Express backend structure

A small, layered starting point for this API. It now wires the core plumbing:
`src/app.js` builds the app, `src/server.js` listens, `src/config/env.js` validates
environment settings and `src/routes` serves `GET /` plus a `GET /health` check.
Feature layers (`controllers`, `services`, `repositories`, `validators`) still hold
placeholders for the lead qualification and Python integration to come.

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
|   |-- controllers/
|   |-- services/
|   |-- repositories/
|   |-- middlewares/          # notFound and error handlers
|   `-- validators/
|-- database/
|   `-- migrations/
|-- tests/
|   |-- unit/
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
| `src/validators` | Input schemas for body, path parameters and query strings. |
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
which covers the health check and the not-found handler.

Layered folders keep a small API easy to navigate. If related feature files
become scattered as it grows, co-locate them by feature while preserving these
responsibilities. No generic utilities or speculative infrastructure are included.

## Security readiness

Use the [pending security checklist](docs/security.md) before deployment.
Folders do not enable its controls. The repository-level `.gitignore` already
excludes dependencies, environment files except `.env.example`, logs and generated
outputs; ignoring a file does not protect a secret already committed.
