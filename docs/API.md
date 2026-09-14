# QNU — API Reference

All endpoints are prefixed with `/api`. Authentication uses `Bearer <token>` in the `Authorization` header.

**Role abbreviations:** `A` = Admin, `D` = Doctor, `S` = Student, `*` = Any authenticated user

---

## Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | None | Server health check → `{ status: "ok", uptime }` |

---

## Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new student account |
| POST | `/api/auth/login` | None | Login with email + password → `{ token, refreshToken, user }` |
| POST | `/api/auth/google` | None | Login / register via Google OAuth credential |
| POST | `/api/auth/otp/generate` | None | Send OTP to email for verification |
| POST | `/api/auth/otp/verify` | None | Verify OTP → activates account |
| POST | `/api/auth/refresh` | None | Refresh access token using refresh token |
| GET | `/api/auth/me` | `*` | Get current user profile |

### Register Body
```json
{
  "name": "Mohamed Ahmed",
  "email": "student@svnu.edu",
  "password": "Password1",
  "department": "Computer Science"
}
```

Password policy: min 8 chars, at least one uppercase letter, at least one digit.

---

## Schedules — `/api/schedules`

All require authentication.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/schedules?page=1&limit=20` | `*` | Paginated schedules (maximum 100/page) |
| GET | `/api/schedules/:id` | `*` | Get schedule by ID |
| POST | `/api/schedules` | `A` | Create a schedule entry |
| PUT | `/api/schedules/:id` | `A` | Update a schedule |
| DELETE | `/api/schedules/:id` | `A` | Delete a schedule |
| POST | `/api/schedules/auto-generate` | `A` | Queue Genetic Algorithm generation (202 when Redis is enabled) |
| GET | `/api/schedules/auto-generate/jobs/:jobId` | `A` | Read queued generation status/result |
| GET | `/api/schedules/export/pdf` | `*` | Export schedules as PDF |
| GET | `/api/schedules/export/excel` | `*` | Export schedules as Excel |
| GET | `/api/schedules/hall/:hallId` | `*` | Get schedules for a specific hall |
| GET | `/api/schedules/available` | `*` | Get currently available halls |

### Auto-Generate Body
```json
{
  "semester": "2026-1",
  "department": "Computer Science",
  "dryRun": true,
  "populationSize": 50,
  "maxGenerations": 100,
  "mutationRate": 0.1
}
```

---

## Halls — `/api/halls`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/halls?page=1&limit=20&search=` | `*` | Paginated halls |
| GET | `/api/halls/:id` | `*` | Get hall by ID |
| POST | `/api/halls` | `A` | Create a hall |
| PUT | `/api/halls/:id` | `A` | Update a hall |
| DELETE | `/api/halls/:id` | `A` | Delete a hall (fails if schedules exist) |

---

## Swap Requests — `/api/swaps`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/swaps` | `A`, `D` | List swap requests |
| POST | `/api/swaps` | `D` | Submit a swap request |
| PUT | `/api/swaps/:id` | `A` | Approve or reject a request |

### Submit Swap Body
```json
{
  "originalScheduleId": "<schedule-id>",
  "proposedHallId": "<hall-id>",
  "proposedDay": "monday",
  "proposedStartTime": "10:00",
  "proposedEndTime": "12:00",
  "reason": "Lab equipment conflict"
}
```

---

## Attendance — `/api/attendance`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/attendance` | `A`, `D` | Get attendance records |
| POST | `/api/attendance/generate-qr` | `D` | Generate QR code for a lecture session |
| POST | `/api/attendance/checkin` | `S` | Submit QR code to check in |

---

## Users — `/api/users`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | `A` | List all users |
| POST | `/api/users` | `A` | Create a user |
| PUT | `/api/users/:id` | `A` | Update a user |
| DELETE | `/api/users/:id` | `A` | Delete a user |

---

## Courses — `/api/courses`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/courses` | `*` | List all courses |
| GET | `/api/courses/:id` | `*` | Get course by ID |
| POST | `/api/courses` | `A` | Create a course |
| PUT | `/api/courses/:id` | `A` | Update a course |
| DELETE | `/api/courses/:id` | `A` | Delete a course (fails if schedules exist) |
| PUT | `/api/courses/:id/enroll` | `A` | Update student enrollment for a course |

---

## Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message"
}
```

Common HTTP status codes:
- `400` — Validation error
- `401` — Not authenticated
- `403` — Not authorized (wrong role)
- `404` — Resource not found
- `409` — Conflict (duplicate/schedule clash)
- `429` — Rate limit exceeded
- `500` — Internal server error

---

## WebSocket Events (Socket.IO)

| Event | Direction | Payload |
|---|---|---|
| `schedules:regenerated` | Server → Client | `{ semester, count, applied }` |
| `swap:requested` | Server → Client | Swap request object |
| `swap:responded` | Server → Client | `{ swapId, status, updatedSchedule }` |
