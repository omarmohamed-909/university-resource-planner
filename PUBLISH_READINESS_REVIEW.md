# QNU / SVNU — Publish Readiness Review

**Review date:** July 15, 2026
**Project:** University Resource Planner (QNU)
**Repository:** `https://github.com/omarmohamed-909/university-resource-planner.git`
**Scope:** Full-project audit for open-source publication and production deployment readiness

---

## Executive Summary

QNU is a functional MERN monorepo with clean architecture on the backend, a polished React/Vite frontend, Docker support, and a working CI pipeline. **Core functionality builds and tests pass locally** (9/9 server tests, production build succeeds).

However, the project is **not yet ready to publish as a production-grade open-source product** without addressing several gaps. The most urgent issues are:

1. **Missing legal and community files** (LICENSE, SECURITY.md, CONTRIBUTING.md)
2. **Deployment configuration bugs** (Docker `CLIENT_URL`, missing Vite build-time env injection)
3. **Oversized static assets** (3.9 MB logo degrades load time)
4. **Incomplete documentation** (outdated README, no deployment/API docs)
5. **Security and operational hardening** (dependency advisories, default secrets in Docker Compose, no `.dockerignore`)

| Area | Status | Notes |
|------|--------|-------|
| Build | ✅ Passes | Client + server build complete |
| Tests | ⚠️ Partial | 9 server unit tests; **no client tests** |
| CI | ✅ Present | Test + build on push/PR |
| Documentation | ❌ Incomplete | README outdated; no deploy/API docs |
| Legal / OSS | ❌ Missing | No LICENSE file |
| Docker / Deploy | ⚠️ Needs fixes | Wrong `CLIENT_URL`, no build args |
| Security | ⚠️ Needs hardening | npm audit findings, placeholder secrets |
| Performance | ⚠️ Needs tuning | Large logo, heavy JS chunks, polling |

---

## What Works Today

Verified during this review:

- **Monorepo scripts** at root: `npm run dev`, `npm test`, `npm run build`, `npm start`
- **Server tests:** 9/9 passing (auth refresh, conflict detection, course filtering, QR attendance)
- **Production build:** Vite client build + server static serving from `client/dist`
- **Architecture:** Clean separation (domain → application → infrastructure → interfaces)
- **Security basics:** Helmet, rate limiting, JWT auth, role middleware, Zod validation, registration restricted to `student` role
- **i18n:** Arabic + English with RTL support
- **Real-time:** Socket.IO with token auth and room authorization checks
- **Health endpoint:** `GET /api/health` reports uptime and DB state
- **CI workflow:** `.github/workflows/ci.yml` runs install, test, and build on Node 22

---

## Critical Blockers (Fix Before Publishing)

### 1. No LICENSE File

There is **no `LICENSE`** in the repository. Without an explicit license, others cannot legally know how they may use, modify, or redistribute the code.

**Action:** Add a license (commonly MIT or Apache-2.0 for university/OSS projects) and reference it in `README.md`.

---

### 2. Docker Production Misconfiguration

**`docker-compose.yml` sets the wrong client URL:**

```yaml
CLIENT_URL: http://localhost:5173
```

In the Docker/production setup, the server serves the built frontend on **port 5000**. Browsers hit `http://localhost:5000`, not `5173`. This breaks:

- CORS (Express)
- Socket.IO origin checks

**Action:** Set `CLIENT_URL` to the actual public origin (e.g. `http://localhost:5000` for local Docker, or your production domain).

**`Dockerfile` does not inject Vite environment variables at build time.**

`VITE_GOOGLE_CLIENT_ID` is baked into the client bundle during `npm run build`. The Dockerfile runs build without `ARG`/`ENV` for Vite vars, so Google OAuth will be **disabled in Docker images** even if runtime env is set.

**Action:** Add build args to the Dockerfile:

```dockerfile
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
```

And pass them in `docker-compose.yml` or your CI/CD pipeline.

---

### 3. Default Secrets in Docker Compose

```yaml
JWT_SECRET: change-this-before-production
QR_SECRET: change-this-before-production
```

These are placeholder values committed to the repo. Anyone deploying without overriding them runs with **known weak secrets**.

**Action:**

- Remove hardcoded secrets from `docker-compose.yml`; use `.env` file (gitignored) or Docker secrets
- Document required secret generation in README
- Add a startup check (already partially done via `validateEnv.js` for production)

---

### 4. Missing `.dockerignore`

There is **no `.dockerignore`**. Docker builds may copy unnecessary files (local `node_modules`, `.git`, editor folders, logs), causing:

- Slower builds
- Larger images
- Potential cache invalidation issues

