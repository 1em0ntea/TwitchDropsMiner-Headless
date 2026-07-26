from __future__ import annotations

import asyncio
import logging
import re
from collections import deque
from datetime import datetime, timezone
from time import monotonic
from typing import Any, TYPE_CHECKING

from yarl import URL

from constants import PriorityMode, State
from exceptions import ExitRequest
from translate import _
from version import __version__

from .config import WebConfig
from .serializers import (
    serialize_active_drop,
    serialize_campaign,
    serialize_channel,
)
from .state import StatePublisher

if TYPE_CHECKING:
    from collections.abc import Awaitable

    from inventory import DropsCampaign, TimedDrop
    from twitch import Twitch
    from utils import Game


logger = logging.getLogger("TwitchDrops")


class RevisionConflict(Exception):
    pass


class InvalidCommand(ValueError):
    pass


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


_SECRET_PATTERN = re.compile(
    r"(?i)\b(authorization|auth-token|password|access_token|refresh_token)"
    r"(\s*[\"']?\s*[:=]\s*[\"']?)([^,\s}\"']+)"
)
_PROXY_PASSWORD_PATTERN = re.compile(r"(://[^:/@\s]+:)[^@\s]+(@)")


def _redact(message: str) -> str:
    message = _SECRET_PATTERN.sub(r"\1\2***", message)
    return _PROXY_PASSWORD_PATTERN.sub(r"\1***\2", message)


class _LogHandler(logging.Handler):
    def __init__(self, manager: "WebUIManager") -> None:
        super().__init__()
        self._manager = manager

    def emit(self, record: logging.LogRecord) -> None:
        try:
            self._manager.add_activity(record.levelname.lower(), self.format(record))
        except Exception:
            self.handleError(record)


class _StatusAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager

    def update(self, text: str) -> None:
        self._manager._status = text
        self._manager.publisher.changed()

    def clear(self) -> None:
        self.update("")


class _WebsocketAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager
        self._connections: dict[int, dict[str, Any]] = {}

    def update(
        self, idx: int, status: str | None = None, topics: int | None = None
    ) -> None:
        if status is None and topics is None:
            raise TypeError("At least one of status or topics is required")
        item = self._connections.setdefault(
            idx, {"id": idx + 1, "status": "", "topics": 0}
        )
        if status is not None:
            item["status"] = status
        if topics is not None:
            item["topics"] = topics
        self._manager.publisher.changed()

    def remove(self, idx: int) -> None:
        self._connections.pop(idx, None)
        self._manager.publisher.changed()

    def snapshot(self) -> list[dict[str, Any]]:
        return [dict(item) for _, item in sorted(self._connections.items())]


class _LoginAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager

    def clear(
        self, login: bool = False, password: bool = False, token: bool = False
    ) -> None:
        return None

    async def ask_login(self) -> Any:
        raise RuntimeError(
            "The legacy Twitch username/password login flow is disabled in headless mode"
        )

    async def ask_enter_code(self, page_url: URL, user_code: str) -> None:
        self._manager._account_activation = {
            "url": str(page_url),
            "code": user_code,
        }
        self._manager._account_status = _("gui", "login", "required")
        self._manager.publisher.changed()

    def update(self, status: str, user_id: int | None) -> None:
        self._manager._account_status = status
        self._manager._account_user_id = user_id
        if user_id is not None:
            self._manager._account_activation = None
        self._manager.publisher.changed()


class _ProgressAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager
        self._drop: TimedDrop | None = None
        self._started_at: float | None = None
        self._base_elapsed = 0

    def display(
        self,
        drop: TimedDrop | None,
        *,
        countdown: bool = True,
        subone: bool = False,
    ) -> None:
        self._drop = drop
        self._started_at = None
        self._base_elapsed = 0
        if drop is not None:
            if countdown and drop.remaining_minutes > 0:
                self._started_at = monotonic()
            elif subone:
                self._base_elapsed = 60
        self._manager.publisher.changed()

    def _elapsed(self) -> int:
        if self._started_at is None:
            return self._base_elapsed
        return min(60, self._base_elapsed + int(monotonic() - self._started_at))

    def stop_timer(self) -> None:
        if self._started_at is not None:
            self._base_elapsed = self._elapsed()
            self._started_at = None
        self._manager.publisher.changed()

    def minute_almost_done(self) -> bool:
        return self._started_at is None or 60 - self._elapsed() <= 10

    def snapshot(self) -> dict[str, Any] | None:
        if self._drop is None:
            return None
        return serialize_active_drop(self._drop, self._elapsed())


