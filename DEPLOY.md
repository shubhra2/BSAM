# BSAM Deployment Guide

This guide details how to configure, build, and deploy the **BSAM (Barber Shop Appointment Manager)** application to a Linux production server using standard Node.js, Systemd, Caddy, and PostgreSQL.

---

## 📋 Prerequisites

### Local Machine
- **Node.js** (v18+ or v20+) & **npm**
- **Wasp CLI** installed (`curl -sSL https://get.wasp.sh | sh`)
- **rsync** & **ssh** configured with access to the target remote server

### Target Production Server
- **Linux Distribution**: Ubuntu 20.04 / 22.04 LTS (or equivalent)
- **Node.js**: v18 / v20 LTS
- **PostgreSQL**: Installed and running locally or accessible remotely
- **Caddy**: Installed for reverse proxying and static asset serving
- **Systemd**: For running the Node.js backend process as a service

---

## 🛠️ Initial Server Setup (One-Time)

### 1. Database Setup
Create a PostgreSQL database and user on the production server:

```sql
CREATE DATABASE bsam;
CREATE USER bsam WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE bsam TO bsam;
```

### 2. File & Directory Structure
Prepare the deployment target directories on the server:

```bash
sudo mkdir -p /var/www/bsam
sudo chown -R $USER:$USER /var/www/bsam

mkdir -p ~/deploy/bsam/server
mkdir -p ~/deploy/bsam/db
mkdir -p ~/deploy/bsam/libs
```

### 3. Server Environment File
Create `~/deploy/bsam/server/.env` on the server:

```env
DATABASE_URL=postgresql://bsam:your_secure_password@localhost:5432/bsam
PORT=3001
WASP_WEB_CLIENT_URL=https://your-domain-or-ip:8443
MSG91_API_KEY=your_msg91_api_key_here
MSG91_SENDER_ID=your_sender_id_here
```

### 4. Systemd Service Configuration
Copy `deploy/systemd/bsam-backend.service` to `/etc/systemd/system/bsam-backend.service` on the server:

```ini
[Unit]
Description=BSAM Wasp Backend Node Service
After=network.target postgresql.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/deploy/bsam/server
EnvironmentFile=/home/ubuntu/deploy/bsam/server/.env
ExecStart=/usr/bin/node --enable-source-maps bundle/server.js
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable bsam-backend
```

### 5. Caddy Web Server Configuration
Append `deploy/Caddyfile` to `/etc/caddy/Caddyfile` on the server:

```caddy
:8443 {
    # Wasp server API routes
    handle /operations/* {
        reverse_proxy localhost:3001
    }

    handle /auth/* {
        reverse_proxy localhost:3001
    }

    # Static assets
    handle /assets/* {
        root * /var/www/bsam
        file_server
        header Cache-Control "public, max-age=31536000, immutable"
    }

    # SPA fallback
    handle {
        root * /var/www/bsam
        try_files {path} /200.html
        file_server
    }

    encode gzip zstd
}
```

Reload Caddy:
```bash
sudo systemctl reload caddy
```

---

## 🚀 Automated Deployment / Redeployment

An automated deployment script is available at `deploy/redeploy.sh`.

### Environment Variables
Set the following environment variables (or specify them inline) before running the script:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `DEPLOY_SERVER` | SSH username and host | `ubuntu@oraclevm` |
| `SERVER_URL` | Public URL of the deployed app | `https://oraclevm.tail976b9d.ts.net:8443` |
| `DB_PASSWORD` | Password for PostgreSQL `bsam` user | `your_secure_password` |
| `DATABASE_URL` | Full PostgreSQL connection string (optional) | `postgresql://bsam:password@localhost:5432/bsam` |
| `OVERWRITE_ENV` | Set to `true` to update remote `.env` with new DB URL | `true` |

### Executing the Deployment Script

Run from the root of the project:

```bash
DEPLOY_SERVER="ubuntu@oraclevm" SERVER_URL="https://oraclevm.tail976b9d.ts.net:8443" DB_PASSWORD="your_password" ./deploy/redeploy.sh
```

### What `redeploy.sh` Does:
1. **Wasp Build**: Compiles Wasp app artifact.
2. **Server Bundle**: Installs backend dependencies and bundles `server.js`.
3. **Client Build**: Builds client SPA using Vite configured with `REACT_APP_API_URL`.
4. **Rsync Transfer**: Syncs compiled server, db schemas, and static frontend assets to the remote server.
5. **Database Migration**: Runs Prisma migrations on the remote server (`prisma migrate deploy`).
6. **Service Restart**: Restarts the `bsam-backend` Systemd service.

---

## 📄 Local Environment Configuration

For local development setup:
- Copy `.env.server.example` to `.env.server`
- Copy `.env.client.example` to `.env.client`
