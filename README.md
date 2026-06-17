# todo-demo-app

A sample todo web app built to demonstrate [Inarch](https://github.com/inarch-labs/inarch) SDK instrumentation. The `main` branch is a standard CRUD app with Google auth. The `feature/ai-chat` branch adds a natural language chat interface powered by Anthropic, with every AI call logged via `@inarch/sdk`.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Auth:** NextAuth.js v5 — Google OAuth
- **DB:** SQLite + Drizzle ORM (stored in `.data/todo.db`)
- **UI:** Tailwind CSS

## Getting started

### 1. Prerequisites

- Node 18+
- A Google Cloud project with OAuth 2.0 credentials

### 2. Google Cloud setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and create a new project (or use an existing one)
2. Enable the **Google Calendar API**: APIs & Services → Enable APIs → search "Google Calendar API"
3. Create OAuth credentials: APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: **Web application**
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Copy the Client ID and Client Secret

### 3. Local setup

```bash
git clone https://github.com/inarch-labs/todo-demo-app
cd todo-demo-app
npm install

cp .env.local.example .env.local
# Edit .env.local — add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Environment variables

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret for NextAuth session encryption — generate with `npx auth secret` |
| `GOOGLE_CLIENT_ID` | OAuth 2.0 client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 client secret from Google Cloud Console |

## Branches

| Branch | Description |
|---|---|
| `main` | CRUD todo app with Google auth |
| `feature/ai-chat` | Adds AI chat UI — natural language → tasks, instrumented with `@inarch/sdk` |

## License

MIT