class _ChannelAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager
        self._channels: dict[str, Any] = {}
        self._watching_id: str | None = None
        self._selected_id: str | None = None

    def clear(self) -> None:
        self._channels.clear()
        self._watching_id = None
        self._selected_id = None
        self._manager.publisher.changed()

    def display(self, channel: Any, *, add: bool = False) -> None:
        channel_id = str(channel.id)
        if not add and channel_id not in self._channels:
            return
        self._channels[channel_id] = channel
        self._manager.publisher.changed()

    def remove(self, channel: Any) -> None:
        channel_id = str(channel.id)
        self._channels.pop(channel_id, None)
        if self._watching_id == channel_id:
            self._watching_id = None
        if self._selected_id == channel_id:
            self._selected_id = None
        self._manager.publisher.changed()

    def set_watching(self, channel: Any) -> None:
        self._watching_id = str(channel.id)
        self._manager.publisher.changed()

    def clear_watching(self) -> None:
        self._watching_id = None
        self._manager.publisher.changed()

    def select(self, channel_id: str) -> Any:
        channel = self._channels.get(channel_id)
        if channel is None:
            raise InvalidCommand("The selected channel is no longer available")
        self._selected_id = channel_id
        self._manager.publisher.changed()
        return channel

    def get_selection(self) -> Any | None:
        if self._selected_id is None:
            return None
        channel = self._manager._twitch.channels.get(int(self._selected_id))
        if channel is None:
            self._selected_id = None
        return channel

    def clear_selection(self) -> None:
        self._selected_id = None
        self._manager.publisher.changed()

    def snapshot(self) -> list[dict[str, Any]]:
        rows = [
            serialize_channel(
                channel,
                watching=channel_id == self._watching_id,
                selected=channel_id == self._selected_id,
            )
            for channel_id, channel in self._channels.items()
        ]
        rows.sort(
            key=lambda item: (
                not item["watching"],
                item["status"] != "online",
                -(item["viewers"] or -1),
                item["name"].casefold(),
            )
        )
        return rows


class _InventoryAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager
        self._campaigns: dict[str, DropsCampaign] = {}

    async def add_campaign(self, campaign: DropsCampaign) -> None:
        self._campaigns[str(campaign.id)] = campaign
        self._manager.publisher.changed()

    def clear(self) -> None:
        self._campaigns.clear()
        self._manager.publisher.changed()

    def update_drop(self, drop: TimedDrop) -> None:
        self._campaigns[str(drop.campaign.id)] = drop.campaign
        self._manager.publisher.changed()

    def snapshot(self) -> list[dict[str, Any]]:
        campaigns = [serialize_campaign(campaign) for campaign in self._campaigns.values()]
        status_order = {"active": 0, "upcoming": 1, "expired": 2}
        campaigns.sort(
            key=lambda item: (
                status_order.get(item["status"], 3),
                not item["eligible"],
                item["ends_at"],
            )
        )
        return campaigns


class _TrayAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager

    def change_icon(self, state: str) -> None:
        self._manager._icon = state
        self._manager.publisher.changed()

    def notify(
        self, message: str, title: str, *, urgency: str = "normal"
    ) -> None:
        self._manager.add_activity("notification", f"{title}: {message}")

    def update_title(self, drop: TimedDrop | None) -> None:
        return None

    def stop(self) -> None:
        return None


class _TokenButtonShim:
    def __init__(self, manager: "WebUIManager") -> None:
        self._manager = manager

    def config(self, *, state: str, **_: Any) -> None:
        self._manager._token_available = state == "normal"
        self._manager.publisher.changed()


class _HelpAdapter:
    def __init__(self, manager: "WebUIManager") -> None:
        self._invalidate_button = _TokenButtonShim(manager)


