import unittest
from contextlib import redirect_stderr
from io import StringIO

from backend.request_handler import PrivateRequestHandler


class RequestHandlerTests(unittest.TestCase):
    def test_request_and_parser_logs_do_not_expose_client_data(self):
        handler = object.__new__(PrivateRequestHandler)
        handler.client_address = ("127.0.0.1", 12345)
        output = StringIO()
        with redirect_stderr(output):
            handler.log_message("request %s", "/health?token=private-value")
            handler.log_error("bad request %s", "private-value")
        self.assertEqual(output.getvalue(), "")
