# Linux VPS deployment

This independent repository runs as a native Web application. It does not use X11, VNC, or
noVNC. The Web listener is deliberately published only on the VPS loopback
interface; use an SSH tunnel or an HTTPS reverse proxy to reach it.

The upstream project explicitly does not support unattended VPS or Docker
deployments. Report deployment issues to this repository, not to the upstream
project.

## Docker Compose

Requirements:

- Docker Engine with the Compose plugin
- A Linux VPS with outbound HTTPS access
- A unique Web administrator password

Prepare the deployment from the repository root:

```sh
cp deploy/.env.example .env
umask 077
openssl rand -base64 32 > deploy/secrets/web_password
docker compose build
docker compose up -d --wait
```

The container runs as UID/GID `10001`, uses a read-only root filesystem, and
writes persistent state only to the `tdm-data` volume mounted at `/data`.
Docker sends SIGTERM and waits 30 seconds before forcefully stopping it.

Check service state and logs:

```sh
docker compose ps
docker compose logs --tail=100 miner
curl --fail http://127.0.0.1:5800/healthz
curl --fail http://127.0.0.1:5800/readyz
```

`/healthz` means the local Web process is alive. `/readyz` means the miner
Web loop is accepting requests and its persistent data directory is writable.
A pending Twitch login or temporary Twitch outage is shown by the authenticated
status API and does not make liveness fail or cause an automatic restart loop.

### Access through an SSH tunnel

Leave `TDM_WEB_COOKIE_SECURE=false` and `TDM_WEB_TRUST_PROXY=false` in `.env`,
then open a tunnel from your computer:

```sh
ssh -L 5800:127.0.0.1:5800 your-user@your-vps
```

Open `http://127.0.0.1:5800` locally. The miner port is not reachable directly
from the Internet.

### HTTPS with Caddy

Point a DNS record at the VPS, install Caddy on the host, and copy
`deploy/Caddyfile.example` to `/etc/caddy/Caddyfile`. Replace
`tdm.example.com` with the real hostname.

Set these values in `.env` before restarting the container:

```dotenv
TDM_WEB_COOKIE_SECURE=true
TDM_WEB_TRUST_PROXY=true
```

Validate and reload Caddy:

```sh
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
docker compose up -d --wait
```

Only enable proxy trust when the application port remains loopback-only and
the proxy runs on the same trusted VPS.

### Updates and backups

Pin `TDM_IMAGE` to a release tag or image digest for production. To update a
local source build:

```sh
docker compose build --pull
docker compose up -d --wait
```

The `tdm-data` volume contains `cookies.jar`, which can grant access to the
connected Twitch account. Back it up only to encrypted, access-controlled
storage. Stop the service before copying the volume:

```sh
docker compose stop --timeout 30
```

After the backup, start it again with `docker compose up -d --wait`.

To test graceful shutdown:

```sh
docker compose stop --timeout 30
docker compose logs --tail=100 miner
```

The logs should show shutdown completion before the container exits.

### Start Compose at boot with systemd

Install the repository at `/opt/twitchdropsminer`, then install the supplied
unit:

```sh
sudo cp deploy/twitchdropsminer-compose.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now twitchdropsminer-compose.service
```

The container's `restart: unless-stopped` policy handles process failures.
The systemd unit only manages the Compose project at host boot and shutdown.

## Native systemd installation

Docker is optional. The native unit runs the same headless entry point in a
Python virtual environment and uses systemd hardening.

Install Python 3.10 or newer, copy the repository to
`/opt/twitchdropsminer`, and prepare the service account:

```sh
sudo useradd --system --home /var/lib/twitchdropsminer \
  --shell /usr/sbin/nologin tdm
sudo install -d -m 0755 -o root -g root /opt/twitchdropsminer
sudo install -d -m 0750 -o root -g tdm /etc/twitchdropsminer
sudo install -d -m 0700 -o tdm -g tdm /var/lib/twitchdropsminer
```

Create the virtual environment and install only headless dependencies:

```sh
sudo python3 -m venv /opt/twitchdropsminer/.venv
sudo /opt/twitchdropsminer/.venv/bin/pip install \
  -r /opt/twitchdropsminer/requirements-headless.txt
sudo chown -R root:root /opt/twitchdropsminer
```

Create the administrator password with permissions that allow only root and
the service group to read it:

```sh
sudo sh -c 'umask 027; openssl rand -base64 32 > /etc/twitchdropsminer/web_password'
sudo chown root:tdm /etc/twitchdropsminer/web_password
sudo chmod 0640 /etc/twitchdropsminer/web_password
```

Optionally copy `deploy/twitchdropsminer.env.example` to
`/etc/twitchdropsminer/environment` and adjust its values. Install and start
the unit:

```sh
sudo cp deploy/twitchdropsminer.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now twitchdropsminer.service
sudo systemctl status twitchdropsminer.service
```

Follow logs with:

```sh
journalctl -u twitchdropsminer.service -f
```

The native service binds to `127.0.0.1:5800` and is intended to use the same
Caddy example. If HTTPS is not used, set both cookie security and proxy trust
to `false` in `/etc/twitchdropsminer/environment`.

## Security checklist

- Never publish port 5800 on `0.0.0.0`.
- Never commit `.env`, `deploy/secrets/web_password`, `cookies.jar`, or data
  volume backups.
- Keep Web authentication enabled and use a password unique to this service.
- Use HTTPS or an SSH tunnel; do not send credentials over public plain HTTP.
- Keep `TDM_WEB_TRUST_PROXY=false` unless a trusted local reverse proxy is in
  use.
- Do not run multiple miners against the same data directory or Twitch
  account.
- Keep production logging at normal verbosity; debug request logs can contain
  sensitive request or proxy details.
