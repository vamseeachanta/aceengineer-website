#!/bin/bash
# Setup cron job for daily website updates

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAILY_UPDATE="$SCRIPT_DIR/daily-update.sh"
LOG_FILE="$SCRIPT_DIR/../logs/daily-update.log"
CRON_SCHEDULE="0 6 * * *"

# Create logs directory
mkdir -p "$(dirname "$LOG_FILE")"

echo "Setting up cron job for AceEngineer daily updates"
echo "Script: $DAILY_UPDATE"
echo "Schedule: $CRON_SCHEDULE (daily at 6 AM)"
echo "Log file: $LOG_FILE"
echo ""

# Check if cron job already exists
EXISTING=$(crontab -l 2>/dev/null | grep -F "daily-update.sh" || true)

if [ -n "$EXISTING" ]; then
    echo "Cron job already exists:"
    echo "$EXISTING"
    echo ""
    read -p "Replace existing job? [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted"
        exit 0
    fi
    # Remove existing job
    crontab -l 2>/dev/null | grep -v "daily-update.sh" | crontab -
fi

# Add new cron job
CRON_LINE="$CRON_SCHEDULE $DAILY_UPDATE >> $LOG_FILE 2>&1"
(crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -

echo "Cron job installed successfully!"
echo ""
echo "To verify: crontab -l"
echo "To view logs: tail -f $LOG_FILE"
echo "To remove: crontab -e (and delete the line)"
