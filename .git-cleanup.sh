#!/bin/bash
# Git History Cleanup - Remove exposed tokens

echo "🚨 WARNUNG: Dies ändert die Git-History!"
echo "Backup wird erstellt..."

# Backup
git branch backup-before-cleanup

# Remove sensitive data from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# Remove demo token from code
git filter-branch --force --tree-filter \
  "find . -type f -name '*.tsx' -o -name '*.ts' | xargs sed -i '' 's/pk\.eyJ1IjoiYmlzcy1hcHAiLCJhIjoiY200MjN4cXRsMDB4MTJrcXRxOGV4NXRhYiJ9\.demo/MAPBOX_TOKEN_REMOVED/g'" \
  --prune-empty --tag-name-filter cat -- --all

echo "✅ History bereinigt"
echo "⚠️  WICHTIG: git push --force erforderlich!"
