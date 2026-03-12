#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8999}"
ROOT="${2:-$PWD}"

cd "$ROOT"

echo "Serving folder: $ROOT"
echo "URL: http://localhost:$PORT/"
echo "Press Ctrl+C to stop."

if command -v python3 >/dev/null 2>&1; then
  echo "Using: python3 -m http.server"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  fi
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi

if command -v python >/dev/null 2>&1; then
  echo "Using: python -m SimpleHTTPServer"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  fi
  exec python -m SimpleHTTPServer "$PORT"
fi

if command -v busybox >/dev/null 2>&1; then
  echo "Using: busybox httpd"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  fi
  exec busybox httpd -f -p "127.0.0.1:$PORT" -h "$ROOT"
fi

if command -v php >/dev/null 2>&1; then
  echo "Using: php -S"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  fi
  exec php -S "127.0.0.1:$PORT"
fi

echo "Error: no built-in static server tool found. Tried python3, python, busybox, php." >&2
exit 1
