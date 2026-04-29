# QuizForge API Contract

This contract is implemented by `apps/api` and consumed by the embeddable frontend module.

## DTO boundary

Authoring/admin/review DTOs may contain answer data:

- `AuthoringQuestion.answerKey`
- `AuthoringQuestionOption.isCorrect`
- `AuthoringQuestion.explanation`

Student, public, and live DTOs must never contain answer data:

- `PublicQuestion` has no `answerKey`
- `PublicQuestionOption` has no `isCorrect`
- `PublicQuestion` has no `explanation` unless a backend enters an explicit review mode with a separate contract

## Auth

- `POST /api/v1/auth/login`
  - Body: `{ "email": string, "password": string }`
  - Response: `AuthSession`
- `GET /api/v1/auth/me`
  - Response: `AuthSession`
- `POST /api/v1/auth/logout`
  - Response: `204`

Production auth strategy:

- Use httpOnly refresh cookie or server session.
- Use short-lived access tokens for API/WebSocket authorization.
- Avoid browser-stored refresh tokens.
- Trigger global logout on invalid sessions.
- Enforce RBAC server-side for every route and WebSocket event.

## Question bank

Authoring endpoints:

- `GET /api/v1/questions?search=&tag=&difficulty=&type=`
  - Instructor/admin only.
  - Response: `PageResult<AuthoringQuestion>`
- `POST /api/v1/questions`
- `PATCH /api/v1/questions/{id}`
- `DELETE /api/v1/questions/{id}`

Question principles:

- Store immutable answer key on backend.
- Never return answer keys to student/live clients.
- Allow import/export from CSV, Moodle XML, IMS QTI in later iterations.
- Randomization should happen server-side when attempts start.

## Exams

- `GET /api/v1/exams`
- `GET /api/v1/exams/{id}`
- `POST /api/v1/exams`
- `PATCH /api/v1/exams/{id}`
- `POST /api/v1/exams/{id}/publish`

Exam status flow:

`draft -> scheduled -> live -> completed -> archived`

## Live room

- `GET /api/v1/live/exams/{id}`
- `POST /api/v1/live/exams/{id}/start`
- `POST /api/v1/live/exams/{id}/next`
- `POST /api/v1/live/exams/{id}/pause`
- `POST /api/v1/live/exams/{id}/end`

Authoritative live state must be stored in backend memory/cache such as Redis.

## Student attempt

- `POST /api/v1/student/join`
  - Body: `{ "joinCode": string, "displayName": string }`
  - Response: `{ room: LiveRoom, participant: Participant, exam: Exam, questions: PublicQuestion[] }`
- `POST /api/v1/student/exams/{id}/attempts`
- `POST /api/v1/student/attempts/{id}/answers`
- `POST /api/v1/student/attempts/{id}/finish`

Scoring must happen on backend. FE scores in mock mode are only for demo.

## Reports and proctoring

- `GET /api/v1/reports/exams/{id}`
- `GET /api/v1/proctoring/exams/{id}/events`
- `POST /api/v1/proctoring/events`

## WebSocket

Connect to: `/ws/rooms/{roomId}`

Server events:

- `room.state`
- `question.opened`
- `answer.submitted`
- `leaderboard.updated`
- `proctor.alert`
- `room.ended`

Client events:

- `room.join`
- `answer.submit`
- `proctor.event`
- `heartbeat`