**Action:** Add `.dockerignore` excluding at minimum: `node_modules`, `.git`, `dist`, `.env*`, `.cursor`, coverage, logs.

---

### 5. Environment File Layout Is Confusing

| File | Location | README says |
|------|----------|-------------|
| `.env.example` | **Project root** | Create `.env` in `server/` and `client/` |

The server loads env via `require('dotenv').config()` from its **working directory** (`server/`). The root `.env.example` is not automatically picked up.

There is **no `client/.env.example`** for `VITE_GOOGLE_CLIENT_ID`.

**Action:**

- Add `server/.env.example` and `client/.env.example` (or symlink/document clearly)
- Update README with exact copy commands
- Document which vars are build-time (Vite) vs runtime (Node)

---

## High-Priority Issues

### 6. README Is Outdated and Incomplete

Current README problems:

- Install instructions use **separate** `cd server` / `cd client` installs, but the project uses **npm workspaces** — `npm install` at root is the intended flow
- No **deployment** section (Docker, production env, seeding, SMTP)
- No **environment variable reference** table
- No **screenshots** or demo GIF
- Clone URL points to `university-resource-planner` while package names use `qnu` / DB uses `svnu`
- Prerequisites say Node 16+; CI uses **Node 22**

**Action:** Rewrite README with: workspace install, env setup, seed data, Docker deploy, production checklist, and naming glossary.

---

### 7. Oversized Logo Asset (Performance)

`client/public/qnu-logo.png` is **~3.9 MB**. It is used as:

- Favicon (`index.html`)
- Brand logo (`QnuLogo.jsx`)

This significantly hurts first load, especially on mobile/university networks.

**Action:**

- Compress to WebP/optimized PNG (< 100 KB for UI, separate small favicon)
- Consider SVG for the logo component
- Add responsive `srcset` or multiple sizes

---

### 8. npm Security Advisories

```
uuid <11.1.1 (moderate) — via exceljs
2 moderate severity vulnerabilities
```

**Action:** Evaluate upgrading `exceljs` or pinning/overriding `uuid`; run `npm audit` in CI and fail on high/critical.

---

### 9. Email / OTP Will Not Work in Production Without SMTP

`EmailService` falls back to **mock logging** when `SMTP_HOST` is unset:

```js
console.log(`[EmailService] Mock email sent to: ${to}, subject: ${subject}`);
```

OTP registration and password recovery flows **silently succeed on the API** but never deliver email.

**Action:**

- Document SMTP as **required** for production OTP
- Consider failing startup in production if SMTP is missing and OTP is enabled
- Surface a clear UI error when email is not configured

---

### 10. Debug Logging Left in Production Code

`server/application/useCases/swap/createSwapRequestUseCase.js` contains:

```js
console.log(`[SWAP DEBUG] Course Doctor: ...`);
```

**Action:** Remove or gate behind `NODE_ENV !== 'production'`.

---

### 11. Password Policy Mismatch (Client vs Server)

| Layer | Rule |
|-------|------|
| Register UI | Shows strength meter requiring 8 chars, uppercase, digit |
| Register submit | Only checks `password.length < 6` |
| Server validator | `min(6)` only |

Users see a strong-password UI but can register with weak passwords.

**Action:** Align client validation and server Zod schema (recommend min 8 + complexity rules).

---

### 12. No Frontend Tests or Linting

- **Zero** client-side tests
- **No** ESLint, Prettier, or EditorConfig
- CI does not lint or type-check the client

**Action:** Add at minimum:

- ESLint + React plugin
- A few smoke tests (auth flow, routing) with Vitest
- Lint step in CI

---

## Medium-Priority Issues

### 13. Naming Inconsistency Across the Project

| Context | Name |
|---------|------|
| GitHub repo | `university-resource-planner` |
| npm packages | `qnu`, `qnu-server`, `qnu-client` |
| MongoDB database | `svnu` |
| `.env.example` DB URI | `mongodb://localhost:27017/svnu` |
| Product doc | QNU / SVNU / South Valley National University |

**Action:** Pick canonical branding and document aliases in README to avoid contributor confusion.

---

### 14. `PRODUCT.md` Claims vs Implementation

`client/PRODUCT.md` states the UI is built on **Radix UI / shadcn/ui**. The codebase uses **custom components** (`Button.jsx`, `Modal.jsx`, etc.) without Radix or shadcn dependencies.

**Action:** Update `PRODUCT.md` to reflect actual stack, or adopt the claimed primitives.

---

### 15. i18n Translation Gaps

Arabic locale is missing **6 plural keys** present in English:

- `admin.schedules.lectureCount_plural`
- `admin.courses.creditHours_plural`
- `admin.courses.enrolled_plural`
- `admin.autoSchedule.lectureCount_plural`
- `student.schedule.lectureCount_plural`
- `attendance.presentCount_plural`

