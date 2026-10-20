"""Lee únicamente la dirección y el puerto del servidor local."""


def load_settings(environ):
    value = environ.get("PORT", "8000")
    if not value.isascii() or not value.isdecimal() or int(value) > 65535:
        raise ValueError("PORT must be a decimal integer between 0 and 65535")
    return environ.get("HOST") or "127.0.0.1", int(value)
