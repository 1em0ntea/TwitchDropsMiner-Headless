from __future__ import annotations

import asyncio
from types import SimpleNamespace

from yarl import URL

from constants import PriorityMode, State
from headless.config import WebConfig
from headless.manager import RevisionConflict, WebUIManager


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
        self.saved = 0

    def save(self, *, force: bool = False) -> None:
        self.saved += 1


class FakeTwitch:
    def __init__(self) -> None:
        self.settings = FakeSettings()
        self.channels = {}
        self.states = []

    def change_state(self, state: State) -> None:
        self.states.append(state)

    def close(self) -> None:
        self.change_state(State.EXIT)


class FakeChannel:
    id = 42
    name = "ExampleStreamer"
    url = "https://www.twitch.tv/example"
    online = True
    pending_online = False
    game = "Example Game"
    viewers = 1234
    drops_enabled = True
    acl_based = False


def _manager() -> tuple[WebUIManager, FakeTwitch]:
    twitch = FakeTwitch()
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
    return WebUIManager(twitch, config), twitch


def test_channel_selection_resolves_current_core_object() -> None:
    manager, twitch = _manager()
    channel = FakeChannel()
    twitch.channels[channel.id] = channel
    manager.channels.display(channel, add=True)
    manager.switch_channel(str(channel.id))
    assert manager.channels.get_selection() is channel
    assert twitch.states[-1] is State.CHANNEL_SWITCH
    assert manager.snapshot()["channels"][0]["watching"] is False
    manager.close_window()


def test_settings_are_validated_saved_and_restart() -> None:
    manager, twitch = _manager()
    revision = manager.publisher.revision

    async def apply() -> None:
        await manager.apply_settings(
            {
                "priority": ["Game A", "Game B"],
                "exclude": ["Game C"],
                "priority_mode": "ENDING_SOONEST",
                "connection_quality": 3,
                "dark_mode": True,
            },
            revision,
        )

    asyncio.run(apply())
    assert twitch.settings.priority == ["Game A", "Game B"]
    assert twitch.settings.exclude == {"Game C"}
    assert twitch.settings.priority_mode is PriorityMode.ENDING_SOONEST
    assert twitch.settings.saved == 1
    assert twitch.states[-1] is State.RESTART

    async def conflict() -> None:
        await manager.apply_settings({"dark_mode": False}, revision)

    try:
        asyncio.run(conflict())
    except RevisionConflict:
        pass
    else:
        raise AssertionError("stale settings revision was accepted")
    manager.close_window()


def test_unrelated_state_updates_do_not_conflict_with_settings() -> None:
    manager, twitch = _manager()
    revision = manager.snapshot()["settings"]["revision"]
    manager.add_activity("info", "background update")

    asyncio.run(manager.apply_settings({"dark_mode": True}, revision))

    assert twitch.settings.dark_mode is True
    assert manager.snapshot()["settings"]["revision"] == revision + 1
    manager.close_window()


def test_invalid_settings_payload_is_atomic() -> None:
    manager, twitch = _manager()
    original_priority = list(twitch.settings.priority)
    revision = manager.snapshot()["settings"]["revision"]

    try:
        asyncio.run(
            manager.apply_settings(
                {
                    "priority": ["must-not-be-applied"],
                    "connection_quality": 99,
                },
                revision,
            )
        )
    except ValueError:
        pass
    else:
        raise AssertionError("invalid settings payload was accepted")

    assert twitch.settings.priority == original_priority
    assert twitch.settings.saved == 0
    assert manager.snapshot()["settings"]["revision"] == revision
    manager.close_window()
