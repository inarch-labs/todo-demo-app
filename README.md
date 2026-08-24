# todo-demo-app

Reference host app for the [Inarch](https://github.com/inarch-labs/inarch) SDK — a real product (Notes, Todos, Calendar) instrumented end to end: AI-call logging, participant telemetry, the researcher panel, and a live usability study comparing two ways of creating todos via natural language.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **UI:** shadcn/ui (base-ui primitives) + Tailwind v4
- **DB:** Turso (libSQL) via Drizzle ORM — falls back to a local `file:.data/todo.db` if `TURSO_DATABASE_URL` isn't set, so the app's own data needs zero setup to try
- **Auth:** none — an anonymous `session_id` cookie scoped per browser identifies a "user"
- **AI:** Anthropic, wrapped via `@inarch/sdk`'s `createInarch()` so every call is automatically logged

## Getting started

### 1. Prerequisites

- Node 18+
- An [Anthropic API key](https://console.anthropic.com) — powers the natural-language task creation feature
- A Postgres database for Inarch's participant telemetry (clicks, timing, study events, test config). The simplest path for local dev is Postgres running on your own machine (`brew install postgresql@16 && brew services start postgresql@16 && createdb inarch_dev` on macOS) — see `inarch`'s own README for hosted alternatives (Neon, Supabase, self-hosted). There's no local-file fallback for this one; it needs a real Postgres connection.

`@inarch/sdk` depends on `better-sqlite3` (used for local AI-call logging, see below), a native Node module — `npm install` triggers a native compile unless a prebuilt binary matches your platform. If it fails, see `inarch`'s README's Prerequisites section for the toolchain you need.

### 2. Local setup

```bash
git clone https://github.com/inarch-labs/todo-demo-app
cd todo-demo-app
npm install

cp .env.local.example .env.local
# fill in the values below

npm run dev
```

Open [http://localhost:3000](http://localhost:3000). This runs against the local SQLite fallback for the app's own data by default — `npm run db:push` is only needed if you're pointing `TURSO_DATABASE_URL` at a real Turso database.

### 3. Environment variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Powers natural-language task parsing (`/api/todos/parse`) |
| `INARCH_ADMIN_SECRET` | Yes | Password for the researcher panel (`/inarch-panel`) — pick any string |
| `INARCH_TELEMETRY_DATABASE_URL` | Yes | Postgres connection string for Inarch's participant telemetry — see Prerequisites above |
| `TURSO_DATABASE_URL` | No | Hosted libSQL/Turso URL for the app's own notes/todos data. Omit for local dev — falls back to `file:.data/todo.db` |
| `TURSO_AUTH_TOKEN` | No | Only needed alongside `TURSO_DATABASE_URL` |

### 4. First run

Once the app is up:
1. Load some sample data via "Load sample data" (Notes) / "Load sample todos" (Todos).
2. Log into the researcher panel at [http://localhost:3000/inarch-panel](http://localhost:3000/inarch-panel) with `INARCH_ADMIN_SECRET` — once logged in, a floating launcher button also appears on every other page.
3. Try the natural-language task creation flow (the AI toggle on `/todos` or a note) — this is the actual thing the live study measures, and it's what exercises the Anthropic call-logging path.

## Views

| Route | Description |
|---|---|
| `/notes` | Note list |
| `/notes/[id]` | Note detail — editable title/body + embedded todo list |
| `/todos` | All todos, Active/Complete tabs |
| `/calendar` | Month grid with due dates |
| `/archive` | Completed notes + todos |
| `/inarch-panel` | Researcher config/results panel (also reachable via the launcher button once logged in) |

## Branches

`main` runs the live natural-language task creation study. Two variant branches exist for the actual A/B comparison — `feature/nl-task-creation` and `feature/nl-task-creation-with-notes` — differing only in `src/lib/inarch-branch.ts` and `src/app/api/todos/parse/route.ts`, so results from both tag correctly under the same test in the panel.

See `CLAUDE.md` for the full architecture — repo layout, data model, and the zero-Inarch-logic rule this app follows (it never contains Inarch-specific business logic itself; see `inarch`'s own `CLAUDE.md` for why).

## License

MIT
