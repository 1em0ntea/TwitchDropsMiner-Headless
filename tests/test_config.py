from __future__ import annotations

import pytest

from headless.config import WebConfig


_ENV_KEYS = (
    "TDM_WEB_HOST",
    "TDM_WEB_PORT",
    "TDM_WEB_USERNAME",
    "TDM_WEB_PASSWORD",
    "TDM_WEB_PASSWORD_FILE",
    "TDM_WEB_COOKIE_SECURE",
    "TDM_WEB_TRUST_PROXY",
    "TDM_WEB_SESSION_HOURS",
    "TDM_WEB_ALLOW_UNAUTHENTICATED",
)


def _clean(monkeypatch: pytest.MonkeyPatch) -> None:
    for key in _ENV_KEYS:
        monkeypatch.delenv(key, raising=False)


def test_loopback_defaults_are_safe(monkeypatch: pytest.MonkeyPatch) -> None:
    _clean(monkeypatch)
    config = WebConfig.from_env()
    assert config.host == "127.0.0.1"
    assert config.port == 5800
    assert not config.auth_enabled


def test_public_listener_requires_auth(monkeypatch: pytest.MonkeyPatch) -> None:
    _clean(monkeypatch)
    monkeypatch.setenv("TDM_WEB_HOST", "0.0.0.0")
    with pytest.raises(ValueError, match="Refusing an unauthenticated"):
        WebConfig.from_env()


def test_password_file_enables_auth(
    monkeypatch: pytest.MonkeyPatch, tmp_path
) -> None:
    _clean(monkeypatch)
    secret = tmp_path / "password"
    secret.write_text("a-strong-test-password\n", encoding="utf8")
    monkeypatch.setenv("TDM_WEB_HOST", "0.0.0.0")
    monkeypatch.setenv("TDM_WEB_PASSWORD_FILE", str(secret))
    monkeypatch.setenv("TDM_WEB_COOKIE_SECURE", "true")
    config = WebConfig.from_env()
    assert config.auth_enabled
    assert config.cookie_secure
    assert config.password == "a-strong-test-password"


def test_short_password_is_rejected(monkeypatch: pytest.MonkeyPatch) -> None:
    _clean(monkeypatch)
    monkeypatch.setenv("TDM_WEB_PASSWORD", "too-short")
    with pytest.raises(ValueError, match="at least 12"):
        WebConfig.from_env()
