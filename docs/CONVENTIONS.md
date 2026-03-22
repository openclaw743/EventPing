# Conventions — EventPing

## Code Style

- **Language:** TypeScript everywhere (strict mode)
- **Quotes:** Single quotes
- **Trailing commas:** Always (ES5)
- **Line width:** 100 chars
- **Semicolons:** Yes
- **Indentation:** 2 spaces

## Naming

| Entity | Convention | Example |
|---|---|---|
| Files (components) | PascalCase | `EventCard.tsx` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Files (routes) | camelCase | `eventRoutes.ts` |
| Variables / functions | camelCase | `getEventBySlug` |
| Types / interfaces | PascalCase | `EventResponse` |
| Database tables | snake_case | `rsvps` |
| Database columns | snake_case | `created_at` |
| Environment variables | UPPER_SNAKE | `DATABASE_URL` |
| CSS classes | Tailwind utilities | — |

## Git

- **Branch naming:** `<role>/<issue-number>-<short-description>` (e.g., `developer/12-user-auth`)
- **Commits:** Conventional commits — `feat(scope): message`, `fix(scope): message`, `chore(scope): message`
- **PR titles:** Match commit convention — `feat(auth): implement Google OAuth flow`
- **PR body:** Summary, testing done, `Closes #N`
- **Merge strategy:** Squash merge to `main`

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable UI components
│   ├── pages/         # Route-level page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities, API client, constants
│   ├── types/         # Shared TypeScript types
│   └── App.tsx        # Root component with routing
├── public/
└── index.html

backend/
├── src/
│   ├── routes/        # Express route handlers
│   ├── middleware/     # Auth, validation, error handling
│   ├── services/      # Business logic
│   ├── db/            # Database connection + queries
│   ├── types/         # Shared TypeScript types
│   └── index.ts       # Server entry point
└── tsconfig.json
```

## Testing

- **Unit tests:** Vitest — colocated with source (`*.test.ts`)
- **Integration tests:** Vitest — `tests/integration/`
- **E2E tests:** Playwright — `tests/e2e/`
- **Coverage targets:** 80% backend, 70% frontend

## Error Handling

- Backend: all errors go through centralized error middleware
- Error responses: `{ error: { code: string, message: string } }`
- HTTP status codes: 400 (validation), 401 (unauth), 403 (forbidden), 404 (not found), 500 (server)

## Dependencies

- Minimize dependencies — prefer built-in Node/browser APIs
- Pin major versions in `package.json`
- Review new deps for size, maintenance status, and security
