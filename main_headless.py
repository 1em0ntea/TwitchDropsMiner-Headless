from __future__ import annotations

import argparse
import asyncio
import logging
import os
import signal
import sys
import traceback
import warnings
from typing import NoReturn

import truststore

truststore.inject_into_ssl()

from constants import (  # noqa: E402
    FILE_FORMATTER,
    LOCK_PATH,
    LOGGING_LEVELS,
    LOG_PATH,
    SELF_PATH,
    WORKING_DIR,
)
from exceptions import CaptchaRequired  # noqa: E402
from headless import WebConfig, WebUIManager  # noqa: E402
from settings import Settings  # noqa: E402
from translate import _  # noqa: E402
from twitch import Twitch  # noqa: E402
from utils import lock_file  # noqa: E402
from version import __version__  # noqa: E402


warnings.simplefilter("default", ResourceWarning)


class ParsedArgs(argparse.Namespace):
    _verbose: int
    _debug_ws: bool
    _debug_gql: bool
    log: bool
    stdlog: bool
    tray: bool
    dump: bool

    @property
    def logging_level(self) -> int:
        return LOGGING_LEVELS[min(self._verbose, 4)]

    @property
    def debug_ws(self) -> int:
        if self._debug_ws:
            return logging.DEBUG
        if self._verbose >= 4:
            return logging.INFO
        return logging.NOTSET

    @property
    def debug_gql(self) -> int:
        if self._debug_gql:
            return logging.DEBUG
        if self._verbose >= 4:
            return logging.INFO
        return logging.NOTSET


class _MaximumLevel(logging.Filter):
    def __init__(self, maximum: int) -> None:
        super().__init__()
        self._maximum = maximum

    def filter(self, record: logging.LogRecord) -> bool:
        return record.levelno <= self._maximum


def _parse_args() -> ParsedArgs:
    parser = argparse.ArgumentParser(
        SELF_PATH.name,
        description=(
            "Lightweight headless Twitch Drops Miner with a native web "
            "management interface."
        ),
    )
    parser.add_argument("--version", action="version", version=f"v{__version__}")
    parser.add_argument("-v", dest="_verbose", action="count", default=0)
    parser.add_argument("--log", action="store_true")
    parser.add_argument(
        "--stdlog",
        action="store_true",
        help="Write application logs to stdout and stderr",
    )
    parser.add_argument("--dump", action="store_true")
    parser.add_argument(
        "--debug-ws", dest="_debug_ws", action="store_true", help=argparse.SUPPRESS
    )
    parser.add_argument(
        "--debug-gql", dest="_debug_gql", action="store_true", help=argparse.SUPPRESS
    )
    parser.set_defaults(tray=False)
    return parser.parse_args(namespace=ParsedArgs())


def _configure_logging(settings: Settings) -> None:
    if settings.logging_level > logging.DEBUG:
        logging.getLogger().addHandler(logging.NullHandler())

    logger = logging.getLogger("TwitchDrops")
    logger.setLevel(settings.logging_level)
    if settings.log:
        file_handler = logging.FileHandler(LOG_PATH, encoding="utf8")
        file_handler.setFormatter(FILE_FORMATTER)
        logger.addHandler(file_handler)
    if settings.stdlog:
        stdout_handler = logging.StreamHandler(sys.stdout)
        stdout_handler.setFormatter(FILE_FORMATTER)
        stdout_handler.addFilter(_MaximumLevel(logging.WARNING))
        logger.addHandler(stdout_handler)

        stderr_handler = logging.StreamHandler(sys.stderr)
        stderr_handler.setLevel(logging.ERROR)
        stderr_handler.setFormatter(FILE_FORMATTER)
        logger.addHandler(stderr_handler)

    logging.getLogger("TwitchDrops.gql").setLevel(settings.debug_gql)
    logging.getLogger("TwitchDrops.websocket").setLevel(settings.debug_ws)


async def _run(settings: Settings, web_config: WebConfig) -> int:
    try:
        _.set_language(settings.language)
    except ValueError:
        pass

    client = Twitch(
        settings,
        gui_factory=lambda twitch: WebUIManager(twitch, web_config),
    )
    gui: WebUIManager = client.gui
    loop = asyncio.get_running_loop()
    signals_installed: list[signal.Signals] = []

    try:
        await gui.start_web_server()
        if sys.platform != "win32":
            for signum in (signal.SIGINT, signal.SIGTERM):
                loop.add_signal_handler(signum, gui.close)
                signals_installed.append(signum)

        try:
            await client.run()
            return 0
        except CaptchaRequired:
            gui.mark_error(_("error", "captcha"))
            return 2
        except Exception:
            formatted = traceback.format_exc()
            gui.mark_error(formatted)
            return 1
        finally:
            await client.shutdown()
            client.save(force=True)
    finally:
        for signum in signals_installed:
            loop.remove_signal_handler(signum)
        gui.stop()
        await gui.shutdown_web_server()
        gui.close_window()


def main() -> int:
    if sys.version_info < (3, 10):
        print("ERROR: Python 3.10 or higher is required.", file=sys.stderr)
        return 2

    if sys.platform != "win32":
        os.umask(0o077)
    WORKING_DIR.mkdir(parents=True, exist_ok=True)
    if sys.platform != "win32":
        WORKING_DIR.chmod(0o700)

    try:
        web_config = WebConfig.from_env()
        args = _parse_args()
        settings = Settings(args)
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 2

    _configure_logging(settings)
    success, lock = lock_file(LOCK_PATH)
    if not success:
        print("ERROR: Another Twitch Drops Miner instance is already running.", file=sys.stderr)
        return 3
    try:
        return asyncio.run(_run(settings, web_config))
    finally:
        lock.close()


if __name__ == "__main__":
    raise SystemExit(main())