**Action:** Add missing Arabic plural forms; add a CI check for key parity.

---

### 16. Schedule Auto-Generate: Data Integrity Risk

`autoGenerateScheduleUseCase.js` deletes existing semester schedules then inserts new ones **without a MongoDB transaction** (comment notes replica set is required for transactions). A failure mid-insert could leave a semester partially scheduled.

**Action:** Use transactions with replica set in production, or implement compensating rollback logic.

---

### 17. Genetic Scheduler Event-Loop Impact

The GA yields every 5 generations via `setImmediate`, but large `populationSize` / `maxGenerations` can still cause **multi-second latency** on a single Node process, affecting all concurrent requests.

**Action:**

- Consider `worker_threads` for GA runs
- Enforce stricter rate limits (already has `autoGenerateLimiter`)
- Add job queue for long-running scheduling

---

### 18. Halls Page Polls All Schedules Every 60 Seconds

`_useHallAvailability.js` calls `GET /api/schedules` (all schedules) on an interval for every admin viewing the halls page.

**Action:** Add a dedicated endpoint like `GET /api/schedules/today` or filter by date/hall server-side.

---

### 19. Large JavaScript Bundles

Production build highlights:

| Chunk | Gzip size | Likely cause |
|-------|-----------|--------------|
| `HallsPage-*.js` | 45.49 kB | `framer-motion` on admin halls |
| `esm-*.js` | 108.11 kB | `html5-qrcode` (student attendance) |
| `main-*.js` | 103.69 kB | Core app + routing |

**Action:** Lazy-load `html5-qrcode` only on attendance scan route; audit `framer-motion` usage on halls page.

---

### 20. No `trust proxy` for Reverse Proxy Deployments

Behind Nginx, Caddy, or a cloud load balancer, `express-rate-limit` and client IP logging may be incorrect without:

```js
app.set('trust proxy', 1);
```

**Action:** Add configurable `TRUST_PROXY` env and document for production deploys.

---

### 21. No Refresh Token Revocation / Logout API

Logout is client-only (clears `localStorage`). Stolen refresh tokens remain valid until expiry.

**Action:** Optional but recommended for production: token blacklist or rotation store in MongoDB.

---

### 22. `package.json` Metadata Missing

Root and workspace `package.json` files lack:

- `description`
- `author`
- `repository`
- `license`
- `keywords`
- `engines`

**Action:** Add metadata for npm/GitHub discovery (even with `"private": true`).

---

## Low-Priority / Nice-to-Have

| Item | Status |
|------|--------|
| `CHANGELOG.md` | Missing |
| `CONTRIBUTING.md` | Missing |
| `SECURITY.md` | Missing |
| `CODEOWNERS` | Missing |
| API documentation (OpenAPI/Swagger) | Missing |
| Screenshots / demo video in README | Missing |
| `robots.txt` / `sitemap.xml` | Missing |
| PWA manifest / service worker | Missing |
| Client `preview` deploy docs | Missing |
| MongoDB backup / restore guide | Missing |
| Monitoring (Sentry, structured logging) | Missing |
| E2E tests (Playwright/Cypress) | Missing |
| Dependabot / Renovate config | Missing |
| Release tagging process | Missing |

---

## Security Review Summary

### Strengths

- Helmet security headers (with COOP disabled for Google OAuth popup — intentional)
- Rate limiting on general, auth, and auto-generate routes
- JWT + refresh token flow with tests
- Role-based route protection (`roleMiddleware`)
- Public registration locked to `student` only
- Socket room join validates user ID against token
- Production error messages sanitized
- Env validation on startup (`validateEnv.js`)
- `.env` files gitignored

### Risks

| Risk | Severity | Location |
|------|----------|----------|
| Placeholder secrets in docker-compose | High | `docker-compose.yml` |
| Mock email silently "succeeds" | High | `emailService.js` |
| Weak password allowed (6 chars) | Medium | `authValidator.js` |
| `uuid` vulnerability via exceljs | Medium | `server/package.json` |
| Debug log leaks IDs in swaps | Low | `createSwapRequestUseCase.js` |
| Seed script hardcoded passwords | Low (dev only) | `seed.js` — must not run in prod |
| Demo quick-login only in DEV | OK | `LoginPage.jsx` — correctly gated |
| No refresh token revocation | Medium | Auth layer |
| 3.9 MB logo — DoS on slow networks | Low | `client/public/qnu-logo.png` |

---

## Testing Coverage Gaps

### Covered (server)

- Auth refresh token flow
- Schedule conflict detection (hall overlap, odd/even patterns)
- Course role-based filtering
- QR code signing, tampering, expiry

