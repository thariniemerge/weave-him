#!/bin/bash
# Rebuilds the static server-card layers from the live frontend card (/card/_layers)
set -e
OUT=/app/backend/card_assets
CH=$(which google-chrome || which chromium)
shot() { timeout 60 $CH --headless=new --no-sandbox --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=1080,1920 --timeout=7000 $3 --screenshot="$2" "$1" 2>/dev/null; }
shot "https://weave-him-bloom.internal.preview.emergentagent.com/card/_layers?layer=base" $OUT/base.png ""
shot "https://weave-him-bloom.internal.preview.emergentagent.com/card/_layers?layer=over" $OUT/overlay.png "--default-background-color=00000000"
if [ -n "$1" ]; then shot "https://weave-him-bloom.internal.preview.emergentagent.com/card/$1" /app/scripts/card_chrome.png ""; fi
ls -la $OUT
