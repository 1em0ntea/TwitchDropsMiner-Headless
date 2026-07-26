from __future__ import annotations

import asyncio
import ipaddress
import json
import logging
import os
from pathlib import Path
import tempfile
from typing import Any
from urllib.parse import urlsplit

from aiohttp import web

from constants import RESOURCE_DIR, WORKING_DIR

from .auth import (
    AuthenticationFailed,
    Session,
    SessionAuth,
    TooManyAttempts,
)
from .config import WebConfig
from .manager import InvalidCommand, RevisionConflict, WebUIManager


logger = logging.getLogger("TwitchDrops.web")


def _json(data: Any, *, status: int = 200) -> web.Response:
    return web.json_response(
        data,
        status=status,
        dumps=lambda value: json.dumps(
            value, ensure_ascii=False, separators=(",", ":")
        ),
        headers={"Cache-Control": "no-store"},
    )


def _host_is_loopback(value: str) -> bool:
    try:
        return ipaddress.ip_address(value).is_loopback
    except ValueError:
        pass
    try:
        hostname = urlsplit(f"//{value}").hostname
    except ValueError:
        return False
    if hostname is None:
        return False
    if hostname.lower() == "localhost":
        return True
    try:
        return ipaddress.ip_address(hostname).is_loopback
    except ValueError:
        return False


