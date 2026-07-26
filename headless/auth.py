from __future__ import annotations

import hashlib
import hmac
import secrets
from collections import deque
from dataclasses import dataclass
from time import monotonic

from .config import WebConfig


class AuthenticationFailed(Exception):
    pass


class TooManyAttempts(Exception):
    pass


@dataclass(frozen=True, slots=True)
class Session:
    username: str
    csrf_token: str
    expires_at: float


class SessionAuth:
    COOKIE_NAME = "tdm_session"
    MAX_ATTEMPTS = 5
    ATTEMPT_WINDOW_SECONDS = 60
    MAX_TRACKED_REMOTES = 2048
    MAX_SESSIONS = 128

    def __init__(self, config: WebConfig) -> None:
        self._config = config
        self._salt = secrets.token_bytes(16)
        self._password_digest = (
            self._derive(config.password) if config.password is not None else None
        )
        self._sessions: dict[str, Session] = {}
        self._attempts: dict[str, deque[float]] = {}

    @property
    def enabled(self) -> bool:
        return self._password_digest is not None

    def _derive(self, password: str) -> bytes:
        return hashlib.scrypt(
            password.encode("utf8"),
            salt=self._salt,
            n=2**14,
            r=8,
            p=1,
            dklen=32,
        )

    def _prune(self, now: float) -> None:
        for token, session in tuple(self._sessions.items()):
            if session.expires_at <= now:
                self._sessions.pop(token, None)

        cutoff = now - self.ATTEMPT_WINDOW_SECONDS
        for remote, attempts in tuple(self._attempts.items()):
            while attempts and attempts[0] <= cutoff:
                attempts.popleft()
            if not attempts:
                self._attempts.pop(remote, None)

    def _prune_attempts(self, remote: str, now: float) -> deque[float]:
        self._prune(now)
        attempts = self._attempts.get(remote)
        if attempts is not None:
            return attempts
        if len(self._attempts) >= self.MAX_TRACKED_REMOTES:
            oldest_remote = min(
                self._attempts,
                key=lambda key: self._attempts[key][-1],
            )
            self._attempts.pop(oldest_remote, None)
        attempts = deque()
        self._attempts[remote] = attempts
        return attempts

    def login(self, username: str, password: str, remote: str) -> tuple[str, Session]:
        if not self.enabled:
            raise AuthenticationFailed("Authentication is disabled")
        if len(username) > 64 or len(password) > 4096:
            raise AuthenticationFailed

        now = monotonic()
        attempts = self._prune_attempts(remote, now)
        if len(attempts) >= self.MAX_ATTEMPTS:
            raise TooManyAttempts
        attempts.append(now)

        username_ok = hmac.compare_digest(username, self._config.username)
        password_ok = hmac.compare_digest(
            self._derive(password), self._password_digest or b""
        )
        if not username_ok or not password_ok:
            raise AuthenticationFailed

        self._attempts.pop(remote, None)
        while len(self._sessions) >= self.MAX_SESSIONS:
            oldest_token = min(
                self._sessions,
                key=lambda key: self._sessions[key].expires_at,
            )
            self._sessions.pop(oldest_token, None)
        token = secrets.token_urlsafe(32)
        session = Session(
            username=self._config.username,
            csrf_token=secrets.token_urlsafe(32),
            expires_at=now + self._config.session_seconds,
        )
        self._sessions[token] = session
        return token, session

    def resolve(self, token: str | None) -> Session | None:
        if not self.enabled:
            return Session("", "", float("inf"))
        self._prune(monotonic())
        if not token:
            return None
        return self._sessions.get(token)

    def logout(self, token: str | None) -> None:
        if token:
            self._sessions.pop(token, None)
