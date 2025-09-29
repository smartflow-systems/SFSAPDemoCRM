# AGENTS: SFS Baseline
Where: Shell / Editor / Browser. GitHub is source; Replit mirrors → push back.
Secrets: SFS_PAT, REPLIT_TOKEN, SFS_SYNC_URL (Org→Settings→Secrets→Actions).
Health: GET /health → {"ok":true}. CI must be green.
Rules: show [paths], VERIFY+UNDO, Bash uses set -euo pipefail.
