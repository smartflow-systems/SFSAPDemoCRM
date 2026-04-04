#!/usr/bin/env bash
set -euo pipefail
curl -sS -X POST "$SFS_SYNC_URL" \
 -H "Authorization: Bearer $REPLIT_TOKEN" -H "Content-Type: application/json" \
 -d "{\"repo\":\"$GITHUB_REPOSITORY\",\"sha\":\"$GITHUB_SHA\"}"
echo "[SFS] Deploy pinged."
