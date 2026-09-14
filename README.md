# QNU — University Resource Planner

<div align="center">

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node](https://img.shields.io/badge/Node.js-%3E%3D22-green)
![CI](https://github.com/omarmohamed-909/university-resource-planner/actions/workflows/ci.yml/badge.svg)

**نظام إدارة موارد جامعية متكامل لإدارة الجداول والقاعات والحضور**
*AI-powered University Resource Planner built with the MERN stack*

[Features](#-features) · [Quick Start](#-quick-start) · [Docker](#-docker) · [Environment Variables](#-environment-variables) · [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md)

</div>

---

## 📖 Overview

QNU (also referred to as **SVNU** / `university-resource-planner`) is a full-stack web platform that streamlines university resource management. It provides dedicated dashboards for **Admins**, **Doctors (Faculty)**, and **Students**, backed by a **Genetic Algorithm** auto-scheduler and a **QR-based attendance system**.

### Project Name Glossary

| Name | Usage |
|---|---|
| **QNU** | Official product name (display/branding) |
| **SVNU** | Internal codename used in older configs and emails |
| **university-resource-planner** | GitHub repository slug |

---

## ✨ Features

| Category | Feature |
|---|---|
| 🔐 Auth | JWT + Refresh Tokens, Google OAuth 2.0, OTP Email Verification |
| 🎭 RBAC | Admin / Doctor / Student dashboards with isolated permissions |
| 🤖 AI Scheduler | Genetic Algorithm that generates conflict-free timetables |
| 📅 Schedules | Full CRUD · Weekly/Odd/Even patterns · Semester support |
| 🔄 Swap Requests | Doctors request hall/time swaps · Admin approval workflow |
| 📷 QR Attendance | Camera scan or manual input · PDF + Excel export |
| 🏛️ Hall Management | Halls & Labs CRUD · Real-time availability indicator |
| 📚 Course Management | Course CRUD · Doctor assignment · Student enrollment |
| 👥 User Management | Admin CRUD for all user accounts |
| 🌐 i18n | Arabic (RTL) + English (LTR) via i18next |
| ⚡ Real-time | Socket.IO for live notifications and schedule updates |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js ≥ 22** (see `engines` in `package.json`)
- **MongoDB** (local or Atlas)
- `npm` (comes with Node.js)

### 1. Clone
```bash
git clone https://github.com/omarmohamed-909/university-resource-planner.git
cd university-resource-planner
```

### 2. Install (single command — uses npm workspaces)
```bash
npm install
```
> ✅ This installs **both** server and client dependencies. No need to `cd server && npm install` separately.

### 3. Environment Setup

```bash
# Server variables
cp server/.env.example server/.env
# Edit server/.env and fill in MongoDB URI, JWT secrets, etc.

# Client variables (build-time only)
cp client/.env.example client/.env
# Add VITE_GOOGLE_CLIENT_ID if using Google OAuth
```

See the [Environment Variables](#-environment-variables) section for the full reference.

### 4. Seed the Database *(development only)*
```bash
npm run seed -w server
```
> ⚠️ **Do not run this in production.** Creates demo users (admin/doctor/student) with default passwords.

### 5. Run in Development
```bash
npm run dev
```
This starts both the backend (`:5000`) and frontend (`:5173`) concurrently.

---

## 🐳 Docker

```bash
# 1. Copy and fill in .env at the root
cp .env.example .env
# Edit JWT_SECRET, QR_SECRET, SMTP_*, etc.

# 2. Build and start
docker compose up --build

# App is served on http://localhost:5000
```

To pass the Google OAuth client ID at build time:
```bash
VITE_GOOGLE_CLIENT_ID=your-id docker compose up --build
```

---

## 🔐 Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default: `5000`) | Server port |
| `MONGODB_URI` | ✅ Always | MongoDB connection string |
| `JWT_SECRET` | ✅ Always | JWT signing secret (min 32 chars) |
| `JWT_EXPIRES_IN` | No (default: `7d`) | JWT expiry |
| `QR_SECRET` | ✅ Production | QR code signing secret |
| `CLIENT_URL` | ✅ Production | Frontend origin for CORS |
| `SMTP_HOST` | ✅ Production | SMTP server host |
| `SMTP_PORT` | No (default: `587`) | SMTP port |
| `SMTP_USER` | ✅ Production | SMTP username |
| `SMTP_PASS` | ✅ Production | SMTP password |
| `SMTP_FROM` | No | Sender email address |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID (server-side) |
| `TRUST_PROXY` | No | Set `true` behind Nginx/Render/Railway |
| `RATE_LIMIT_MAX` | No (default: `300`) | Max requests per window |
| `AUTH_RATE_LIMIT_MAX` | No (default: `20`) | Max auth requests per window |

### Client (`client/.env`) — Build-time Only

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID for the browser |

---

## 🖥️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server + client in development |
| `npm run dev:server` | Start server only |
| `npm run dev:client` | Start client only |
| `npm test` | Run server tests |
| `npm run test -w client` | Run client tests |
| `npm run lint` | Lint server + client |
| `npm run build` | Production build (client + server) |
| `npm start` | Start production server |
| `npm run seed -w server` | Seed dev database *(dev only)* |

---

## 🏗️ Architecture

```
university-resource-planner/
├── server/                  # Node.js / Express backend
│   ├── domain/              # Entities, domain services (GeneticScheduler)
│   ├── application/         # Use cases (CQRS-style)
│   ├── infrastructure/      # MongoDB models, email, socket
│   ├── interfaces/          # Express routes, validators, middleware
│   ├── config/              # Database, DI container, env validation
│   └── tests/               # Node test runner suites
├── client/                  # React 19 + Vite frontend
│   └── src/
│       ├── ui/              # Pages, components, layouts, stores
│       └── infrastructure/  # Axios instance, i18n config
├── docs/                    # Deployment & API documentation
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## 🚢 Production Checklist

Before deploying to production, ensure:

- [ ] `JWT_SECRET` and `QR_SECRET` are long random strings (≥ 32 chars)
- [ ] `SMTP_*` variables are configured for email/OTP delivery
- [ ] `CLIENT_URL` matches your deployed frontend URL
- [ ] `MONGODB_URI` points to a replica set (required for transactions)
- [ ] `TRUST_PROXY=true` if behind a reverse proxy (Nginx, Render, Railway)
- [ ] TLS/HTTPS is terminated at the proxy level
- [ ] `npm audit --audit-level=high` passes with no issues
- [ ] Seed script is **NOT** run in production

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the full guide.

---

## 📸 Screenshots

> Place screenshots in `docs/images/` and reference them here.

---

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a Pull Request.

## 📄 License

[MIT](LICENSE) © 2026 Omar Mohamed