### Not covered

- HTTP integration / API route tests
- MongoDB repository tests (no test DB in CI)
- Genetic scheduler algorithm tests
- Swap request workflow
- Attendance check-in flow
- Export (PDF/Excel)
- Socket.IO events
- **Entire React frontend**
- Docker image smoke test
- i18n key parity

**Recommendation:** Add supertest-based API tests with mongodb-memory-server; add Vitest + React Testing Library for critical UI paths.

---

## DevOps & Deployment Checklist

### Before first public release

- [ ] Add `LICENSE`
- [ ] Add `SECURITY.md` with disclosure contact
- [ ] Add `CONTRIBUTING.md`
- [ ] Fix `docker-compose.yml` `CLIENT_URL`
- [ ] Add `.dockerignore`
- [ ] Add Vite build args to `Dockerfile`
- [ ] Split/env-document `server/.env.example` and `client/.env.example`
- [ ] Optimize `qnu-logo.png`
- [ ] Remove `[SWAP DEBUG]` logging
- [ ] Align password validation client/server
- [ ] Update README (install, deploy, env table, screenshots)
- [ ] Resolve `npm audit` moderate issues
- [ ] Document SMTP requirement for OTP
- [ ] Add Arabic plural i18n keys
- [ ] Add ESLint + client test scaffold
- [ ] Add `trust proxy` for production reverse proxy

### Production deployment steps (document in README)

1. Set strong `JWT_SECRET`, `QR_SECRET` (32+ random bytes each)
2. Set `CLIENT_URL` to production HTTPS origin
3. Configure MongoDB (prefer replica set for transactions)
4. Configure SMTP for email/OTP
5. Set `GOOGLE_CLIENT_ID` (server) and `VITE_GOOGLE_CLIENT_ID` (build-time)
6. Run `npm ci && npm run build`
7. Run `npm run seed` **once** in staging only — never with default passwords in production
8. Set `NODE_ENV=production`
9. Place reverse proxy with TLS in front of port 5000
10. Verify `GET /api/health` returns `status: "ok"` with `db: "connected"`

---

## CI Pipeline Assessment

**Current (`.github/workflows/ci.yml`):**

```yaml
- npm ci
- npm test      # server only
- npm run build
```

**Recommended additions:**

```yaml
- npm audit --audit-level=high
- npm run lint        # after adding ESLint
- client unit tests   # after adding Vitest
- docker build smoke test
- i18n key parity check
```

---

## Project Structure Reference

```
svnu/
├── client/                 # React + Vite frontend
│   ├── public/             # Static assets (qnu-logo.png)
│   ├── src/
│   │   ├── infrastructure/ # axios, socket
│   │   └── ui/             # pages, components, stores, i18n
│   └── PRODUCT.md          # Design/product spec
├── server/                 # Express API (clean architecture)
│   ├── application/        # use cases
│   ├── domain/             # entities, services (GeneticScheduler)
│   ├── infrastructure/     # MongoDB, email, socket, QR, export
│   ├── interfaces/         # routes, controllers, validators
│   ├── tests/              # Node native test runner (4 files, 9 tests)
│   └── seed.js             # Dev seed data
├── .github/workflows/ci.yml
├── .env.example            # Root only — needs split
├── docker-compose.yml
├── Dockerfile
└── package.json            # npm workspaces root
```

---

## Recommended Publish Order

1. **Legal & docs** — LICENSE, README rewrite, CONTRIBUTING, SECURITY
2. **Deploy fixes** — Docker env, `.dockerignore`, env examples
3. **Security hardening** — secrets, password policy, audit fixes, remove debug logs
4. **Performance** — logo optimization, bundle splitting
5. **Quality** — linting, more tests, CI expansion
6. **Polish** — screenshots, API docs, changelog, first tagged release (`v1.0.0`)

---

## Verification Commands Run During Review

```powershell
Set-Location o:\svnu
node --version          # v22.20.0
npm --version           # 10.9.3
npm test                # 9/9 passed
npm run build           # succeeded
npm audit --omit=dev    # 2 moderate (uuid/exceljs)
```

---

## Conclusion

QNU is a **strong foundation** with real features (AI scheduling, QR attendance, RBAC, real-time updates) and a maintainable backend architecture. It is suitable for **internal/staging demos** today.

For **public open-source publication and production deployment**, treat the items in **Critical Blockers** and **High-Priority Issues** as mandatory. The **Medium-Priority** items should be scheduled before advertising the project as production-ready.

Estimated effort to reach publish-ready state: **2–5 days** for a focused pass on blockers + docs; additional **1–2 weeks** for tests, linting, and performance polish.
