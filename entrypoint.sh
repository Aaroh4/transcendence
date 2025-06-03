#!/bin/sh

echo "Starting entrypoint.sh"

echo "TURN_URL: $TURN_URL"
echo "TURN_USER: $TURN_USER"
echo "TURN_PASS: $TURN_PASS"
echo "STUN_URL: $STUN_URL"
echo "EXTERNAL_IP: $HOST_LAN_IP"
echo "AUTHSERV: $AUTHSERV"


# Fetch external IP
# EXTERNAL_IP=$(curl -s https://api.ipify.org)
# Fetch local external IP
# EXTERNAL_IP=$(ip addr show enp4s0f0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1)
# EXTERNAL_IP=$(hostname -I | awk '{print $1}')

# Replace placeholders in frontend env-config.ts
echo "Injecting env values..."
sed -i "s|__STUN_URL__|${STUN_URL}|g" /app/frontend/src/config/env-config.ts
sed -i "s|__TURN_URL__|${TURN_URL}|g" /app/frontend/src/config/env-config.ts
sed -i "s|__TURN_USER__|${TURN_USER}|g" /app/frontend/src/config/env-config.ts
sed -i "s|__TURN_PASS__|${TURN_PASS}|g" /app/frontend/src/config/env-config.ts
sed -i "s|__EXT_IP__|${HOST_LAN_IP}|g" /app/frontend/src/config/env-config.ts
sed -i "s|__AUTHSERV__|${AUTHSERV}|g" /app/frontend/src/config/env-config.ts

# Build frontend (AFTER placeholders are injected)
cd frontend && npm run build

# Return to app root and start backend
cd /app
exec "$@"