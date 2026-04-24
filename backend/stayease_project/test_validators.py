"""
Tests for custom validators defined in stayease_project/validators.py.
"""
import io
import pytest
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile

from stayease_project.validators import (
    validate_phone,
    validate_email,
    validate_financial_amount,
    validate_aadhaar,
    validate_pan,
    validate_ifsc,
    validate_pincode,
    validate_file_size,
    sanitize_text,
    validate_required,
)


# ---------------------------------------------------------------------------
# Phone
# ---------------------------------------------------------------------------

class TestValidatePhone:
    def test_validate_phone_valid(self):
        assert validate_phone("9876543210") == "9876543210"

    def test_validate_phone_valid_with_country_code(self):
        assert validate_phone("+919876543210") == "9876543210"

    def test_validate_phone_valid_with_spaces(self):
        assert validate_phone("98765 43210") == "9876543210"

    def test_validate_phone_invalid_too_short(self):
        with pytest.raises(ValidationError):
            validate_phone("12345")

    def test_validate_phone_invalid_starts_with_low_digit(self):
        with pytest.raises(ValidationError):
            validate_phone("1234567890")

    def test_validate_phone_invalid_letters(self):
        with pytest.raises(ValidationError):
            validate_phone("98765abcde")


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------

class TestValidateEmail:
    def test_validate_email_valid(self):
        result = validate_email("user@example.com")
        assert result == "user@example.com"

    def test_validate_email_valid_subdomain(self):
        result = validate_email("user@mail.example.co.in")
        assert result == "user@mail.example.co.in"

    def test_validate_email_invalid_no_at(self):
        with pytest.raises(ValidationError):
            validate_email("userexample.com")

    def test_validate_email_invalid_no_domain(self):
        with pytest.raises(ValidationError):
            validate_email("user@")

    def test_validate_email_empty_returns_empty(self):
        assert validate_email("") == ""

    def test_validate_email_none_returns_none(self):
        assert validate_email(None) is None


# ---------------------------------------------------------------------------
# Financial Amount
# ---------------------------------------------------------------------------

class TestValidateFinancialAmount:
    def test_validate_financial_amount_valid(self):
        assert validate_financial_amount("1500") == "1500"

    def test_validate_financial_amount_valid_with_commas(self):
        assert validate_financial_amount("1,500") == "1500"

    def test_validate_financial_amount_zero(self):
        assert validate_financial_amount("0") == "0"

    def test_validate_financial_amount_negative(self):
        with pytest.raises(ValidationError):
            validate_financial_amount("-500")

    def test_validate_financial_amount_exceeds_max(self):
        with pytest.raises(ValidationError):
            validate_financial_amount("100000000")

    def test_validate_financial_amount_non_numeric(self):
        with pytest.raises(ValidationError):
            validate_financial_amount("abc")

    def test_validate_financial_amount_empty(self):
        assert validate_financial_amount("") == ""

    def test_validate_financial_amount_none(self):
        assert validate_financial_amount(None) is None


# ---------------------------------------------------------------------------
# Aadhaar
# ---------------------------------------------------------------------------

class TestValidateAadhaar:
    def test_validate_aadhaar_valid(self):
        assert validate_aadhaar("123456789012") == "123456789012"

    def test_validate_aadhaar_valid_with_spaces(self):
        assert validate_aadhaar("1234 5678 9012") == "123456789012"

    def test_validate_aadhaar_invalid_too_short(self):
        with pytest.raises(ValidationError):
            validate_aadhaar("12345678")

    def test_validate_aadhaar_invalid_letters(self):
        with pytest.raises(ValidationError):
            validate_aadhaar("12345678901A")

    def test_validate_aadhaar_empty(self):
        assert validate_aadhaar("") == ""


# ---------------------------------------------------------------------------
# PAN
# ---------------------------------------------------------------------------

