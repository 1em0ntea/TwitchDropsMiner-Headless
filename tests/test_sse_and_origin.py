from __future__ import annotations

import asyncio

import aiohttp
from aiohttp.test_utils import TestClient, TestServer

from headless.config import WebConfig
from headless.server import WebServer
from headless.state import StatePublisher


class FakeManager:
    def __init__(self) -> None:
        self._server_ready = True
        self.publisher = StatePublisher()
        self.restarted = False

    def snapshot(self):
        return {
            "revision": self.publisher.revision,
            "generated_at": "2026-01-01T00:00:00Z",
            "service": {"ready": True},
            "account": {},
            "active_drop": None,
            "channels": [],
            "campaigns": [],
            "connections": [],
            "settings": {},
            "games": [],
            "activity": [],
        }

    def refresh_inventory(self) -> None:
        return None

    def switch_channel(self, channel_id: str) -> None:
        return None

    async def revoke_twitch_auth(self) -> None:
        return None

    async def apply_settings(self, payload, expected_revision) -> None:
        return None

    def restart_miner(self) -> None:
        self.restarted = True


def _config(password: str | None) -> WebConfig:
    return WebConfig(
        host="127.0.0.1",
        port=5800,
        username="admin",
        password=password,
        cookie_secure=False,
        trust_proxy=False,
        session_seconds=3600,
        allow_unauthenticated=False,
    )


def test_sse_starts_with_retry_and_snapshot() -> None:
    async def scenario() -> None:
        server = WebServer(FakeManager(), _config(None))
        client = TestClient(TestServer(server._app))
        await client.start_server()
        try:
            response = await client.get("/api/v1/events")
            assert response.status == 200
            retry = await asyncio.wait_for(
                response.content.readuntil(b"\n\n"), timeout=1
            )
            event = await asyncio.wait_for(
                response.content.readuntil(b"\n\n"), timeout=1
            )
            assert retry == b"retry: 3000\n\n"
            assert b"event: snapshot\n" in event
            assert b'"revision":0' in event
            response.close()
        finally:
            await client.close()

    asyncio.run(scenario())


def test_authenticated_origin_mismatch_is_rejected() -> None:
    async def scenario() -> None:
        server = WebServer(
            FakeManager(), _config("correct horse battery staple")
        )
        client = TestClient(
            TestServer(server._app),
            cookie_jar=aiohttp.CookieJar(unsafe=True),
        )
        await client.start_server()
        try:
            login = await client.post(
                "/api/v1/auth/login",
                json={
                    "username": "admin",
                    "password": "correct horse battery staple",
                },
            )
            csrf = (await login.json())["csrf_token"]
            response = await client.post(
                "/api/v1/actions/restart",
                headers={
                    "Origin": "https://attacker.example",
                    "X-CSRF-Token": csrf,
                },
            )
            assert response.status == 403
            assert (await response.json())["error"] == "origin_mismatch"
        finally:
            await client.close()

    asyncio.run(scenario())
