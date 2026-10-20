"""Ejecuta únicamente el servidor de desarrollo local."""

import os
from wsgiref.simple_server import make_server

from .app import app
from .config import load_settings


def create_server(environ):
    host, port = load_settings(environ)
    return make_server(host, port, app)


def main():
    with create_server(os.environ) as server:
        print(f"Development server listening on port {server.server_port}", flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass


if __name__ == "__main__":
    main()
