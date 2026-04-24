"""
Shared input validators for StayEase backend views.
Use these to validate user input before processing in views.
"""
import re
import imghdr
from django.core.exceptions import ValidationError


# ─── Phone ──────────────────────────────────────────────────────────────

def validate_phone(value):
    """Validate Indian mobile number (10 digits, starts with 6-9)."""
    cleaned = re.sub(r'[\s\-\+]', '', str(value))
    if cleaned.startswith('91') and len(cleaned) == 12:
        cleaned = cleaned[2:]
    if not re.match(r'^[6-9]\d{9}$', cleaned):
        raise ValidationError(f'Invalid phone number: {value}. Must be 10 digits starting with 6-9.')
    return cleaned


# ─── Email ──────────────────────────────────────────────────────────────

def validate_email(value):
    """Basic email format validation."""
    if not value:
        return value
    pattern = r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, str(value)):
        raise ValidationError(f'Invalid email address: {value}')
    return str(value).strip()


# ─── Financial ──────────────────────────────────────────────────────────

def validate_financial_amount(value):
    """
    Validate financial amount stored as CharField.
    Must be numeric, non-negative, max 99,999,999.
    """
    if value is None or str(value).strip() == '':
        return value
    cleaned = str(value).strip().replace(',', '')
    try:
        amount = float(cleaned)
    except (ValueError, TypeError):
        raise ValidationError(f'Invalid amount: {value}. Must be a valid number.')
    if amount < 0:
        raise ValidationError(f'Amount cannot be negative: {value}')
    if amount > 99_999_999:
        raise ValidationError(f'Amount exceeds maximum allowed: {value}')
    return cleaned


# ─── Identity Documents ────────────────────────────────────────────────

def validate_aadhaar(value):
    """Validate Aadhaar number (12 digits)."""
    if not value:
        return value
    cleaned = re.sub(r'[\s\-]', '', str(value))
    if not re.match(r'^\d{12}$', cleaned):
        raise ValidationError(f'Invalid Aadhaar number: must be 12 digits.')
    return cleaned


def validate_pan(value):
    """Validate PAN number (ABCDE1234F format)."""
    if not value:
        return value
    cleaned = str(value).strip().upper()
    if not re.match(r'^[A-Z]{5}\d{4}[A-Z]$', cleaned):
        raise ValidationError(f'Invalid PAN number: must be in ABCDE1234F format.')
    return cleaned


def validate_ifsc(value):
    """Validate IFSC code (4 letters + 0 + 6 alphanumeric)."""
    if not value:
        return value
    cleaned = str(value).strip().upper()
    if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', cleaned):
        raise ValidationError(f'Invalid IFSC code: must be in ABCD0123456 format.')
    return cleaned


# ─── File Uploads ───────────────────────────────────────────────────────

ALLOWED_IMAGE_TYPES = {'jpeg', 'png', 'gif', 'bmp', 'webp'}
ALLOWED_DOC_TYPES = {'pdf'}
ALLOWED_DATA_TYPES = {'csv', 'xlsx', 'xls'}

MAX_FILE_SIZE_MB = 10
MAX_IMAGE_SIZE_MB = 5


def validate_file_size(file, max_mb=MAX_FILE_SIZE_MB):
    """Reject files larger than max_mb megabytes."""
    if file and hasattr(file, 'size'):
        max_bytes = max_mb * 1024 * 1024
        if file.size > max_bytes:
            raise ValidationError(f'File too large: {file.size / (1024*1024):.1f}MB. Maximum allowed: {max_mb}MB.')


def validate_image_file(file):
    """Validate that the uploaded file is a genuine image."""
    if not file:
        return
    validate_file_size(file, MAX_IMAGE_SIZE_MB)

    # Check file extension
    name = getattr(file, 'name', '') or ''
    ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
    allowed_ext = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'}
    if ext and ext not in allowed_ext:
        raise ValidationError(f'File type not allowed: .{ext}. Allowed: {", ".join(sorted(allowed_ext))}')


def validate_document_file(file):
    """Validate that the uploaded file is a PDF or image."""
    if not file:
        return
    validate_file_size(file, MAX_FILE_SIZE_MB)

    name = getattr(file, 'name', '') or ''
    ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
    allowed_ext = {'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'}
    if ext and ext not in allowed_ext:
        raise ValidationError(f'File type not allowed: .{ext}. Allowed: {", ".join(sorted(allowed_ext))}')


def validate_data_file(file):
    """Validate data files (CSV, Excel)."""
    if not file:
        return
    validate_file_size(file, MAX_FILE_SIZE_MB)

    name = getattr(file, 'name', '') or ''
    ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
    allowed_ext = {'csv', 'xlsx', 'xls'}
    if ext and ext not in allowed_ext:
        raise ValidationError(f'File type not allowed: .{ext}. Allowed: {", ".join(sorted(allowed_ext))}')


# ─── General Text ───────────────────────────────────────────────────────

def sanitize_text(value, max_length=500):
    """Strip and truncate text input."""
    if not value:
        return value
    cleaned = str(value).strip()
    if len(cleaned) > max_length:
        raise ValidationError(f'Text too long: {len(cleaned)} chars. Maximum: {max_length}.')
    return cleaned


def validate_pincode(value):
    """Validate Indian pincode (6 digits)."""
    if not value:
        return value
    cleaned = str(value).strip()
    if not re.match(r'^\d{6}$', cleaned):
        raise ValidationError(f'Invalid pincode: must be 6 digits.')
    return cleaned


def validate_required(value, field_name='Field'):
    """Check that a required field is not empty."""
    if value is None or str(value).strip() == '':
        raise ValidationError(f'{field_name} is required.')
    return str(value).strip()
