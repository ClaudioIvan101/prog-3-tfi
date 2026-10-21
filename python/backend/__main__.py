"""Ejecuta únicamente el servidor de desarrollo local."""

import os
import sys
from wsgiref.simple_server import make_server

from .app import app
from .config import load_settings
from .request_handler import PrivateRequestHandler


def create_server(environ):
    host, port = load_settings(environ)
    return make_server(host, port, app, handler_class=PrivateRequestHandler)


def main():
    try:
        server = create_server(os.environ)
    except (ValueError, OSError):
        # Evita mostrar rutas internas o valores de configuración en fallos esperados.
        print("Unable to start development server; check HOST and PORT.", file=sys.stderr)
        return 1
    with server:
        print(f"Development server listening on port {server.server_port}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
