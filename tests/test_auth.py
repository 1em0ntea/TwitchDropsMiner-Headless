from __future__ import annotations

import pytest

from headless.auth import AuthenticationFailed, SessionAuth, TooManyAttempts
from headless.config import WebConfig


def _config() -> WebConfig:
    return WebConfig(
        host="127.0.0.1",
        port=5800,
        username="admin",
        password="correct horse battery staple",
        cookie_secure=False,
        trust_proxy=False,
        session_seconds=3600,
        allow_unauthenticated=False,
    )


def test_login_session_and_logout() -> None:
    auth = SessionAuth(_config())
    with pytest.raises(AuthenticationFailed):
        auth.login("admin", "wrong password", "127.0.0.1")

    token, session = auth.login(
        "admin", "correct horse battery staple", "127.0.0.1"
    )
    assert auth.resolve(token) == session
    assert session.csrf_token
    auth.logout(token)
    assert auth.resolve(token) is None


def test_login_rate_limit() -> None:
    auth = SessionAuth(_config())
    for _ in range(auth.MAX_ATTEMPTS):
        with pytest.raises(AuthenticationFailed):
            auth.login("admin", "wrong password", "198.51.100.4")
    with pytest.raises(TooManyAttempts):
        auth.login("admin", "wrong password", "198.51.100.4")


def test_auth_state_is_bounded() -> None:
    auth = SessionAuth(_config())
    auth.MAX_TRACKED_REMOTES = 2
    for remote in ("198.51.100.1", "198.51.100.2", "198.51.100.3"):
        with pytest.raises(AuthenticationFailed):
            auth.login("admin", "wrong password", remote)
    assert len(auth._attempts) == 2

    auth.MAX_SESSIONS = 2
    tokens = [
        auth.login("admin", "correct horse battery staple", f"203.0.113.{idx}")[0]
        for idx in range(1, 4)
    ]
    assert len(auth._sessions) == 2
    assert auth.resolve(tokens[0]) is None
    assert auth.resolve(tokens[-1]) is not None
