# 🌌 Nebula Panel Theme

A custom **Pterodactyl-inspired** game server control panel built with React 19 + Express 5. No database required — runs entirely on a JSON file store.

> Developed by [@RianModss](https://t.me/RianModss)

---

## ✨ Features

| Feature | Status |
|---|---|
| Login / Logout with JWT | ✅ |
| Role-based access (user / admin / dev) | ✅ |
| Server management (create, power, console) | ✅ |
| Full create-server form (egg, node, allocation, description, owner) | ✅ |
| Server visibility (users see own; admin + dev see all) | ✅ |
| Live resource charts (PTLC-style CPU / Memory / Network) | ✅ |
| Panel name & settings customisation | ✅ |
| User management (create, ban, role) | ✅ |
| Nodes, Eggs, Mounts, Locations pages | ✅ |
| Audit log | ✅ |
| Backups, Databases, Schedules tabs | ✅ |
| Dev zone (maintenance, feature protect) | ✅ |
| Zero database setup — pure JSON file | ✅ |

---

## 🚀 Quick Install (Self-hosted)

### Requirements

- **Node.js** 18 or newer ([download](https://nodejs.org))
- **pnpm** 9 or newer (`npm i -g pnpm`)
- **Git**

---

### Step 1 — Clone the repo

```bash
git clone https://github.com/Im-Lawiett/nebula-panel-theme.git
cd nebula-panel-theme
```

---

### Step 2 — Install dependencies

```bash
pnpm install
```

---

### Step 3 — Set environment variables

Copy the example file and edit it:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
# Required for the API server
SESSION_SECRET=replace_with_any_long_random_string
PORT=5000

# Optional — only if you add PostgreSQL later
# DATABASE_URL=postgresql://user:pass@localhost:5432/nebula
```

> **Tip:** Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

---

### Step 4 — Build the project

```bash
pnpm run build
```

---

### Step 5 — Start in development mode

Run **both** servers (open two terminals or use a process manager):

**Terminal 1 — API server:**
```bash
pnpm --filter @workspace/api-server run dev
```

**Terminal 2 — Frontend (Nebula Panel):**
```bash
pnpm --filter @workspace/nebula-panel run dev
```

Then open **http://localhost:5173** in your browser.

---

### Step 6 — Login with default accounts

| Username | Password | Role |
|---|---|---|
| `dev` | `dev123` | Dev (superadmin — ID 1, sees everything) |
| `admin` | `admin123` | Admin (sees all servers) |
| `playerone` | `user123` | User (sees own servers only) |

> ⚠️ **Change all passwords immediately after first login.**

---

## 🏭 Production Deployment

### Option A — PM2 (recommended)

```bash
# Install PM2
npm i -g pm2

# Build first
pnpm run build

# Start API server
pm2 start "pnpm --filter @workspace/api-server run dev" --name nebula-api

# Start frontend
pm2 start "pnpm --filter @workspace/nebula-panel run dev" --name nebula-panel

# Save and enable autostart
pm2 save
pm2 startup
```

### Option B — Replit (easiest)

1. Fork this repo or import it into [Replit](https://replit.com)
2. Replit auto-detects the workspace and starts both services
3. Add `SESSION_SECRET` in **Secrets** tab
4. Click **Run** — done!

---

## 📁 Project Structure

```
nebula-panel-theme/
├── artifacts/
│   ├── api-server/          # Express 5 backend (port 5000)
│   │   ├── src/
│   │   │   ├── routes/      # All API routes
│   │   │   ├── lib/store.ts # JSON file database
│   │   │   └── middlewares/ # Auth middleware
│   │   └── data/db.json     # Auto-created on first run (data lives here)
│   └── nebula-panel/        # React 19 + Vite frontend
│       └── src/
│           ├── pages/       # All pages (dashboard, servers, users, ...)
│           ├── components/  # Layout, UI components
│           └── lib/         # Auth context, utilities
├── lib/
│   └── api-client-react/    # Auto-generated React Query hooks
└── pnpm-workspace.yaml
```

---

## ⚙️ Panel Settings

Log in as **dev** and go to **Dev Zone → Panel Settings** to:

- Change the panel name (shown in sidebar and browser tab)
- Set a custom description shown on login
- Choose accent colour (Blue, Purple, Green, Red, Amber, Pink)
- Enable/disable public registration
- Set maintenance mode message

---

## 🔐 Role System

| Role | What they can see |
|---|---|
| **user** | Only their own servers |
| **admin** | All servers + user management |
| **dev** (ID 1) | Everything — including panel settings, dev zone |

---

## 🛠 API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | — | Login |
| GET | `/api/me` | ✅ | Current user |
| GET | `/api/servers` | ✅ | List servers (filtered by role) |
| POST | `/api/servers` | admin+ | Create server |
| GET | `/api/servers/:id` | ✅ | Get server |
| POST | `/api/servers/:id/power` | ✅ | Start/stop/restart/kill |
| GET | `/api/servers/:id/resources` | ✅ | Live resource stats |
| GET | `/api/nodes` | ✅ | List nodes |
| GET | `/api/users` | admin+ | List users |
| GET | `/api/settings` | — | Panel settings |
| PUT | `/api/settings` | dev | Update panel settings |

---

## 🐛 Troubleshooting

**"Cannot connect to API"**
→ Make sure the API server is running on port 5000 (`pnpm --filter @workspace/api-server run dev`)

**"Blank page on frontend"**
→ Run `pnpm install` again, then restart the frontend

**"db.json not found"**
→ Normal on first run — it auto-creates when the API starts

**"Access denied" on server**
→ Users can only see their own servers. Log in as admin/dev to see all

---

## 📄 License

MIT © RianModss — Feel free to fork and customise!
