# QuizForge

Production-oriented full-stack foundation for an embeddable realtime quiz/exam module.

The frontend and backend are separate workspace apps:

- `apps/web`: React/Vite embeddable frontend module
- `apps/api`: NestJS API/realtime service foundation
- `packages/contracts`: shared DTO schemas and sanitizers

The frontend remains embeddable and can be mounted by a larger product. The backend remains a separate runtime.

## Local Setup

```bash
npm install
docker compose up -d
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run db:migrate
npm run db:seed
npm run dev
```

Run individual apps:

```bash
npm run dev -w @quizforge/api
npm run dev -w @quizforge/web
```

## Validation

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

## Demo Accounts

```text
admin@quizforge.local / demo1234
teacher@quizforge.local / demo1234
student@quizforge.local / demo1234
```

## Security Model

- Student/public/live question DTOs are sanitized through `packages/contracts`.
- Answer keys, `option.isCorrect`, explanations, and rubrics are authoring/review-only.
- Scoring happens on the backend in `apps/api/src/scoring/scoring.service.ts`.
- Browser refresh-token storage is intentionally avoided. Production should use httpOnly refresh cookies or a server session.
- RBAC guards protect instructor/admin/proctor routes.

## Windows Cleanup Note

The previous demo folder may still contain a locked partial dependency tree at:

```text
D:\Trung\Quiz\quizforge-fe-kit\node_modules
```

If Windows keeps denying automated deletion, close editors/terminals/antivirus handles and run PowerShell as Administrator:

```powershell
Remove-Item -LiteralPath "D:\Trung\Quiz\quizforge-fe-kit\node_modules" -Recurse -Force
Remove-Item -LiteralPath "D:\Trung\Quiz\quizforge-fe-kit" -Recurse -Force
```
