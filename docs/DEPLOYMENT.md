# QNU — Deployment Guide

## Prerequisites

| Requirement | Minimum Version | Notes |
|---|---|---|
| Node.js | 22 | Required by `engines` field |
| MongoDB | 6+ | Replica Set recommended for transactions |
| Redis | 7+ | Schedule jobs and multi-instance Socket.IO |
| Docker | 24+ | For containerized deployments |

---

## Local Development

```bash
git clone https://github.com/omarmohamed-909/university-resource-planner.git
cd university-resource-planner
npm install
cp server/.env.example server/.env
# Edit server/.env
npm run dev
```

---

## Docker Deployment

### 1. Prepare Environment

```bash
cp .env.example .env
# Fill in all required variables (JWT_SECRET, QR_SECRET, SMTP_*, etc.)
```

### 2. Build & Run

```bash
docker compose up --build -d
```

The app is served at `http://localhost:5000`.

### 3. With Google OAuth

```bash
VITE_GOOGLE_CLIENT_ID=your-client-id docker compose up --build -d
```

---

## Cloud Deployment (Render / Railway / Fly.io)

### Environment Variables to Set

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<your Atlas connection string>
REDIS_URL=<your managed Redis connection string>
SCHEDULE_WORKER_CONCURRENCY=1
JWT_SECRET=<random 32+ char string>
QR_SECRET=<another random string>
CLIENT_URL=https://your-domain.com
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<your sendgrid key>
SMTP_FROM=noreply@your-domain.com
GOOGLE_CLIENT_ID=<optional>
TRUST_PROXY=true
```

### Nginx Reverse Proxy (self-hosted)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Set `TRUST_PROXY=true` in your server environment when using this config.

---

## MongoDB Replica Set (Required for Transactions)

The Auto-Scheduler replaces scoped schedule rows with a bulk insert. For atomicity in production, a **Replica Set** is required. Docker Compose initializes `rs0` automatically.

### Local Replica Set (Dev/Staging)
```bash
mongod --replSet rs0 --bind_ip localhost
mongo --eval "rs.initiate()"
```

### Atlas
Enable a free M10+ cluster — Replica Set is enabled by default.

> Without a Replica Set, auto-schedule still works but the replacement is not atomic.

---

## Large-data rollout

Before deploying the enrollment collection change, back up MongoDB and run:

```bash
npm run migrate:enrollments -w server
```

The migration is idempotent: it copies legacy `Course.studentIds` relations into the indexed `Enrollment` collection and updates `studentCount`.

List endpoints use server-side pagination by default (`page=1&limit=20`, maximum `limit=100`). Search is server-side for users, courses, halls, and enrollments.

Run a read-heavy smoke load test against staging with an admin token:

```bash
LOAD_TEST_URL=https://staging.example.edu/api \
LOAD_TEST_TOKEN=<admin-access-token> \
LOAD_TEST_CONCURRENCY=50 \
LOAD_TEST_DURATION_MS=60000 \
npm run test:load
```

Record p95/p99 latency, Mongo CPU/slow queries, Redis memory, and application event-loop lag. Increase application replicas behind the reverse proxy; all replicas must share the same MongoDB and Redis URLs.

---

## Health Check

```
GET /api/health
→ { "status": "ok", "uptime": 123.45 }
```

Use this endpoint for container health checks and uptime monitors.

---

## Seed Script

```bash
npm run seed -w server
```

> ⚠️ **Development only.** Creates three demo accounts:
> - `admin@svnu.edu` / `Admin123` (role: admin)
> - `ahmed@svnu.edu` / `Doctor123` (role: doctor)
> - `student@svnu.edu` / `Student123` (role: student)

**Never run in production** — the seed script does not check `NODE_ENV`.

---

## Security Checklist

- [ ] Secrets (`JWT_SECRET`, `QR_SECRET`) are ≥ 32 random characters
- [ ] `.env` files are git-ignored and never committed
- [ ] SMTP credentials are configured (OTP login fails otherwise in production)
- [ ] `TRUST_PROXY=true` only when behind a verified proxy
- [ ] TLS/HTTPS enforced at the proxy/CDN level
- [ ] `npm audit --audit-level=high` returns no issues
- [ ] Rate limiting is active (configured via `RATE_LIMIT_*` vars)
