"""Construye respuestas JSON con longitud calculada sobre bytes."""

import json
from http import HTTPStatus


def json_response(status, data, extra_headers=()):
    body = json.dumps(data, ensure_ascii=False, allow_nan=False).encode("utf-8")
    headers = [
        ("Content-Type", "application/json; charset=utf-8"),
        ("Content-Length", str(len(body))),
        ("X-Content-Type-Options", "nosniff"),
        ("Cache-Control", "no-store"),
        *extra_headers,
    ]
    return f"{status} {HTTPStatus(status).phrase}", headers, [body]
