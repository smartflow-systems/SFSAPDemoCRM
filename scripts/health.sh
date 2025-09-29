#!/usr/bin/env bash
set -euo pipefail
BASE="${BASE:-http://127.0.0.1:${PORT:-5000}}"
curl -sS -m 8 -o /dev/null -w "HEALTH:%{http_code}\n" "$BASE/health"
