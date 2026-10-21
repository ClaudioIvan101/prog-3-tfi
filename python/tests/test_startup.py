import os
import socket
import subprocess
import sys
import unittest
from pathlib import Path

from backend.__main__ import create_server
from backend.request_handler import PrivateRequestHandler


class StartupTests(unittest.TestCase):
    def run_backend(self, port):
        return subprocess.run(
            [sys.executable, "-m", "backend"],
            cwd=Path(__file__).resolve().parents[1],
            env={**os.environ, "HOST": "127.0.0.1", "PORT": str(port)},
            capture_output=True,
            text=True,
            timeout=5,
        )

    def assert_safe_failure(self, result):
        self.assertEqual(result.returncode, 1)
        self.assertEqual(result.stdout, "")
        self.assertEqual(result.stderr, "Unable to start development server; check HOST and PORT.\n")

    def test_invalid_settings_fail_without_a_traceback(self):
        self.assert_safe_failure(self.run_backend("not-a-port"))

    def test_occupied_port_fails_without_a_traceback(self):
        with socket.create_server(("127.0.0.1", 0)) as blocker:
            self.assert_safe_failure(self.run_backend(blocker.getsockname()[1]))

    def test_server_uses_the_private_request_handler(self):
        with create_server({"PORT": "0"}) as server:
            self.assertIs(server.RequestHandlerClass, PrivateRequestHandler)
