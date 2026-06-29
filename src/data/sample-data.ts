export const sampleNotes = [
  {
    title: 'Getting Started with Inarch',
    body: `Inarch is an AI observability SDK for Node.js. Wrap your OpenAI or Anthropic client once and every call is automatically logged — model, tokens, latency, and full request/response — to a local SQLite file at .inarch/calls.db.

No new infrastructure required. No code changes to your AI logic. Just wrap and ship.

Install the SDK:
  npm install @inarch/sdk

Then wrap your client:
  import { createInarch } from '@inarch/sdk'
  import Anthropic from '@anthropic-ai/sdk'

  const client = createInarch({ sessionId: 'my-session' }).wrap(new Anthropic())

Every call you make through client is now logged.`,
    todos: [
      { title: 'Install @inarch/sdk in your project', dueDate: '2026-07-01' },
      { title: 'Add ANTHROPIC_API_KEY to .env.local', dueDate: '2026-07-01' },
      { title: 'Wrap your Anthropic client with createInarch().wrap()', dueDate: '2026-07-02' },
      { title: 'Make a test AI call and verify .inarch/calls.db is written', dueDate: '2026-07-02', completed: true },
    ],
  },
  {
    title: 'Inarch SDK — Architecture Notes',
    body: `Inarch works by wrapping your AI client in a JavaScript Proxy. When you call client.messages.create() (or any other method), the proxy intercepts it, records the call start time, lets the real call execute, then writes a row to SQLite with the result.

Layer 1 (current): synchronous logging to .inarch/calls.db via better-sqlite3.
Layer 2 (planned): streaming support — accumulate chunks, log on stream end.
Layer 3 (planned): branch diffing — compare calls across named experiment branches.

The sessionId groups calls by user session. The branch label lets you A/B test prompts and compare token cost and latency across branches.`,
    todos: [
      { title: 'Review Layer 1 source in packages/sdk/src', completed: true },
      { title: 'Design streaming intercept for Layer 2', dueDate: '2026-07-10' },
      { title: 'Spec out branch diffing API for Layer 3', dueDate: '2026-07-18' },
      { title: 'Write JSDoc for createInarch() and wrap()', dueDate: '2026-07-05' },
    ],
  },
  {
    title: 'Demo App Scenarios to Build',
    body: `This app (todo-demo-app) is the primary vehicle for showing Inarch in action. Each feature we add is a new scenario where the SDK can demonstrate observable AI behavior.

Planned scenarios:
1. Natural language task creation — user types "remind me to call Sarah on Friday" → AI extracts todo
2. Note summarization — long note → AI generates a one-line summary
3. Smart due date parsing — "sometime next week" → AI resolves to a specific date
4. Related item suggestions — AI scans existing todos and suggests related ones

Each scenario runs through the wrapped Anthropic client, so every call is logged and comparable via branch labels.`,
    todos: [
      { title: 'Build chat sidebar for NL task creation', dueDate: '2026-07-08' },
      { title: 'Add note summarization endpoint', dueDate: '2026-07-12' },
      { title: 'Implement smart due date parsing', dueDate: '2026-07-14' },
      { title: 'Wire up related item suggestions in todo detail', dueDate: '2026-07-16' },
    ],
  },
]

export const sampleStandaloneTodos = [
  { title: 'Publish @inarch/sdk to npm', dueDate: '2026-07-05', body: 'Run npm publish from packages/sdk. Confirm dist/ is built and README is up to date.' },
  { title: 'Set up error alerting for AI call failures', dueDate: '2026-07-08', body: 'Alert in Slack when Anthropic returns 5xx or rate limits. Log the failed call in .inarch/calls.db.' },
  { title: 'Write integration test for Anthropic adapter', dueDate: '2026-07-09', body: 'Hit a real endpoint in CI with a minimal prompt, assert the call record is written to SQLite correctly.' },
  { title: 'Deploy demo app to Vercel', dueDate: '2026-07-11', body: 'Configure Clerk production keys and Turso DB URL in Vercel env vars.' },
  { title: 'Design token cost dashboard', dueDate: '2026-07-14', body: 'Read from .inarch/calls.db and show cost by branch, model, and session over time.' },
  { title: 'Compare haiku vs sonnet on task extraction', dueDate: '2026-07-02', body: 'Run 50 NL inputs through both models. Compare accuracy and token cost using Inarch branch labels.', completed: true },
  { title: 'Scaffold @inarch/sdk package', dueDate: '2026-06-17', body: 'Types, db layer, Anthropic adapter, wrap() entry point. Typecheck passing.', completed: true },
]
