import json
import unittest

from backend.responses import json_response


class ResponseTests(unittest.TestCase):
    def test_json_is_utf8_with_correct_byte_length(self):
        status, headers, chunks = json_response(404, {"error": "Not found", "text": "á"})
        body = b"".join(chunks)
        self.assertEqual(status, "404 Not Found")
        self.assertEqual(json.loads(body), {"error": "Not found", "text": "á"})
        self.assertEqual(dict(headers)["Content-Length"], str(len(body)))
        self.assertEqual(dict(headers)["Content-Type"], "application/json; charset=utf-8")

    def test_safe_headers_and_explicit_extras(self):
        _, headers, _ = json_response(405, {}, [("Allow", "GET, HEAD")])
        self.assertEqual(dict(headers)["X-Content-Type-Options"], "nosniff")
        self.assertEqual(dict(headers)["Cache-Control"], "no-store")
        self.assertEqual(dict(headers)["Allow"], "GET, HEAD")

    def test_non_finite_numbers_are_rejected_instead_of_invalid_json(self):
        for value in (float("nan"), float("inf"), float("-inf")):
            with self.subTest(value=value), self.assertRaises(ValueError):
                json_response(200, {"value": value})
