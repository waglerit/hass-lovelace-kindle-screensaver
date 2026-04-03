#!/bin/sh

# Read timezone from /data/options.json (HA add-on) or env var
if [ -z "$TZ" ]; then
  if [ -f /data/options.json ]; then
    OPTIONS_TZ=$(cat /data/options.json | sed -n 's/.*"TIMEZONE"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p')
    if [ -n "$OPTIONS_TZ" ]; then
      export TZ="$OPTIONS_TZ"
    fi
  fi
fi

# Apply timezone at OS level if set and tzdata is available
if [ -n "$TZ" ] && [ -f "/usr/share/zoneinfo/$TZ" ]; then
  cp "/usr/share/zoneinfo/$TZ" /etc/localtime
  echo "$TZ" > /etc/timezone
  echo "Timezone set to $TZ (OS level)"
else
  echo "WARNING: No valid timezone set (TZ=$TZ). Using UTC."
fi

exec node index.js
