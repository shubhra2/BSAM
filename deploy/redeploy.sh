#!/usr/bin/env bash
# redeploy.sh — rebuild and push BSAM to Oracle server
# Run from the BSAM project root.

set -e

DEPLOY_SERVER="ubuntu@oraclevm"
SERVER_URL="http://oraclevm:8080"

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export PATH="$(ls -d $HOME/.nvm/versions/node/*/bin 2>/dev/null | tail -n 1):$HOME/.local/bin:$HOME/.wasp/bin:$PATH"

echo "==> Building Wasp project..."
DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" wasp build

echo "==> Bundling server..."
cd .wasp/out/server
npm install
npm run bundle
cd ../../..

echo "==> Building client (REACT_APP_API_URL=$SERVER_URL)..."
REACT_APP_API_URL="$SERVER_URL" npx vite build

echo "==> Syncing server to $DEPLOY_SERVER..."
rsync -az --delete \
  --exclude node_modules \
  .wasp/out/server/ "$DEPLOY_SERVER:/home/ubuntu/deploy/bsam/server/"
rsync -az .wasp/out/db/ "$DEPLOY_SERVER:/home/ubuntu/deploy/bsam/db/"
rsync -az .wasp/out/libs/ "$DEPLOY_SERVER:/home/ubuntu/deploy/bsam/libs/"

echo "==> Syncing client to $DEPLOY_SERVER:/var/www/bsam/..."
rsync -az --delete .wasp/out/web-app/build/ "$DEPLOY_SERVER:/var/www/bsam/"

echo "==> Installing server deps and running migrations on server..."
ssh "$DEPLOY_SERVER" bash << 'REMOTE'
set -e
cd /home/ubuntu/deploy/bsam/server
npm install --omit=dev
npm install --omit=dev zod lucia @lucia-auth/adapter-prisma @prisma/client@5.19.1 prisma@5.19.1
node_modules/.bin/prisma generate --schema=../db/schema.prisma
node_modules/.bin/prisma migrate deploy --schema=../db/schema.prisma
REMOTE

echo "==> Restarting bsam-backend service..."
ssh "$DEPLOY_SERVER" "sudo systemctl restart bsam-backend && sleep 2 && systemctl status bsam-backend --no-pager | tail -5"

echo "==> Done! App available at $SERVER_URL"
