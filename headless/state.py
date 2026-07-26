from __future__ import annotations

import asyncio
from contextlib import asynccontextmanager
from typing import AsyncIterator


class StatePublisher:
    def __init__(self) -> None:
        self.revision = 0
        self._subscribers: set[asyncio.Queue[int]] = set()

    def changed(self) -> int:
        self.revision += 1
        for queue in tuple(self._subscribers):
            if queue.full():
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    pass
            try:
                queue.put_nowait(self.revision)
            except asyncio.QueueFull:
                pass
        return self.revision

    @asynccontextmanager
    async def subscribe(self) -> AsyncIterator[asyncio.Queue[int]]:
        queue: asyncio.Queue[int] = asyncio.Queue(maxsize=1)
        self._subscribers.add(queue)
        try:
            yield queue
        finally:
            self._subscribers.discard(queue)
