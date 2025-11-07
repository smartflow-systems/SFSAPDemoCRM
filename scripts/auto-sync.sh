#!/bin/bash
# SmartFlow Systems - Universal Auto-Sync Script
# Automatically handles pull, merge, and push operations

set -e

echo "🔄 SmartFlow Auto-Sync Starting..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Error: $1${NC}"
    exit 1
}

# Fetch latest changes
echo -e "${YELLOW}📡 Fetching latest changes from remote...${NC}"
git fetch origin || handle_error "Failed to fetch from remote"

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${GREEN}📍 Current branch: $CURRENT_BRANCH${NC}"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}💾 Found uncommitted changes, committing...${NC}"
    git add .
    git commit -m "chore: auto-commit before sync [Auto-Sync]

🤖 Auto-committed by sync script

Co-Authored-By: Claude <noreply@anthropic.com>" || echo "Nothing to commit"
fi

# Pull with auto-merge
echo -e "${YELLOW}⬇️  Pulling latest changes...${NC}"
if git pull origin "$CURRENT_BRANCH" --no-edit; then
    echo -e "${GREEN}✅ Pull successful${NC}"
else
    echo -e "${YELLOW}⚠️  Merge conflicts detected, attempting auto-resolve...${NC}"

    # Accept incoming changes for specific file types
    git checkout --theirs package.json 2>/dev/null || true
    git checkout --theirs package-lock.json 2>/dev/null || true
    git checkout --theirs yarn.lock 2>/dev/null || true

    # Try to continue merge
    if git merge --continue --no-edit 2>/dev/null; then
        echo -e "${GREEN}✅ Auto-resolved merge conflicts${NC}"
    else
        echo -e "${RED}❌ Manual conflict resolution required${NC}"
        echo -e "${YELLOW}Run: git status to see conflicts${NC}"
        exit 1
    fi
fi

# Push changes
echo -e "${YELLOW}⬆️  Pushing changes to remote...${NC}"
if git push origin "$CURRENT_BRANCH"; then
    echo -e "${GREEN}✅ Push successful${NC}"
else
    echo -e "${RED}❌ Push failed${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Auto-sync complete!${NC}"
echo -e "${GREEN}📊 Latest commits:${NC}"
git log --oneline -3
