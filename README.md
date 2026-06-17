# todo-demo-app

A sample todo web app built to demonstrate [Inarch](https://github.com/inarch-labs/inarch) SDK instrumentation. The `main` branch is a standard CRUD app with Google auth. The `feature/ai-chat` branch adds a natural language chat interface powered by Anthropic, with every AI call logged via `@inarch/sdk`.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Auth:** [Clerk](https://clerk.com) — supports Google, GitHub, email/password, magic links (no Google Cloud project needed)
- **DB:** SQLite + Drizzle ORM (stored in `.data/todo.db`)
- **UI:** Tailwind CSS

## Getting started

### 1. Prerequisites

- Node 18+
- A free [Clerk](https://clerk.com) account

### 2. Clerk setup

1. Create a free account at [clerk.com](https://clerk.com)
2. Create a new application — choose whichever sign-in methods you want (Google, GitHub, email, etc.)
3. Copy your API keys from the Clerk dashboard

### 3. Local setup

```bash
git clone https://github.com/inarch-labs/todo-demo-app
cd todo-demo-app
npm install

cp .env.local.example .env.local
# Edit .env.local — add your Clerk keys

npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Environment variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Publishable key from Clerk dashboard |
| `CLERK_SECRET_KEY` | Secret key from Clerk dashboard |

## Branches

| Branch | Description |
|---|---|
| `main` | CRUD todo app with Clerk auth |
| `feature/ai-chat` | Adds AI chat UI — natural language → tasks, instrumented with `@inarch/sdk` |

## License

MIT
