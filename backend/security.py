# backend/security.py
"""パスワードハッシュ化ユーティリティ。

argon2id を新規ハッシュ方式とし、verify は argon2 / bcrypt 両形式を prefix で
自動判定する。bcrypt は既存ユーザー段階移行のためのフォールバック検証専用で、
新規生成には使わない。
"""
import bcrypt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError

_ph = PasswordHasher()
_BCRYPT_PREFIX = "$2"  # bcrypt: $2a$ / $2b$ / $2x$ / $2y$
_ARGON2_PREFIX = "$argon2"


def hash_password(plain: str) -> str:
    """平文パスワードを argon2id ハッシュにして返す。"""
    return _ph.hash(plain)


def verify_password(plain: str, hashed: str) -> bool:
    """argon2id または bcrypt ハッシュに対して平文を検証する。"""
    if hashed.startswith(_ARGON2_PREFIX):
        try:
            return _ph.verify(hashed, plain)
        except (VerifyMismatchError, VerificationError, InvalidHashError):
            return False
    if hashed.startswith(_BCRYPT_PREFIX):
        try:
            return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
        except (ValueError, TypeError):
            return False
    return False


def needs_rehash(hashed: str) -> bool:
    """既存ハッシュが旧形式 (bcrypt) で、argon2 への再ハッシュ対象か判定する。"""
    return hashed.startswith(_BCRYPT_PREFIX)
