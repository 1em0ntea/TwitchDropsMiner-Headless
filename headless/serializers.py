from __future__ import annotations

from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlsplit


def _iso(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


def _https_url(value: Any) -> str:
    url = str(value or "")
    try:
        return url if urlsplit(url).scheme == "https" else ""
    except ValueError:
        return ""


def serialize_channel(
    channel: Any, *, watching: bool = False, selected: bool = False
) -> dict[str, Any]:
    if channel.online:
        status = "online"
    elif channel.pending_online:
        status = "pending"
    else:
        status = "offline"
    return {
        "id": str(channel.id),
        "name": channel.name,
        "url": _https_url(channel.url),
        "status": status,
        "game": str(channel.game or ""),
        "viewers": channel.viewers,
        "drops_enabled": bool(channel.drops_enabled),
        "acl_based": bool(channel.acl_based),
        "watching": watching,
        "selected": selected,
    }


def serialize_drop(drop: Any) -> dict[str, Any]:
    return {
        "id": str(drop.id),
        "name": drop.name,
        "rewards": [
            {
                "name": benefit.name,
                "type": benefit.type.value,
                "image_url": _https_url(benefit.image_url),
            }
            for benefit in drop.benefits
        ],
        "claimed": bool(drop.is_claimed),
        "claimable": bool(drop.can_claim),
        "earnable": bool(drop.can_earn()),
        "current_minutes": int(drop.current_minutes),
        "required_minutes": int(drop.required_minutes),
        "remaining_minutes": max(0, int(drop.remaining_minutes)),
        "progress": float(drop.progress),
        "starts_at": _iso(drop.starts_at),
        "ends_at": _iso(drop.ends_at),
    }


def serialize_campaign(campaign: Any) -> dict[str, Any]:
    if campaign.active:
        status = "active"
    elif campaign.upcoming:
        status = "upcoming"
    else:
        status = "expired"
    return {
        "id": str(campaign.id),
        "name": campaign.name,
        "game": campaign.game.name,
        "image_url": _https_url(campaign.image_url),
        "linked": bool(campaign.linked),
        "eligible": bool(campaign.eligible),
        "finished": bool(campaign.finished),
        "status": status,
        "starts_at": _iso(campaign.starts_at),
        "ends_at": _iso(campaign.ends_at),
        "link_url": _https_url(campaign.link_url),
        "allowed_channels": [channel.name for channel in campaign.allowed_channels],
        "claimed_drops": int(campaign.claimed_drops),
        "total_drops": int(campaign.total_drops),
        "progress": float(campaign.progress),
        "remaining_minutes": max(0, int(campaign.remaining_minutes)),
        "drops": [serialize_drop(drop) for drop in campaign.drops],
    }


def serialize_active_drop(drop: Any, elapsed_seconds: int) -> dict[str, Any]:
    campaign = drop.campaign
    drop_seconds = max(0, int(drop.remaining_minutes) * 60 - elapsed_seconds)
    campaign_seconds = max(
        0, int(campaign.remaining_minutes) * 60 - elapsed_seconds
    )
    return {
        "id": str(drop.id),
        "name": drop.name,
        "game": campaign.game.name,
        "campaign": campaign.name,
        "campaign_progress": float(campaign.progress),
        "campaign_claimed": int(campaign.claimed_drops),
        "campaign_total": int(campaign.total_drops),
        "campaign_remaining_seconds": campaign_seconds,
        "drop_progress": float(drop.progress),
        "drop_remaining_seconds": drop_seconds,
        "rewards": [benefit.name for benefit in drop.benefits],
        "countdown_anchor": datetime.now(timezone.utc)
        .isoformat()
        .replace("+00:00", "Z"),
    }
