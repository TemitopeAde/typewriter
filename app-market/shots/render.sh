#!/bin/sh
# Screenshots every listing image from the running harness (npx vite --config app-market/shots/vite.config.ts).
cd "$(dirname "$0")" && mkdir -p out
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
n=1
for shot in main site-word site-sentences settings-content settings-style; do
  "$CH" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,900 --virtual-time-budget=${BUDGET:-9000} \
    --screenshot="out/$n-$shot.png" "http://localhost:5199/?shot=$shot" >/dev/null 2>&1
  echo "out/$n-$shot.png"
  n=$((n + 1))
done
