from __future__ import annotations

import ipaddress
import os
from dataclasses import dataclass
from pathlib import Path


def _env_bool(name: str, default: bool = False) -> bool:
    raw = os.environ.get(name)
    if raw is None:
        return default
    normalized = raw.strip().lower()
    if normalized in {"1", "true", "yes", "on"}:
        return True
    if normalized in {"0", "false", "no", "off"}:
        return False
    raise ValueError(f"{name} must be one of: 1, 0, true, false, yes, no")


def _is_loopback(host: str) -> bool:
    if host.strip().lower() == "localhost":
        return True
    try:
        return ipaddress.ip_address(host).is_loopback
    except ValueError:
        return False


def _read_password() -> str | None:
    password_file = os.environ.get("TDM_WEB_PASSWORD_FILE", "").strip()
    password_env = os.environ.get("TDM_WEB_PASSWORD")
    if password_file and password_env:
        raise ValueError(
            "Set only one of TDM_WEB_PASSWORD_FILE or TDM_WEB_PASSWORD"
        )
    if password_file:
        path = Path(password_file)
        try:
            password = path.read_text(encoding="utf8").strip()
        except OSError as exc:
            raise ValueError(f"Unable to read TDM_WEB_PASSWORD_FILE: {exc}") from exc
    else:
        password = password_env.strip() if password_env else ""
    if not password:
        return None
    if len(password) < 12:
        raise ValueError("The web administrator password must be at least 12 characters")
    return password


@dataclass(frozen=True, slots=True)
class WebConfig:
    host: str
    port: int
    username: str
    password: str | None
    cookie_secure: bool
    trust_proxy: bool
    session_seconds: int
    allow_unauthenticated: bool

    @property
    def auth_enabled(self) -> bool:
        return self.password is not None

    @classmethod
    def from_env(cls) -> "WebConfig":
        host = os.environ.get("TDM_WEB_HOST", "127.0.0.1").strip()
        if not host:
            raise ValueError("TDM_WEB_HOST cannot be empty")

        raw_port = os.environ.get("TDM_WEB_PORT", "5800")
        try:
            port = int(raw_port)
        except ValueError as exc:
            raise ValueError("TDM_WEB_PORT must be an integer") from exc
        if not 1 <= port <= 65535:
            raise ValueError("TDM_WEB_PORT must be between 1 and 65535")

        username = os.environ.get("TDM_WEB_USERNAME", "admin").strip()
        if not username or len(username) > 64:
            raise ValueError("TDM_WEB_USERNAME must contain 1 to 64 characters")

        password = _read_password()
        allow_unauthenticated = _env_bool(
            "TDM_WEB_ALLOW_UNAUTHENTICATED", default=False
        )
        if password is None and not _is_loopback(host) and not allow_unauthenticated:
            raise ValueError(
                "Refusing an unauthenticated non-loopback listener. Set a web "
                "administrator password, bind to 127.0.0.1, or explicitly set "
                "TDM_WEB_ALLOW_UNAUTHENTICATED=1."
            )

        raw_hours = os.environ.get("TDM_WEB_SESSION_HOURS", "12")
        try:
            session_hours = int(raw_hours)
        except ValueError as exc:
            raise ValueError("TDM_WEB_SESSION_HOURS must be an integer") from exc
        if not 1 <= session_hours <= 24 * 30:
            raise ValueError("TDM_WEB_SESSION_HOURS must be between 1 and 720")

        return cls(
            host=host,
            port=port,
            username=username,
            password=password,
            cookie_secure=_env_bool("TDM_WEB_COOKIE_SECURE", default=False),
            trust_proxy=_env_bool("TDM_WEB_TRUST_PROXY", default=False),
            session_seconds=session_hours * 60 * 60,
            allow_unauthenticated=allow_unauthenticated,
        )
