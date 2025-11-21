#!/usr/bin/env bash
export PATH="$HOME/bin:$PATH"
set -euo pipefail
branch="${1:-main}"
echo "🔄 Pulling $branch..."
git fetch origin "$branch"
git reset --hard "origin/$branch"
if [ -f package.json ]; then npm ci --omit=dev || npm install; fi
echo "✅ Sync complete"
