"""Renderers shared by every API endpoint."""

from rest_framework.renderers import JSONRenderer


class UTF8JSONRenderer(JSONRenderer):
    """JSON renderer that names its character set in the Content-Type header.

    DRF's JSONRenderer sends a bare ``application/json``. OWASP ASVS 5.0 4.1.1 asks every
    response with a body to declare its charset, so this one sends
    ``application/json; charset=utf-8``. The body does not change: DRF already encodes JSON
    as UTF-8.
    """

    charset = "utf-8"
