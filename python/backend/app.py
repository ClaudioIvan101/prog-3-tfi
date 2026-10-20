"""Define el contrato HTTP mínimo sin abrir conexiones al importar."""

from .responses import json_response


def app(environ, start_response):
    method = environ.get("REQUEST_METHOD", "GET")
    if environ.get("PATH_INFO") != "/health":
        response = json_response(404, {"error": "Not found"})
    elif method not in ("GET", "HEAD"):
        response = json_response(405, {"error": "Method not allowed"}, [("Allow", "GET, HEAD")])
    else:
        response = json_response(200, {"status": "ok"})
    status, headers, body = response
    start_response(status, headers)
    return [] if method == "HEAD" else body
