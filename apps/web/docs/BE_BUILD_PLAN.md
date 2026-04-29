# Backend Implementation Status

This frontend module remains separate from the backend. The backend foundation now lives in `apps/api`.

## Recommended architecture

- API gateway: NestJS REST over HTTPS.
- Realtime gateway: Socket.IO or standard WebSocket.
- Database: PostgreSQL.
- Cache and pub/sub: Redis.
- File storage: S3-compatible object storage.
- Background jobs: BullMQ for import/export, report snapshots, and proctoring processing.

## Core modules

1. Identity, organizations, groups, and RBAC
2. Question bank authoring
3. Exam builder and publishing
4. Attempt and scoring engine
5. Live room orchestration
6. Proctoring events
7. Reporting and analytics
8. Import/export pipeline

## Data model outline

- organizations
- users
- groups
- group_members
- questions
- question_options
- exams
- exam_questions
- live_rooms
- participants
- attempts
- attempt_answers
- proctor_events
- report_snapshots

## Security notes

- Keep final answer keys hidden from all student/public/live payloads.
- Use server-side scoring only.
- Use httpOnly refresh cookie or server session plus short-lived access tokens.
- Do not store refresh tokens in browser localStorage.
- Rate limit login, join, answer submission, and proctoring endpoints.
- Authorize every REST route and WebSocket event by organization, role, exam, room, and participant.
- Store live room state in Redis and persist final attempt state to PostgreSQL.
- Log proctor events with device metadata and server timestamps.

## Implemented foundation

- NestJS API app
- Auth login/logout/me with short-lived access token shape and httpOnly refresh-cookie placeholder
- RBAC guard and role metadata
- Question authoring endpoints
- Student join/attempt/answer/finish endpoints
- Server-side scoring service
- Live room endpoints and Socket.IO gateway
- Proctoring endpoints
- Reports endpoint
- Prisma schema, initial SQL migration, and seed
- Tests for sanitization, RBAC, and scoring override protection

## Remaining production backend task list

- Replace in-memory dev store with Prisma repositories in controllers/services.
- Add Redis-backed live-room adapter and Socket.IO Redis adapter.
- Add password hashing and real refresh-token/session rotation.
- Add complete OpenAPI generation from Nest routes.
- Add integration tests against PostgreSQL.
- Add import/export pipeline and richer report snapshots.
