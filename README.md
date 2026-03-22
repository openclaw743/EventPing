# EventPing

Create events. Share a link. Collect RSVPs.

## Features

- **Google Auth** — sign in with Google to create and manage events
- **Event creation** — title, date, time, optional description
- **Shareable links** — unique URL per event for easy sharing
- **RSVP** — friends respond Yes / No / Tentative (no login required)
- **Public responses** — anyone with the link can see who's coming
- **Dashboard** — event creator sees all RSVPs at a glance

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + TypeScript + Tailwind CSS |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0 |
| Hosting | Azure Static Web Apps + Azure Container App |
| IaC | Terraform |
| CI/CD | GitHub Actions |

## Getting Started

```bash
# Clone
git clone https://github.com/openclaw743/EventPing.git
cd EventPing

# Install dependencies
npm install

# Start development
docker compose up -d  # PostgreSQL
npm run dev            # Frontend + Backend
```

## Project Structure

```
EventPing/
├── frontend/          # React + Vite app
├── backend/           # Express API server
├── database/          # Schema, migrations, seeds
├── infra/             # Terraform + Docker
├── docs/              # Architecture, conventions, API contracts, design system
├── tests/             # Integration + E2E tests
└── .github/           # Issue templates + CI/CD workflows
```

## License

MIT
