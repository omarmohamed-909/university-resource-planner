# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] — 2026-07-15

### Added

#### Core Platform
- **Role-Based Access Control (RBAC):** Dedicated dashboards and permissions for Admins, Doctors, and Students.
- **JWT Authentication** with refresh tokens, Google OAuth 2.0 integration, and OTP email verification.
- **Real-time WebSocket** support via Socket.IO for live schedule updates and swap notifications.

#### AI Auto-Scheduler
- **Genetic Algorithm scheduler** that generates conflict-free, optimized university timetables.
- Interactive wizard with live fitness convergence chart and analytics dashboard.
- Dry-run/preview mode before committing changes to the database.

#### Schedule Management
- Full CRUD for lectures with hall, course, day, time, and semester assignment.
- **Schedule Swap System:** Doctors can request hall/time swaps; Admins review and approve/reject with conflict detection.
- Weekly, odd-week, and even-week scheduling patterns.

#### QR Attendance System
- Doctors generate time-limited QR codes for attendance sessions.
- Students scan via camera (html5-qrcode) or manual input.
- Attendance records exportable to PDF (PDFKit) and Excel (ExcelJS).

#### Hall & Course Management
- Full CRUD for lecture halls and labs with capacity, status, and availability tracking.
- Full CRUD for courses with doctor assignment and student enrollment management.

#### User Management
- Admin CRUD for all user accounts (Admin, Doctor, Student roles).
- Real-time hall availability indicator on the admin dashboard.

#### Internationalization (i18n)
- Full Arabic (RTL) and English (LTR) support via i18next.
- Dynamic font and direction switching per language.

#### UI/UX
- "Instrument Panel" design aesthetic: dark mode, glassmorphism, micro-animations.
- Collapsible sidebar with state persistence (Zustand).
- Responsive layout across admin, doctor, and student views.

#### Infrastructure
- Clean Architecture (Domain → Application → Infrastructure → Interfaces).
- Dockerfile and docker-compose for containerized deployment.
- GitHub Actions CI: install, test, build pipeline.
- Rate limiting, Helmet security headers, CORS configuration.
- Environment validation on startup (`validateEnv`).