class _NoopSelection:
    def clear_selection(self) -> None:
        return None


class WebUIManager:
    def __init__(self, twitch: Twitch, config: WebConfig) -> None:
        self._twitch = twitch
        self._config = config
        self.publisher = StatePublisher()
        self._close_requested = asyncio.Event()
        self._running = False
        self._server: Any | None = None
        self._server_ready = False
        self._started_monotonic = monotonic()
        self._started_at = _utc_now()
        self._status = "Starting"
        self._icon = "pickaxe"
        self._error: str | None = None
        self._account_status = _("gui", "login", "logged_out")
        self._account_user_id: int | None = None
        self._account_activation: dict[str, str] | None = None
        self._token_available = False
        self._games: set[str] = set()
        self._activity: deque[dict[str, str]] = deque(maxlen=500)
        self._settings_lock = asyncio.Lock()
        self._settings_revision = 0

        self.status = _StatusAdapter(self)
        self.websockets = _WebsocketAdapter(self)
        self.login = _LoginAdapter(self)
        self.progress = _ProgressAdapter(self)
        self.channels = _ChannelAdapter(self)
        self.inv = _InventoryAdapter(self)
        self.tray = _TrayAdapter(self)
        self.help = _HelpAdapter(self)
        self.settings = _NoopSelection()
        self.tabs = _NoopSelection()

        self._log_handler = _LogHandler(self)
        self._log_handler.setFormatter(
            logging.Formatter("{levelname}: {message}", style="{")
        )
        logger.addHandler(self._log_handler)

    @property
    def running(self) -> bool:
        return self._running

    @property
    def close_requested(self) -> bool:
        return self._close_requested.is_set()

    async def start_web_server(self) -> None:
        if self._server is not None:
            return
        from .server import WebServer

        self._server = WebServer(self, self._config)
        await self._server.start()
        self._server_ready = True
        self.publisher.changed()

    async def shutdown_web_server(self) -> None:
        self._server_ready = False
        if self._server is not None:
            await self._server.stop()
            self._server = None
        self.publisher.changed()

    def start(self) -> None:
        self._running = True
        self.publisher.changed()

    def stop(self) -> None:
        self._running = False
        self.progress.stop_timer()
        self.publisher.changed()

    def close(self, *_: Any) -> int:
        self._close_requested.set()
        self._twitch.close()
        self.publisher.changed()
        return 0

    async def wait_until_closed(self) -> None:
        await self._close_requested.wait()

    async def coro_unless_closed(self, coro: Awaitable[Any]) -> Any:
        operation = asyncio.ensure_future(coro)
        closing = asyncio.create_task(self._close_requested.wait())
        done, pending = await asyncio.wait(
            (operation, closing), return_when=asyncio.FIRST_COMPLETED
        )
        for task in pending:
            task.cancel()
        if pending:
            await asyncio.gather(*pending, return_exceptions=True)
        if self.close_requested:
            raise ExitRequest
        return await next(iter(done))

    def prevent_close(self) -> None:
        self._close_requested.clear()

    def close_window(self) -> None:
        logger.removeHandler(self._log_handler)

    def save(self, *, force: bool = False) -> None:
        return None

    def apply_theme(self, dark: bool) -> None:
        settings = self._twitch.settings
        previous = settings.dark_mode
        previous_altered = getattr(settings, "_altered", False)
        settings.dark_mode = dark
        try:
            settings.save(force=True)
        except Exception:
            settings.dark_mode = previous
            settings._altered = previous_altered
            raise
        self._settings_revision += 1
        self.publisher.changed()

    def grab_attention(self, *, sound: bool = True) -> None:
        self.add_activity("warning", "The miner requires administrator attention")

    def print(self, message: str) -> None:
        for line in str(message).splitlines() or [""]:
            self.add_activity("info", line)

    def add_activity(self, level: str, message: str) -> None:
        self._activity.append(
            {"timestamp": _utc_now(), "level": level, "message": _redact(message)}
        )
        self.publisher.changed()

    def mark_error(self, message: str) -> None:
        self._error = _redact(message)
        self._status = "Fatal error"
        self._icon = "error"
        self.add_activity("error", message)

    def set_games(self, games: set[Game]) -> None:
        self._games = {game.name for game in games}
        self.publisher.changed()

    def display_drop(
        self,
        drop: TimedDrop,
        *,
        countdown: bool = True,
        subone: bool = False,
    ) -> None:
        self.progress.display(drop, countdown=countdown, subone=subone)

    def clear_drop(self) -> None:
        self.progress.display(None)

    def refresh_inventory(self) -> None:
        self._twitch.change_state(State.INVENTORY_FETCH)

    def restart_miner(self) -> None:
        self._twitch.change_state(State.RESTART)

    def switch_channel(self, channel_id: str) -> None:
        self.channels.select(channel_id)
        self._twitch.change_state(State.CHANNEL_SWITCH)

    async def revoke_twitch_auth(self) -> None:
        auth_state = self._twitch._auth_state
        token = getattr(auth_state, "access_token", None)
        if token:
            try:
                async with self._twitch.request(
                    "POST",
                    "https://id.twitch.tv/oauth2/revoke",
                    data={
                        "client_id": self._twitch._client_type.CLIENT_ID,
                        "token": token,
                    },
                ) as response:
                    if response.status != 200:
                        logger.warning(
                            "Twitch token revocation returned HTTP %s", response.status
                        )
            finally:
                auth_state.invalidate(delete_cookies=True)
        self._account_user_id = None
        self._account_status = _("gui", "login", "logged_out")
        self._account_activation = None
        self._token_available = False
        self._twitch.change_state(State.RESTART)
        self.publisher.changed()

    @staticmethod
    def _parse_priority_mode(value: Any) -> PriorityMode:
        if isinstance(value, int) and not isinstance(value, bool):
            try:
                return PriorityMode(value)
            except ValueError as exc:
                raise InvalidCommand("Invalid priority mode") from exc
        if isinstance(value, str):
            normalized = value.strip().upper()
            aliases = {
                "PRIORITY_ONLY": PriorityMode.PRIORITY_ONLY,
                "ENDING_SOONEST": PriorityMode.ENDING_SOONEST,
                "LOW_AVBL_FIRST": PriorityMode.LOW_AVBL_FIRST,
                "LOW_AVAILABILITY": PriorityMode.LOW_AVBL_FIRST,
            }
            if normalized in aliases:
                return aliases[normalized]
        raise InvalidCommand("Invalid priority mode")

    @staticmethod
    def _game_names(value: Any, field: str) -> list[str]:
        if not isinstance(value, list) or len(value) > 500:
            raise InvalidCommand(f"{field} must be a list with at most 500 items")
        names: list[str] = []
        seen: set[str] = set()
        for item in value:
            if not isinstance(item, str):
                raise InvalidCommand(f"{field} entries must be strings")
            name = item.strip()
            if not name or len(name) > 120:
                raise InvalidCommand(f"{field} contains an invalid game name")
            if name not in seen:
                seen.add(name)
                names.append(name)
        return names

    async def apply_settings(
        self, payload: dict[str, Any], expected_revision: int | None
    ) -> None:
        field_names = (
            "priority",
            "exclude",
            "priority_mode",
            "proxy",
            "language",
            "dark_mode",
            "connection_quality",
            "enable_badges_emotes",
            "available_drops_check",
        )
        unknown = set(payload) - set(field_names)
        if unknown:
            raise InvalidCommand(f"Unknown settings: {', '.join(sorted(unknown))}")

        async with self._settings_lock:
            if (
                expected_revision is not None
                and expected_revision != self._settings_revision
            ):
                raise RevisionConflict

            settings = self._twitch.settings
            original = {name: getattr(settings, name) for name in field_names}
            staged = {
                "priority": list(original["priority"]),
                "exclude": set(original["exclude"]),
                "priority_mode": original["priority_mode"],
                "proxy": original["proxy"],
                "language": original["language"],
                "dark_mode": original["dark_mode"],
                "connection_quality": original["connection_quality"],
                "enable_badges_emotes": original["enable_badges_emotes"],
                "available_drops_check": original["available_drops_check"],
            }

            if "priority" in payload:
                staged["priority"] = self._game_names(payload["priority"], "priority")
            if "exclude" in payload:
                staged["exclude"] = set(
                    self._game_names(payload["exclude"], "exclude")
                )
            if "priority_mode" in payload:
                staged["priority_mode"] = self._parse_priority_mode(
                    payload["priority_mode"]
                )
            if "proxy" in payload:
                raw_proxy = payload["proxy"]
                if not isinstance(raw_proxy, str) or len(raw_proxy) > 2048:
                    raise InvalidCommand("proxy must be a string")
                raw_proxy = raw_proxy.strip()
                if "***" not in raw_proxy:
                    try:
                        proxy = URL(raw_proxy)
                    except (TypeError, ValueError) as exc:
                        raise InvalidCommand(
                            "proxy must be an HTTP or HTTPS URL"
                        ) from exc
                    if raw_proxy and (
                        proxy.scheme not in {"http", "https"} or not proxy.host
                    ):
                        raise InvalidCommand("proxy must be an HTTP or HTTPS URL")
                    staged["proxy"] = proxy
                elif not original["proxy"].password:
                    raise InvalidCommand("The redacted proxy value cannot be saved")
            if "language" in payload:
                language = payload["language"]
                if not isinstance(language, str) or language not in set(_.languages):
                    raise InvalidCommand("Invalid language")
                staged["language"] = language
            if "connection_quality" in payload:
                quality = payload["connection_quality"]
                if (
                    not isinstance(quality, int)
                    or isinstance(quality, bool)
                    or not 1 <= quality <= 6
                ):
                    raise InvalidCommand("connection_quality must be between 1 and 6")
                staged["connection_quality"] = quality
            for field in (
                "dark_mode",
                "enable_badges_emotes",
                "available_drops_check",
            ):
                if field in payload:
                    if not isinstance(payload[field], bool):
                        raise InvalidCommand(f"{field} must be a boolean")
                    staged[field] = payload[field]

            previous_language = _.current
            previous_altered = getattr(settings, "_altered", False)
            try:
                if staged["language"] != previous_language:
                    _.set_language(staged["language"])
                for field in field_names:
                    setattr(settings, field, staged[field])
                settings.save(force=True)
            except Exception:
                for field in field_names:
                    setattr(settings, field, original[field])
                settings._altered = previous_altered
                if _.current != previous_language:
                    _.set_language(previous_language)
                raise

            self._settings_revision += 1
            self._twitch.change_state(State.RESTART)
            self.publisher.changed()

    def _settings_snapshot(self) -> dict[str, Any]:
        settings = self._twitch.settings
        proxy = settings.proxy
        if proxy.password:
            proxy = proxy.with_password("***")
        return {
            "revision": self._settings_revision,
            "priority": list(settings.priority),
            "exclude": sorted(settings.exclude),
            "priority_mode": settings.priority_mode.name,
            "proxy": str(proxy),
            "proxy_configured": bool(settings.proxy),
            "language": settings.language,
            "languages": list(_.languages),
            "dark_mode": bool(settings.dark_mode),
            "connection_quality": int(settings.connection_quality),
            "enable_badges_emotes": bool(settings.enable_badges_emotes),
            "available_drops_check": bool(settings.available_drops_check),
        }

    def snapshot(self) -> dict[str, Any]:
        return {
            "revision": self.publisher.revision,
            "generated_at": _utc_now(),
            "service": {
                "version": __version__,
                "status": self._status,
                "icon": self._icon,
                "running": self._running,
                "started_at": self._started_at,
                "uptime_seconds": max(0, int(monotonic() - self._started_monotonic)),
                "ready": self._server_ready,
                "error": self._error,
            },
            "account": {
                "status": self._account_status,
                "user_id": self._account_user_id,
                "token_available": self._token_available,
                "activation": (
                    dict(self._account_activation)
                    if self._account_activation is not None
                    else None
                ),
            },
            "active_drop": self.progress.snapshot(),
            "channels": self.channels.snapshot(),
            "campaigns": self.inv.snapshot(),
            "connections": self.websockets.snapshot(),
            "settings": self._settings_snapshot(),
            "games": sorted(self._games),
            "activity": list(self._activity),
        }
