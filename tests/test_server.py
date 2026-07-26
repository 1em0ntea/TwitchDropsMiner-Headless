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


def test_health_and_unauthenticated_local_api() -> None:
    async def scenario() -> None:
        manager = FakeManager()
        server = WebServer(manager, _config(None))
        client = TestClient(TestServer(server._app))
        await client.start_server()
        try:
            health = await client.get("/healthz")
            assert health.status == 200
            assert health.headers["X-Content-Type-Options"] == "nosniff"

            session = await client.get("/api/v1/session")
            assert (await session.json())["authenticated"] is True

            snapshot = await client.get("/api/v1/snapshot")
            assert snapshot.status == 200
            assert (await snapshot.json())["service"]["ready"] is True
        finally:
            await client.close()

    asyncio.run(scenario())


def test_authenticated_mutation_requires_csrf() -> None:
    async def scenario() -> None:
        manager = FakeManager()
        server = WebServer(manager, _config("correct horse battery staple"))
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
            assert login.status == 200
            csrf = (await login.json())["csrf_token"]

            forbidden = await client.post("/api/v1/actions/restart")
            assert forbidden.status == 403

            accepted = await client.post(
                "/api/v1/actions/restart",
                headers={"X-CSRF-Token": csrf},
            )
            assert accepted.status == 202
            assert manager.restarted
        finally:
            await client.close()

    asyncio.run(scenario())


def test_loopback_without_auth_rejects_dns_rebinding_host() -> None:
    async def scenario() -> None:
        server = WebServer(FakeManager(), _config(None))
        client = TestClient(TestServer(server._app))
        await client.start_server()
        try:
            response = await client.get(
                "/api/v1/snapshot",
                headers={
                    "Host": "attacker.example",
                    "Origin": "http://attacker.example",
                },
            )
            assert response.status == 403
            assert (await response.json())["error"] == "invalid_host"
            assert response.headers["X-Content-Type-Options"] == "nosniff"
        finally:
            await client.close()

    asyncio.run(scenario())


def test_static_assets_revalidate_after_upgrade() -> None:
    async def scenario() -> None:
        server = WebServer(FakeManager(), _config(None))
        client = TestClient(TestServer(server._app))
        await client.start_server()
        try:
            response = await client.get("/assets/app.js")
            assert response.status == 200
            assert response.headers["Cache-Control"] == "no-cache"
        finally:
            await client.close()

    asyncio.run(scenario())
