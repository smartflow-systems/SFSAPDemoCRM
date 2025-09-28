<!-- BADGES:START -->
[![SFS CI + Deploy](https://github.com/smartflow-systems/SFSAPDemoCRM/actions/workflows/ci.yml/badge.svg)](https://github.com/smartflow-systems/SFSAPDemoCRM/actions/workflows/ci.yml)
<!-- BADGES:END -->

# SFSAPDemoCRM — SmartFlow Systems
**Dev:** `npm run dev`  •  **Prod:** `npm start`  
**Health:** `GET /health` → `{"ok":true}`

## Scripts
- `dev` → nodemon/serve
- `start` → node server.js (if present)
- `health` → bash [scripts/health.sh]

## Replit
Create from GitHub → set secrets `SFS_PAT`, `REPLIT_TOKEN`, `SFS_SYNC_URL`. Port ${PORT:-5000} (or app default).

## CI
Push → GitHub Actions runs reusable CI.

## Agent Notes (see [AGENTS.md])
Show [paths]; VERIFY + UNDO; Bash uses `set -euo pipefail`. GitHub = source of truth.
