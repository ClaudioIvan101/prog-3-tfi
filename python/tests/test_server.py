import json
import unittest
from contextlib import closing
from http.client import HTTPConnection
from threading import Thread

from backend.__main__ import create_server


class ServerTests(unittest.TestCase):
    def test_real_http_health_on_an_available_port(self):
        server = create_server({"PORT": "0"})
        self.assertIsNotNone(server)
        with server:
            server.timeout = 2
            worker = Thread(target=server.handle_request)
            worker.start()
            try:
                with closing(HTTPConnection("127.0.0.1", server.server_port, timeout=2)) as connection:
                    connection.request("GET", "/health")
                    response = connection.getresponse()
                    self.assertEqual(response.status, 200)
                    self.assertEqual(response.getheader("X-Content-Type-Options"), "nosniff")
                    self.assertEqual(json.loads(response.read()), {"status": "ok"})
            finally:
                worker.join(timeout=3)
            self.assertFalse(worker.is_alive())
