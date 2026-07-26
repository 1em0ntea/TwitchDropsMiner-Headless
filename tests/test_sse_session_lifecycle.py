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


def test_logout_closes_the_authenticated_sse_stream() -> None:
    async def scenario() -> None:
        config = WebConfig(
            host="127.0.0.1",
            port=5800,
            username="admin",
            password="correct horse battery staple",
            cookie_secure=False,
            trust_proxy=False,
            session_seconds=3600,
            allow_unauthenticated=False,
        )
        manager = FakeManager()
        server = WebServer(manager, config)
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
            events = await client.get("/api/v1/events")
            await events.content.readuntil(b"\n\n")
            await events.content.readuntil(b"\n\n")

            logout = await client.post(
                "/api/v1/auth/logout",
                headers={"X-CSRF-Token": csrf},
            )
            assert logout.status == 200
            manager.publisher.changed()
            assert await asyncio.wait_for(events.content.read(), timeout=1) == b""
        finally:
            await client.close()

    asyncio.run(scenario())
