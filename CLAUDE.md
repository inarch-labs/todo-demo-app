# todo-demo-app

Demo app for the Inarch SDK. Shows AI observability in action across Notes, Todos, and Calendar views.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **UI:** shadcn/ui (base-ui primitives) + Tailwind v4
- **DB:** Turso (hosted SQLite) via Drizzle ORM
- **Auth:** None — anonymous session cookie (`session_id`) scoped per browser
- **Font:** Geist via next/font/google

## Repo layout

```
src/
  app/
    notes/          Notes list + detail pages
    todos/          Todos page
    calendar/       Calendar page
    archive/        Archive page
    api/
      notes/        GET list, POST create, GET/PATCH/DELETE [id]
      todos/        GET active, POST create/reorder, PATCH/DELETE [id], GET archived, GET calendar
      seed/         POST load sample data, DELETE wipe all
      archive/      GET completed notes + todos
  components/
    NavDrawer.tsx   Hamburger slide-in nav (left side)
    ui/             shadcn components (button, card, dialog, sheet, tabs, etc.)
  db/
    schema.ts       Drizzle schema — notes + todos tables
    index.ts        Turso client
  lib/
    notes.ts        Note queries/mutations
    todos.ts        Todo queries/mutations
    session.ts      getSessionId() — reads/sets session_id cookie
    utils.ts        cn() helper
  data/
    sample-data.ts  Inarch-themed seed notes + todos
```

## Data model

**notes** — `id, userId, title, body, completed, createdAt, updatedAt`

**todos** — `id, userId, title, body, completed, sortOrder, dueDate, sharedWith, relatedItems, noteId, createdAt`

- `noteId` nullable — null = standalone todo, set = embedded in a note
- `userId` is the anonymous session cookie value, not a real user ID

## Views

| Route | Description |
|---|---|
| `/notes` | Note list. Floating search + pencil FAB on mobile; inline controls on desktop |
| `/notes/[id]` | Note detail — editable title/body + embedded todo list |
| `/todos` | All todos (standalone + note-linked). Active/Complete tabs, drag-to-reorder |
| `/calendar` | Month grid. Dots on days with due dates, click → popover |
| `/archive` | Completed notes + todos, filterable by type |

## Nav

Fixed header: hamburger (left) → "To Do!" centered → spacer (right). Hamburger opens a Sheet drawer with links to all views.

## Git workflow

Always work on a feature branch. Open a PR for review before merging to main. Never commit directly to main.

## Local dev

```bash
npm run dev -- --hostname 0.0.0.0   # binds to all interfaces for mobile testing
npm run db:push                      # push schema changes to Turso
```

Phone access on same WiFi: `http://192.168.86.30:3000`
`allowedDevOrigins` is configured in `next.config.ts` for this IP.

## Env vars

```
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
```

## Next steps

- Wire up Inarch SDK for AI scenarios (NL task creation, note summarization)
- Deploy to Vercel
- Publish @inarch/sdk to npm before integrating
