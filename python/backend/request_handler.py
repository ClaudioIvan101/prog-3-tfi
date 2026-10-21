"""Controla los registros HTTP del servidor de desarrollo."""

from wsgiref.simple_server import WSGIRequestHandler


class PrivateRequestHandler(WSGIRequestHandler):
    def log_message(self, format, *args):
        # Omite rutas y texto del cliente que puedan contener credenciales.
        return
