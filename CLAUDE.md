# todo-demo-app

Demo app for the Inarch SDK. Shows AI observability in action across Notes, Todos, and Calendar views.

## Architecture rule: this app has ZERO Inarch logic

**Read this before touching anything that imports `@inarch/sdk`, reads/sets an Inarch cookie, or otherwise references an Inarch concept.** The entire point of Inarch is that a product installs the SDK and doesn't have to customize its own app to use it. `todo-demo-app` is a demo app — as far as Inarch is concerned, it must behave exactly like any other host app would, with no special-cased code of its own.

That means this app may only ever:
- Read raw values (cookies, env vars, config) and pass them into an SDK-exported function, getting a result back.
- Mount a route handler the SDK provides (`createTelemetryHandler`, `createPanelLoginHandler`, etc.) with zero added logic — the file should be an import and one export line.
- Supply its own config/content where the SDK's documented API asks for it (a connection string, a `Study`'s copy/questions, a session ID) — the SDK defines the shape, this app fills in its own values.

**The test before writing anything Inarch-related here: could a different host app need this exact same code?** If yes, it's SDK logic, not demo-app logic — no matter how small or "just one boolean" it looks. If you're about to add a prop, a conditional render, or any derived state to make something Inarch-related work in this app's own components (`layout.tsx`, `AppChrome.tsx`, or anywhere else) — stop. That decision belongs in the SDK, the same way `InarchLauncher` already decides its own visibility inside an iframe with zero host involvement (`window.self !== window.top`, checked entirely inside the SDK's own component).

This has drifted before — see `inarch`'s `CLAUDE.md` for the SDK-side half of this rule, and check current project state for any open work restoring this boundary before adding new Inarch-touching code.

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
