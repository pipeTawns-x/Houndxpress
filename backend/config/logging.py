"""Redacción del rastreo público en los registros de acceso de Django."""

import logging
import re
from urllib.parse import unquote

PUBLIC_TRACK_PATH = "/api/v1/public/track/"


class PublicTrackQueryFilter(logging.Filter):
    # The path is compared decoded: Django routes `/api/v1/public/%74rack/` to the same view.
    pattern = re.compile(r"(/[^\s\"'?]*)\?[^\s\"']*")

    def redact(self, text):
        return self.pattern.sub(
            lambda match: (
                match.group(1) if unquote(match.group(1)) == PUBLIC_TRACK_PATH else match.group(0)
            ),
            text,
        )

    def filter(self, record):
        if isinstance(record.msg, str):
            record.msg = self.redact(record.msg)
        if isinstance(record.args, tuple):
            record.args = tuple(
                self.redact(item) if isinstance(item, str) else item for item in record.args
            )
        return True
