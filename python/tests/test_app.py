import json
import unittest

from backend.app import app


class AppTests(unittest.TestCase):
    def request(self, path="/health", method="GET"):
        captured = []
        body = app(
            {"PATH_INFO": path, "REQUEST_METHOD": method, "QUERY_STRING": "token=secret"},
            lambda status, headers: captured.append((status, dict(headers))),
        )
        return *captured[0], b"".join(body)

    def test_health_is_a_non_cached_liveness_response(self):
        status, headers, body = self.request()
        self.assertEqual(status, "200 OK")
        self.assertEqual(json.loads(body), {"status": "ok"})
        self.assertEqual(headers["Cache-Control"], "no-store")

    def test_unknown_route_returns_json_without_reflecting_query(self):
        status, _, body = self.request("/missing")
        self.assertEqual(status, "404 Not Found")
        self.assertEqual(json.loads(body), {"error": "Not found"})

    def test_health_rejects_writes_with_allow_header(self):
        status, headers, body = self.request(method="POST")
        self.assertEqual(status, "405 Method Not Allowed")
        self.assertEqual(headers["Allow"], "GET, HEAD")
        self.assertEqual(json.loads(body), {"error": "Method not allowed"})

    def test_head_has_get_headers_but_no_body(self):
        status, headers, body = self.request(method="HEAD")
        self.assertEqual(status, "200 OK")
        self.assertGreater(int(headers["Content-Length"]), 0)
        self.assertEqual(body, b"")
