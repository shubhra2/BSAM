#!/usr/bin/env bash
# redeploy.sh — rebuild and push BSAM to Oracle server
# Run from the BSAM project root.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

DEPLOY_SERVER="${DEPLOY_SERVER:-user@your-server-host}"
SERVER_URL="${SERVER_URL:-https://your-server-host:8443}"

DB_PASSWORD="${DB_PASSWORD:-your_secure_password}"
DATABASE_URL="${DATABASE_URL:-postgresql://bsam:${DB_PASSWORD}@localhost:5432/bsam}"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$(ls -d $HOME/.nvm/versions/node/*/bin 2>/dev/null | tail -n 1):$HOME/.local/bin:$HOME/.wasp/bin:$PATH"

echo "==> Building Wasp project..."
cd "$PROJECT_ROOT"
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" wasp build

echo "==> Bundling server..."
cd .wasp/out/server
npm install
npm run bundle
cd ../../..

echo "==> Building client (REACT_APP_API_URL=$SERVER_URL)..."
cd "$PROJECT_ROOT"
REACT_APP_API_URL="$SERVER_URL" npx vite build

echo "==> Syncing server to $DEPLOY_SERVER..."
cd "$PROJECT_ROOT"
rsync -az --delete \
  --exclude node_modules \
  .wasp/out/server/ "$DEPLOY_SERVER:/home/ubuntu/deploy/bsam/server/"
rsync -az .wasp/out/db/ "$DEPLOY_SERVER:/home/ubuntu/deploy/bsam/db/"
rsync -az .wasp/out/libs/ "$DEPLOY_SERVER:/home/ubuntu/deploy/bsam/libs/"

echo "==> Syncing client to $DEPLOY_SERVER:/var/www/bsam/..."
rsync -az --delete .wasp/out/web-app/build/ "$DEPLOY_SERVER:/var/www/bsam/"

echo "==> Installing server deps, syncing env, and running migrations on server..."
ssh "$DEPLOY_SERVER" bash << REMOTE
set -e
cd /home/ubuntu/deploy/bsam/server

# Ensure .env file exists for systemd and Prisma (or update if OVERWRITE_ENV=true)
if [ ! -f .env ] || [ "\$OVERWRITE_ENV" = "true" ]; then
  cat > .env << ENV_FILE
DATABASE_URL=$DATABASE_URL
ENV_FILE
  echo "Wrote .env file"
fi

npm install --omit=dev
npm install --omit=dev zod lucia @lucia-auth/adapter-prisma @prisma/client@5.19.1 prisma@5.19.1
node_modules/.bin/prisma generate --schema=../db/schema.prisma
node_modules/.bin/prisma migrate deploy --schema=../db/schema.prisma
REMOTE

echo "==> Restarting bsam-backend service..."
ssh "$DEPLOY_SERVER" "sudo systemctl restart bsam-backend && sleep 2 && systemctl status bsam-backend --no-pager | tail -5"

echo "==> Done! App available at $SERVER_URL"
