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
  open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi

if command -v ruby >/dev/null 2>&1; then
  echo "Using: ruby -run -e httpd"
  open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  exec ruby -run -e httpd . -p "$PORT" -b 127.0.0.1
fi

if command -v php >/dev/null 2>&1; then
  echo "Using: php -S"
  open "http://localhost:$PORT/" >/dev/null 2>&1 || true
  exec php -S "127.0.0.1:$PORT"
fi

echo "Error: no built-in static server tool found. Tried python3, ruby, php." >&2
exit 1
