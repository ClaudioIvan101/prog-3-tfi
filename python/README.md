# Minimal Python backend

A small standard-library WSGI project for local development, with no packages to
install. Python 3.13 is verified. It is independent of the sibling Express app.

## Run and test

From this directory:

```sh
python -m backend
python -m unittest discover -s tests -v
```

Open `http://127.0.0.1:8000/health` for `{"status": "ok"}`. Stop with Ctrl+C.
`HOST` defaults to `127.0.0.1`; `PORT` defaults to `8000` and accepts decimal
integers from 0 to 65535. Port 0 selects an available port, printed at startup.
Set variables in the process environment; `.env` files are not loaded.

## Responsibilities

| File | Responsibility |
| --- | --- |
| `backend/config.py` | Validate settings before opening a listening socket. |
| `backend/responses.py` | Encode JSON as UTF-8 bytes with correct length and safe headers. |
| `backend/app.py` | Handle GET/HEAD `/health`, JSON 404 and 405 with `Allow`. |
| `backend/__main__.py` | Start and close the development server. |
| `tests/` | Cover configuration, responses, routing and real HTTP on a temporary port. |

## Limits

**Development only, not a production server or security certification.**
`wsgiref.simple_server` is single-threaded and lacks production traffic controls.
Health reports process liveness, not database readiness. There is no database,
authentication, business logic, TLS or rate limiting. The development server can
log request paths: never send credentials in URLs. Keep the default loopback
binding. Choose a maintained production server and deployment controls before
exposing this app. No virtual environment or third-party dependency was needed.
