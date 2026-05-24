# Nebula Panel Theme

> A custom Pterodactyl panel theme inspired by Nebula & Reviactyl — built by [@RianModss](https://t.me/RianModss)

![Nebula Panel](https://img.shields.io/badge/Nebula-Panel-blue?style=for-the-badge)
![Pterodactyl](https://img.shields.io/badge/Pterodactyl-Compatible-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## Features

| Feature | Description |
|---|---|
| Dark Space Theme | Deep navy/space dark mode, electric blue & purple accents |
| Role System | `user` / `admin` / `dev` — each role sees different UI |
| Dev Dashboard | Exclusive to `dev` role — full system control |
| 14 Protect Scripts | Toggle individual anti-cheat/DDoS protection features |
| Ban System | Ban users with reason, view ban status, unban |
| Maintenance Mode | Take panel offline for all non-dev users |
| Server Power Control | Start / Stop / Restart / Kill servers from the panel |
| Node Management | View all Pterodactyl nodes, memory, disk, server count |
| Audit Log | Full history of all panel actions |
| Notifications | In-app bell with read/unread, mark all read |
| Profile Settings | Change email and password from the panel |
| Create User / Server | Admin forms to provision new users and servers |
| SVG Icons Only | No emojis — clean SVG icons throughout |
| Copyright | All pages carry `© RianModss` / `@RianModss` |

---

## Stack

- **Frontend**: React 19 + Vite, TailwindCSS v4, Wouter, TanStack Query
- **Backend**: Express 5, Drizzle ORM, PostgreSQL
- **Auth**: JWT (bcryptjs + jsonwebtoken)
- **Fonts**: Space Grotesk (headings) + Inter (body)

---

## Installation Guide

### Prerequisites

Before starting, make sure you have:

- A working Pterodactyl Panel installation (v1.x or v2.x)
- Node.js 20+ and pnpm installed on your server
- PostgreSQL database available
- Basic Linux terminal knowledge

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Im-Lawiett/nebula-panel-theme.git
cd nebula-panel-theme
```

---

### Step 2 — Install Dependencies

```bash
pnpm install
```

> If you don't have pnpm: `npm install -g pnpm`

---

### Step 3 — Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
nano .env
```

Fill in your values:

```env
# PostgreSQL connection string
DATABASE_URL=postgresql://username:password@localhost:5432/nebula_panel

# JWT secret — use a strong random string
SESSION_SECRET=your-super-secret-key-here
```

> Generate a strong secret: `openssl rand -hex 32`

---

### Step 4 — Set Up the Database

Push the schema to your PostgreSQL database:

```bash
pnpm --filter @workspace/db run push
```

This will create all required tables:
- `users` — panel accounts
- `servers` — server records
- `protect_features` — the 14 protect script toggles
- `maintenance` — maintenance mode config
- `activity_logs` — audit trail

---

### Step 5 — Seed the Database (Optional)

To create default accounts for testing:

```bash
pnpm --filter @workspace/db run seed
```

Default credentials after seeding:

| Username | Password | Role |
|---|---|---|
| `dev` | `dev123` | Developer (full access) |
| `admin` | `admin123` | Administrator |
| `playerone` | `user123` | Regular user |

> **Change these passwords immediately after first login!**

---

### Step 6 — Build the Project

```bash
pnpm run build
```

This compiles the API server and the React frontend.

---

### Step 7 — Start the API Server

```bash
pnpm --filter @workspace/api-server run start
```

The API server will start on **port 8080** (or the `PORT` env variable).

---

### Step 8 — Serve the Frontend

#### Option A — Development (with hot reload)

```bash
pnpm --filter @workspace/nebula-panel run dev
```

The panel will be available at `http://localhost:18246`

#### Option B — Production (with nginx)

Build the frontend:

```bash
pnpm --filter @workspace/nebula-panel run build
```

Then serve the `artifacts/nebula-panel/dist` folder with nginx.

Sample nginx config:

```nginx
server {
    listen 80;
    server_name panel.yourdomain.com;

    root /var/www/nebula-panel/artifacts/nebula-panel/dist;
    index index.html;

    # Frontend — serve SPA
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable HTTPS with Certbot:

```bash
sudo certbot --nginx -d panel.yourdomain.com
```

---

### Step 9 — Set Up as a System Service (Optional)

Create a systemd service for the API server:

```bash
sudo nano /etc/systemd/system/nebula-panel.service
```

```ini
[Unit]
Description=Nebula Panel API Server
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nebula-panel
ExecStart=/usr/bin/node artifacts/api-server/dist/index.mjs
Restart=always
RestartSec=5
Environment=NODE_ENV=production
EnvironmentFile=/var/www/nebula-panel/.env

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable nebula-panel
sudo systemctl start nebula-panel
sudo systemctl status nebula-panel
```

---

### Step 10 — Configure Pterodactyl Integration

To use this theme **alongside** your actual Pterodactyl installation, reverse proxy the panel:

```nginx
# Your existing Pterodactyl panel at /pterodactyl
location /pterodactyl/ {
    proxy_pass http://127.0.0.1:80/;
    proxy_set_header Host $host;
}

# Nebula Panel theme at root
location / {
    proxy_pass http://127.0.0.1:18246;
    proxy_set_header Host $host;
}
```

---

## Role System

| Role | What they can access |
|---|---|
| `user` | Dashboard, their own servers, profile |
| `admin` | Everything above + user management, node view, audit log, create users/servers |
| `dev` | Everything above + Dev Dashboard, Protect Features, Maintenance Mode |

To promote a user to admin/dev, log in as `dev` and change their role from the Users page.

---

## Protect Features

The panel includes **14 protect scripts** that can be toggled from the Dev Dashboard:

1. Anti-DDoS Layer
2. Port Scan Blocker
3. SSH Brute Force Guard
4. Firewall Rules Sync
5. IP Rate Limiter
6. Null Route Automation
7. SSL Certificate Monitor
8. DNS Leak Prevention
9. Reverse Proxy Shield
10. Geo-Block (Non-Whitelisted)
11. Auto-Ban Bot IPs
12. Payload Inspector
13. Resource Abuse Detector
14. Webhook Intrusion Alerts

Each can be toggled on/off individually from `/dev/protect`.

---

## Maintenance Mode

When enabled from `/dev/maintenance`:
- All `user` and `admin` roles see the maintenance page
- `dev` role users can still access the panel normally
- A custom message can be set for users to see

---

## File Structure

```
nebula-panel-theme/
├── artifacts/
│   ├── api-server/          # Express 5 backend
│   │   └── src/
│   │       ├── routes/      # auth, users, servers, protect, maintenance, stats, notifications, nodes
│   │       └── middlewares/ # JWT auth, role guard
│   └── nebula-panel/        # React + Vite frontend
│       └── src/
│           ├── components/  # Layout, Sidebar, Header, SVG icons
│           └── pages/       # All panel pages
├── lib/
│   ├── api-spec/            # OpenAPI spec (source of truth)
│   ├── api-client-react/    # Generated React Query hooks
│   ├── api-zod/             # Generated Zod schemas
│   └── db/                  # Drizzle ORM schema + migrations
└── README.md
```

---

## Troubleshooting

**Panel shows blank page**
- Make sure the API server is running on port 8080
- Check `DATABASE_URL` is correct in `.env`
- Run `pnpm --filter @workspace/db run push` to ensure tables exist

**Cannot login**
- Ensure the database is seeded: `pnpm --filter @workspace/db run seed`
- Check that `SESSION_SECRET` is set in `.env`

**Cannot access Dev features**
- Login with the `dev` account (username: `dev`, password: `dev123`)
- Or change your role in the database: `UPDATE users SET role = 'dev' WHERE username = 'yourusername';`

**Port conflict**
- Change the port in the workflow or set `PORT=<yourport>` in the environment

---

## Credits & Contact

Developed by **[@RianModss](https://t.me/RianModss)**

- Telegram: [@RianModss](https://t.me/RianModss)
- GitHub: [Im-Lawiett/nebula-panel-theme](https://github.com/Im-Lawiett/nebula-panel-theme)

Inspired by Reviactyl and Nebula themes.

---

&copy; 2025–2026 RianModss. All rights reserved.
