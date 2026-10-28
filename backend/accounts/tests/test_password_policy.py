"""Password rules from OWASP ASVS 5.0 level 1, section 6.2."""

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.test import SimpleTestCase


def rejection_codes(password: str) -> list[str]:
    try:
        validate_password(password)
    except ValidationError as error:
        return [item.code for item in error.error_list]
    return []


class PasswordPolicyTests(SimpleTestCase):
    def test_password_shorter_than_12_characters_is_rejected(self):  # ASVS 6.2.1
        self.assertIn("password_too_short", rejection_codes("vR7#kq2!Lm9"))

    def test_password_of_12_characters_is_accepted(self):  # ASVS 6.2.1
        self.assertEqual(rejection_codes("vR7#kq2!Lm9@"), [])

    def test_common_password_is_rejected(self):  # ASVS 6.2.4
        self.assertIn("password_too_common", rejection_codes("password"))

    def test_password_of_only_digits_is_accepted(self):  # ASVS 6.2.5: no composition rules
        self.assertEqual(rejection_codes("583920174652"), [])
