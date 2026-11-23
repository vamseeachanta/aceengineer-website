#!/bin/bash
# Daily update script for AceEngineer website
# Runs competitor analysis and content sync

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== AceEngineer Daily Update ==="
echo "Started at: $(date)"
echo "Project: $PROJECT_DIR"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# 1. Pull latest changes
echo ">>> Pulling latest changes..."
git pull --rebase origin main || true

# 2. Run competitor analysis
echo ""
echo ">>> Running competitor analysis..."
python3 scripts/competitor_analysis.py

# 3. Run content sync (if repos exist)
echo ""
echo ">>> Running content sync..."
DIGITALMODEL_PATH="../digitalmodel"
WORLDENERGYDATA_PATH="../worldenergydata"

SYNC_ARGS=""
if [ -d "$DIGITALMODEL_PATH" ]; then
    SYNC_ARGS="$SYNC_ARGS --digitalmodel $DIGITALMODEL_PATH"
fi
if [ -d "$WORLDENERGYDATA_PATH" ]; then
    SYNC_ARGS="$SYNC_ARGS --worldenergydata $WORLDENERGYDATA_PATH"
fi

if [ -n "$SYNC_ARGS" ]; then
    python3 scripts/content_sync.py $SYNC_ARGS
else
    echo "No source repos found, skipping content sync"
fi

# 4. Build site (if build script exists)
echo ""
echo ">>> Building site..."
if [ -f "package.json" ]; then
    npm run build || echo "No build script or build failed"
fi

# 5. Commit changes if any
echo ""
echo ">>> Checking for changes..."
if [ -n "$(git status --porcelain)" ]; then
    echo "Changes detected, committing..."
    git add -A
    git commit -m "chore: daily update $(date +%Y-%m-%d)"
    echo "Changes committed. Run 'git push' to publish."
else
    echo "No changes to commit"
fi

echo ""
echo "=== Daily update complete ==="
echo "Finished at: $(date)"
