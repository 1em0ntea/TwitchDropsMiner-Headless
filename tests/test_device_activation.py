from __future__ import annotations

import asyncio

from yarl import URL

from constants import PriorityMode
from headless.config import WebConfig
from headless.manager import WebUIManager


class FakeSettings:
    def __init__(self) -> None:
        self.priority = []
        self.exclude = set()
        self.priority_mode = PriorityMode.PRIORITY_ONLY
        self.proxy = URL()
        self.language = "English"
        self.dark_mode = False
        self.connection_quality = 1
        self.enable_badges_emotes = False
        self.available_drops_check = False
        self._altered = False

    def save(self, *, force: bool = False) -> None:
        return None


class FakeTwitch:
    def __init__(self) -> None:
        self.settings = FakeSettings()
        self.channels = {}

    def close(self) -> None:
        return None


def test_device_code_is_exposed_then_cleared_after_login() -> None:
    config = WebConfig(
        host="127.0.0.1",
        port=5800,
        username="admin",
        password=None,
        cookie_secure=False,
        trust_proxy=False,
        session_seconds=3600,
        allow_unauthenticated=False,
    )
    manager = WebUIManager(FakeTwitch(), config)
    try:
        asyncio.run(
            manager.login.ask_enter_code(
                URL("https://www.twitch.tv/activate"), "ABCD-EFGH"
            )
        )
        activation = manager.snapshot()["account"]["activation"]
        assert activation == {
            "url": "https://www.twitch.tv/activate",
            "code": "ABCD-EFGH",
        }

        manager.login.update("Logged in", 123456)
        account = manager.snapshot()["account"]
        assert account["user_id"] == 123456
        assert account["activation"] is None
    finally:
        manager.close_window()