class WebServer:
    def __init__(self, manager: WebUIManager, config: WebConfig) -> None:
        self._manager = manager
        self._config = config
        self._auth = SessionAuth(config)
        self._runner: web.AppRunner | None = None
        self._site: web.TCPSite | None = None
        self._static_dir = Path(__file__).with_name("static")

        @web.middleware
        async def security_headers(
            request: web.Request, handler: Any
        ) -> web.StreamResponse:
            response = await handler(request)
            response.headers.setdefault(
                "Content-Security-Policy",
                "default-src 'self'; "
                "base-uri 'none'; "
                "connect-src 'self'; "
                "font-src 'self'; "
                "form-action 'self'; "
                "frame-ancestors 'none'; "
                "img-src 'self' data: https:; "
                "object-src 'none'; "
                "script-src 'self'; "
                "style-src 'self'",
            )
            response.headers.setdefault("X-Content-Type-Options", "nosniff")
            response.headers.setdefault("X-Frame-Options", "DENY")
            response.headers.setdefault("Referrer-Policy", "no-referrer")
            response.headers.setdefault(
                "Permissions-Policy",
                "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
            )
            if self._config.cookie_secure:
                response.headers.setdefault(
                    "Strict-Transport-Security", "max-age=31536000"
                )
            return response

        @web.middleware
        async def errors(request: web.Request, handler: Any) -> web.StreamResponse:
            try:
                return await handler(request)
            except RevisionConflict:
                return _json(
                    {
                        "error": "revision_conflict",
                        "message": "State changed in another browser. Reload and try again.",
                    },
                    status=409,
                )
            except InvalidCommand as exc:
                return _json(
                    {"error": "invalid_command", "message": str(exc)}, status=400
                )
            except web.HTTPException as exc:
                return web.Response(
                    status=exc.status,
                    reason=exc.reason,
                    body=exc.body,
                    headers=exc.headers,
                )
            except json.JSONDecodeError:
                return _json(
                    {"error": "invalid_json", "message": "Invalid JSON body"},
                    status=400,
                )
            except Exception:
                logger.exception("Unhandled web request error")
                return _json(
                    {
                        "error": "internal_error",
                        "message": "The request could not be completed.",
                    },
                    status=500,
                )

        @web.middleware
        async def local_host_guard(
            request: web.Request, handler: Any
        ) -> web.StreamResponse:
            if (
                not self._auth.enabled
                and _host_is_loopback(self._config.host)
                and not _host_is_loopback(request.host)
            ):
                raise web.HTTPForbidden(
                    text=json.dumps({"error": "invalid_host"}),
                    content_type="application/json",
                )
            return await handler(request)

        self._app = web.Application(
            client_max_size=64 * 1024,
            middlewares=[security_headers, errors, local_host_guard],
        )
        self._add_routes()

    def _add_routes(self) -> None:
        routes = self._app.router
        routes.add_get("/", self._index)
        routes.add_get("/favicon.ico", self._favicon)
        routes.add_get("/assets/{name}", self._asset)

        routes.add_get("/healthz", self._health)
        routes.add_get("/readyz", self._ready)
        routes.add_get("/api/v1/session", self._session)
        routes.add_post("/api/v1/auth/login", self._login)
        routes.add_post("/api/v1/auth/logout", self._logout)
        routes.add_get("/api/v1/snapshot", self._snapshot)
        routes.add_get("/api/v1/events", self._events)
        routes.add_post(
            "/api/v1/actions/inventory-refresh", self._inventory_refresh
        )
        routes.add_post(
            "/api/v1/actions/channels/{channel_id}/switch", self._channel_switch
        )
        routes.add_delete("/api/v1/account/token", self._revoke_twitch_auth)
        routes.add_patch("/api/v1/settings", self._settings)
        routes.add_post("/api/v1/actions/restart", self._restart)

    async def start(self) -> None:
        self._runner = web.AppRunner(
            self._app, access_log=None, shutdown_timeout=15.0
        )
        await self._runner.setup()
        self._site = web.TCPSite(
            self._runner,
            host=self._config.host,
            port=self._config.port,
            reuse_address=True,
        )
        try:
            await self._site.start()
        except Exception:
            await self._runner.cleanup()
            self._runner = None
            self._site = None
            raise
        logger.info(
            "Web management listening on http://%s:%s",
            self._config.host,
            self._config.port,
        )

    async def stop(self) -> None:
        if self._runner is not None:
            await self._runner.cleanup()
        self._site = None
        self._runner = None

    def _remote(self, request: web.Request) -> str:
        remote = request.remote or "unknown"
        if not self._config.trust_proxy:
            return remote
        try:
            proxy_address = ipaddress.ip_address(remote)
        except ValueError:
            return remote
        if not (proxy_address.is_loopback or proxy_address.is_private):
            return remote
        forwarded = request.headers.get("X-Forwarded-For", "").split(",", 1)[0].strip()
        if not forwarded:
            return remote
        try:
            ipaddress.ip_address(forwarded)
        except ValueError:
            return remote
        return forwarded

    @staticmethod
    def _origin_matches(request: web.Request) -> bool:
        origin = request.headers.get("Origin")
        if not origin:
            return True
        try:
            parsed = urlsplit(origin)
        except ValueError:
            return False
        return parsed.scheme in {"http", "https"} and parsed.netloc == request.host

    def _resolve_session(self, request: web.Request) -> Session | None:
        return self._auth.resolve(
            request.cookies.get(SessionAuth.COOKIE_NAME)
        )

    def _require_auth(self, request: web.Request) -> Session:
        session = self._resolve_session(request)
        if session is None:
            raise web.HTTPUnauthorized(
                text=json.dumps({"error": "unauthorized"}),
                content_type="application/json",
                headers={"Cache-Control": "no-store"},
            )
        return session

    def _require_mutation(self, request: web.Request) -> Session:
        session = self._require_auth(request)
        if not self._origin_matches(request):
            raise web.HTTPForbidden(
                text=json.dumps({"error": "origin_mismatch"}),
                content_type="application/json",
            )
        if self._auth.enabled and not secrets_equal(
            request.headers.get("X-CSRF-Token", ""), session.csrf_token
        ):
            raise web.HTTPForbidden(
                text=json.dumps({"error": "csrf_failed"}),
                content_type="application/json",
            )
        return session

    async def _index(self, request: web.Request) -> web.StreamResponse:
        response = web.FileResponse(self._static_dir / "index.html")
        response.headers["Cache-Control"] = "no-cache"
        return response

    async def _favicon(self, request: web.Request) -> web.StreamResponse:
        return web.FileResponse(RESOURCE_DIR / "icons" / "pickaxe.ico")

    async def _asset(self, request: web.Request) -> web.StreamResponse:
        name = request.match_info["name"]
        if name == "pickaxe.ico":
            path = RESOURCE_DIR / "icons" / "pickaxe.ico"
        elif name in {"app.css", "app.js"}:
            path = self._static_dir / name
        else:
            raise web.HTTPNotFound
        response = web.FileResponse(path)
        response.headers["Cache-Control"] = "no-cache"
        return response

    async def _health(self, request: web.Request) -> web.Response:
        return _json({"ok": True})

    async def _ready(self, request: web.Request) -> web.Response:
        writable = False
        if WORKING_DIR.exists() and os.access(WORKING_DIR, os.W_OK):
            try:
                with tempfile.NamedTemporaryFile(
                    dir=WORKING_DIR, prefix=".ready-", delete=True
                ):
                    writable = True
            except OSError:
                pass
        ready = self._manager._server_ready and writable
        return _json({"ready": ready}, status=200 if ready else 503)

    async def _session(self, request: web.Request) -> web.Response:
        session = self._resolve_session(request)
        return _json(
            {
                "auth_required": self._auth.enabled,
                "authenticated": session is not None,
                "username": session.username if session else None,
                "csrf_token": session.csrf_token if session else None,
            }
        )

    async def _login(self, request: web.Request) -> web.Response:
        if not self._auth.enabled:
            return _json(
                {
                    "error": "auth_disabled",
                    "message": "Web authentication is disabled.",
                },
                status=409,
            )
        body = await request.json()
        if not isinstance(body, dict):
            raise InvalidCommand("Expected a JSON object")
        username = body.get("username")
        password = body.get("password")
        if not isinstance(username, str) or not isinstance(password, str):
            raise InvalidCommand("Username and password are required")
        try:
            token, session = self._auth.login(
                username.strip(), password, self._remote(request)
            )
        except TooManyAttempts:
            return _json(
                {
                    "error": "rate_limited",
                    "message": "Too many sign-in attempts. Try again in one minute.",
                },
                status=429,
            )
        except AuthenticationFailed:
            await asyncio.sleep(0.25)
            return _json(
                {
                    "error": "invalid_credentials",
                    "message": "Invalid username or password.",
                },
                status=401,
            )

        response = _json(
            {
                "authenticated": True,
                "username": session.username,
                "csrf_token": session.csrf_token,
            }
        )
        response.set_cookie(
            SessionAuth.COOKIE_NAME,
            token,
            max_age=self._config.session_seconds,
            path="/",
            httponly=True,
            secure=self._config.cookie_secure,
            samesite="Strict",
        )
        return response

    async def _logout(self, request: web.Request) -> web.Response:
        self._require_mutation(request)
        token = request.cookies.get(SessionAuth.COOKIE_NAME)
        self._auth.logout(token)
        response = _json({"authenticated": False})
        response.del_cookie(SessionAuth.COOKIE_NAME, path="/")
        return response

    async def _snapshot(self, request: web.Request) -> web.Response:
        self._require_auth(request)
        return _json(self._manager.snapshot())

    async def _events(self, request: web.Request) -> web.StreamResponse:
        session_token = request.cookies.get(SessionAuth.COOKIE_NAME)
        self._require_auth(request)
        response = web.StreamResponse(
            status=200,
            headers={
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache, no-store",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )
        await response.prepare(request)

        async def send_snapshot() -> None:
            snapshot = self._manager.snapshot()
            payload = json.dumps(
                snapshot, ensure_ascii=False, separators=(",", ":")
            )
            await response.write(
                (
                    f"id: {snapshot['revision']}\n"
                    "event: snapshot\n"
                    f"data: {payload}\n\n"
                ).encode("utf8")
            )

        try:
            await response.write(b"retry: 3000\n\n")
            async with self._manager.publisher.subscribe() as queue:
                await send_snapshot()
                while True:
                    state_changed = True
                    try:
                        await asyncio.wait_for(queue.get(), timeout=20)
                    except asyncio.TimeoutError:
                        state_changed = False
                    if (
                        self._auth.enabled
                        and self._auth.resolve(session_token) is None
                    ):
                        break
                    if state_changed:
                        await send_snapshot()
                    else:
                        await response.write(b": keepalive\n\n")
        except (ConnectionResetError, RuntimeError):
            pass
        return response

    async def _inventory_refresh(self, request: web.Request) -> web.Response:
        self._require_mutation(request)
        self._manager.refresh_inventory()
        return _json({"accepted": True}, status=202)

    async def _channel_switch(self, request: web.Request) -> web.Response:
        self._require_mutation(request)
        self._manager.switch_channel(request.match_info["channel_id"])
        return _json({"accepted": True}, status=202)

    async def _revoke_twitch_auth(self, request: web.Request) -> web.Response:
        self._require_mutation(request)
        await self._manager.revoke_twitch_auth()
        return _json({"accepted": True}, status=202)

    @staticmethod
    def _expected_revision(request: web.Request) -> int | None:
        raw = request.headers.get("If-Match")
        if raw is None:
            return None
        raw = raw.strip()
        if raw.startswith("W/"):
            raw = raw[2:]
        raw = raw.strip('"')
        try:
            return int(raw)
        except ValueError as exc:
            raise InvalidCommand("If-Match must contain a numeric revision") from exc

    async def _settings(self, request: web.Request) -> web.Response:
        self._require_mutation(request)
        body = await request.json()
        if not isinstance(body, dict):
            raise InvalidCommand("Expected a JSON object")
        await self._manager.apply_settings(body, self._expected_revision(request))
        return _json(self._manager.snapshot())

    async def _restart(self, request: web.Request) -> web.Response:
        self._require_mutation(request)
        self._manager.restart_miner()
        return _json({"accepted": True}, status=202)


def secrets_equal(left: str, right: str) -> bool:
    import hmac

    return hmac.compare_digest(left, right)
