import unittest

from backend import config


class ConfigTests(unittest.TestCase):
    def test_defaults_are_local(self):
        self.assertEqual(config.load_settings({}), ("127.0.0.1", 8000))

    def test_valid_port_including_ephemeral(self):
        for value in ("0", "8001", "65535"):
            with self.subTest(value=value):
                self.assertEqual(config.load_settings({"PORT": value})[1], int(value))

    def test_invalid_port_fails_before_listening(self):
        for value in (" ", "-1", "65536", "1.5", "1e3", "0x10"):
            with self.subTest(value=value), self.assertRaises(ValueError):
                config.load_settings({"PORT": value})
