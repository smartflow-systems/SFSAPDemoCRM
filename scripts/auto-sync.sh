#!/usr/bin/env bash
set -e
echo "🔄 Auto-sync starting..."
git add -A
git commit -m "chore: auto-commit [Auto-Sync]" || true
git fetch origin || true
git pull --no-edit || true
git push || true
echo "✅ Auto-sync complete!"
