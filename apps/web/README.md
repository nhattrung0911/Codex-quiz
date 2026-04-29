# QuizForge FE Kit

Embeddable React + TypeScript + Vite frontend foundation for a realtime quiz and exam module.

This repository is intentionally frontend-only. It can run standalone during development, and it is structured so a larger host site can mount it later without converting it into a monolithic full-stack app.

## What is included

- Standalone Vite app plus exported `QuizForgeApp` entry component.
- Configurable API mode, API base URL, WebSocket URL, auth-provider mode, and routing basename.
- React Router routes with role guards for admin, instructor, proctor, and student flows.
- Mock API mode for local demos and a real API adapter for a future separate backend.
- Safe DTO boundary: student/live question payloads do not include `answerKey` or `option.isCorrect`.
- Realtime adapter with WebSocket implementation and mock fallback.
- Docs and OpenAPI starter for a future NestJS + PostgreSQL + Redis + Socket.IO backend.

## Run standalone

```bash
npm install
cp .env.example .env
npm run dev
```

Mock users:

```text
teacher@quizforge.local
student@quizforge.local
```

## Environment

```text
VITE_API_MODE=mock
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_AUTH_PROVIDER_MODE=embedded
VITE_ROUTING_BASENAME=/
```

- `VITE_API_MODE`: `mock` uses local fixtures; `real` calls the configured backend.
- `VITE_AUTH_PROVIDER_MODE`: `embedded` uses this module's login screen. `host` expects the larger site/backend to own auth via httpOnly cookies/session or injected short-lived access token.
- `VITE_ROUTING_BASENAME`: set this when mounting under a host route such as `/tools/quiz`.

## Embedding in a host site

```tsx
import { QuizForgeApp } from './QuizForgeApp';

export function HostQuizRoute() {
  return (
    <QuizForgeApp
      config={{
        apiMode: 'real',
        apiBaseUrl: 'https://api.example.com',
        wsUrl: 'https://api.example.com',
        authProviderMode: 'host',
        basename: '/tools/quiz'
      }}
    />
  );
}
```

The host can also pass `initialSession` if it owns identity. Production auth should use httpOnly refresh cookies or server sessions, short-lived access tokens, global logout, and backend RBAC. Do not add refresh-token rotation in browser `localStorage`.

## Scripts

```bash
npm run typecheck
npm run test
npm run lint
npm run format
npm run build
```

## Backend integration notes

The future backend should be separate from this repo. Recommended stack:

- NestJS REST API + Socket.IO gateway
- PostgreSQL for persistence
- Redis for live room state, pub/sub, and rate limiting
- Object storage for imports/media

The backend must keep scoring and answer keys authoritative. Student-facing endpoints must only return `PublicQuestion`.
