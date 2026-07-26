# syntax=docker/dockerfile:1.7

ARG PYTHON_VERSION=3.12

FROM python:${PYTHON_VERSION}-slim-bookworm AS builder

ENV PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PIP_NO_CACHE_DIR=1

RUN python -m venv /opt/venv

COPY requirements-headless.txt /tmp/requirements-headless.txt
RUN /opt/venv/bin/pip install --no-compile -r /tmp/requirements-headless.txt


FROM python:${PYTHON_VERSION}-slim-bookworm AS runtime

ARG APP_UID=10001
ARG APP_GID=10001

ENV PATH="/opt/venv/bin:${PATH}" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    TDM_DATA_DIR=/data \
    TDM_WEB_HOST=0.0.0.0 \
    TDM_WEB_PORT=5800

RUN groupadd --gid "${APP_GID}" tdm \
    && useradd \
        --uid "${APP_UID}" \
        --gid "${APP_GID}" \
        --create-home \
        --home-dir /home/tdm \
        --shell /usr/sbin/nologin \
        tdm \
    && install -d -m 0755 -o root -g root /app \
    && install -d -m 0700 -o tdm -g tdm /data

COPY --from=builder /opt/venv /opt/venv

WORKDIR /app
COPY --chown=root:root . /app

USER 10001:10001

EXPOSE 5800
VOLUME ["/data"]
STOPSIGNAL SIGTERM

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
    CMD ["python", "-c", "import urllib.request; r=urllib.request.urlopen('http://127.0.0.1:5800/healthz', timeout=2); raise SystemExit(0 if r.status == 200 else 1)"]

ENTRYPOINT ["python", "main_headless.py"]
CMD ["--stdlog"]