class TestValidatePan:
    def test_validate_pan_valid(self):
        assert validate_pan("ABCDE1234F") == "ABCDE1234F"

    def test_validate_pan_valid_lowercase(self):
        assert validate_pan("abcde1234f") == "ABCDE1234F"

    def test_validate_pan_invalid_format(self):
        with pytest.raises(ValidationError):
            validate_pan("12345ABCDE")

    def test_validate_pan_invalid_too_short(self):
        with pytest.raises(ValidationError):
            validate_pan("ABCD1234")

    def test_validate_pan_empty(self):
        assert validate_pan("") == ""


# ---------------------------------------------------------------------------
# IFSC
# ---------------------------------------------------------------------------

class TestValidateIfsc:
    def test_validate_ifsc_valid(self):
        assert validate_ifsc("SBIN0001234") == "SBIN0001234"

    def test_validate_ifsc_valid_lowercase(self):
        assert validate_ifsc("sbin0001234") == "SBIN0001234"

    def test_validate_ifsc_invalid_no_zero(self):
        with pytest.raises(ValidationError):
            validate_ifsc("SBIN1001234")

    def test_validate_ifsc_invalid_too_short(self):
        with pytest.raises(ValidationError):
            validate_ifsc("SBI0123")

    def test_validate_ifsc_empty(self):
        assert validate_ifsc("") == ""


# ---------------------------------------------------------------------------
# Pincode
# ---------------------------------------------------------------------------

class TestValidatePincode:
    def test_validate_pincode_valid(self):
        assert validate_pincode("560001") == "560001"

    def test_validate_pincode_invalid_five_digits(self):
        with pytest.raises(ValidationError):
            validate_pincode("56000")

    def test_validate_pincode_invalid_letters(self):
        with pytest.raises(ValidationError):
            validate_pincode("56000A")

    def test_validate_pincode_empty(self):
        assert validate_pincode("") == ""


# ---------------------------------------------------------------------------
# File Size
# ---------------------------------------------------------------------------

class TestValidateFileSize:
    def test_validate_file_size_valid(self):
        small_file = SimpleUploadedFile("test.txt", b"x" * 100)
        # Should not raise
        validate_file_size(small_file)

    def test_validate_file_size_too_large(self):
        # Create a file object that claims to be 15 MB
        large_file = SimpleUploadedFile("big.txt", b"")
        large_file.size = 15 * 1024 * 1024  # 15 MB
        with pytest.raises(ValidationError, match="File too large"):
            validate_file_size(large_file)

    def test_validate_file_size_at_limit(self):
        at_limit = SimpleUploadedFile("ok.txt", b"")
        at_limit.size = 10 * 1024 * 1024  # exactly 10 MB
        # Should not raise (not strictly greater)
        validate_file_size(at_limit)


# ---------------------------------------------------------------------------
# Sanitize Text
# ---------------------------------------------------------------------------

class TestSanitizeText:
    def test_sanitize_text_strips_whitespace(self):
        assert sanitize_text("  hello  ") == "hello"

    def test_sanitize_text_within_limit(self):
        assert sanitize_text("short", max_length=100) == "short"

    def test_sanitize_text_too_long(self):
        with pytest.raises(ValidationError, match="Text too long"):
            sanitize_text("a" * 501)

    def test_sanitize_text_custom_max_length(self):
        with pytest.raises(ValidationError, match="Text too long"):
            sanitize_text("a" * 11, max_length=10)

    def test_sanitize_text_empty(self):
        assert sanitize_text("") == ""

    def test_sanitize_text_none(self):
        assert sanitize_text(None) is None


# ---------------------------------------------------------------------------
# Validate Required
# ---------------------------------------------------------------------------

class TestValidateRequired:
    def test_validate_required_with_value(self):
        assert validate_required("hello", "Name") == "hello"

    def test_validate_required_empty_string(self):
        with pytest.raises(ValidationError, match="Name is required"):
            validate_required("", "Name")

    def test_validate_required_none(self):
        with pytest.raises(ValidationError, match="Field is required"):
            validate_required(None)

    def test_validate_required_whitespace_only(self):
        with pytest.raises(ValidationError, match="Field is required"):
            validate_required("   ")
