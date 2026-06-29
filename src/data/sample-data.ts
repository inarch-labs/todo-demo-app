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
  // --- Professional notes ---
  {
    title: 'Q3 2026 Goals & OKRs',
    body: `Objective: Ship Inarch to public beta and get 50 active integrators by end of September.

Key results:
- KR1: Publish @inarch/sdk to npm with >90% test coverage by July 11
- KR2: Onboard 10 design partners (devs actively using the SDK in a real project) by August 1
- KR3: Launch hosted call log viewer at inarch.dev by August 15
- KR4: 50 weekly active integrators by September 30

Secondary objective: Establish content presence to drive organic signups.
- Write 2 technical blog posts per month (topics: AI observability, prompt A/B testing)
- Post SDK release announcement on HN and dev.to

Risks:
- Streaming support (Layer 2) is a blocker for teams using streamed responses — must ship by July 18 or we lose design partners who need it
- Hosted viewer requires a backend infra decision (Fly.io vs Vercel + PlanetScale)`,
    todos: [
      { title: 'Draft KR tracking spreadsheet for Q3', dueDate: '2026-07-03' },
      { title: 'Schedule monthly OKR check-ins on calendar', dueDate: '2026-07-05' },
      { title: 'Write HN launch post draft', dueDate: '2026-07-20' },
    ],
  },
  {
    title: 'Design Partner Outreach — Notes',
    body: `Tracking conversations with potential design partners (developers integrating @inarch/sdk into real projects).

Active conversations:
- Maya Chen (Lattice, AI performance reviews team) — interested in prompt cost visibility. Follow up July 3 with streaming support ETA.
- Daniel Park (Retool, internal AI tools) — wants branch diffing before committing. Shared architecture doc June 28.
- Priya Nair (independent consultant, runs AI evals for clients) — very interested in the branch comparison feature. Demoed on June 25, wants a sandbox by July 10.

Cold outreach targets:
- Engineers posting about Anthropic SDK usage on Twitter/X
- Teams building on Vercel AI SDK (they're wrapping clients already, Inarch fits naturally)

Notes from Maya's call (June 27):
- Their team runs 200k+ Anthropic calls/day; local SQLite won't scale for them
- They need team-level aggregation, not just session-level
- Might be worth creating an "Inarch Cloud" mode that streams logs to a hosted backend`,
    todos: [
      { title: 'Follow up with Maya Chen re: streaming ETA', dueDate: '2026-07-03' },
      { title: 'Send sandbox access to Priya Nair', dueDate: '2026-07-10' },
      { title: 'Draft Inarch Cloud architecture one-pager', dueDate: '2026-07-12' },
    ],
  },
  {
    title: 'Hiring — Senior Full-Stack Engineer',
    body: `Opening a role for a senior full-stack engineer to own the hosted viewer and cloud infrastructure.

Role requirements:
- Strong TypeScript / Node.js background
- Experience with SQLite or similar embedded DBs a plus
- Comfortable working in a very early-stage environment (0→1)
- Ideally has built developer tooling or observability products before

Pipeline (as of June 29):
- Alex Torres — strong frontend, less infra experience. Passed first interview. Technical screen scheduled July 7.
- Rena Walsh — ex-Datadog, excellent infra chops, wants equity conversation before proceeding. Reach out again July 8.
- Two more resumes from referrals, not yet reviewed.

Interview loop: 1 intro call → technical screen (take-home + 1hr review) → founder call → offer.
Target start date: August 4.`,
    todos: [
      { title: 'Schedule technical screen with Alex Torres', dueDate: '2026-07-07' },
      { title: 'Reach back out to Rena Walsh', dueDate: '2026-07-08' },
      { title: 'Review two pending referral resumes', dueDate: '2026-07-04' },
    ],
  },
  {
    title: 'Hosted Call Log Viewer — Product Spec',
    body: `The hosted viewer is the missing piece that makes Inarch useful beyond local development. Right now SDK users have a .inarch/calls.db file with no way to query it from a browser.

MVP scope:
- Integrators push call records to inarch.dev via a lightweight flush() call or background sync
- Dashboard shows: calls over time, cost by branch, latency distribution, full request/response for any call
- Branch comparison view: select two branches, compare average tokens, cost, latency, and sample outputs side by side
- Auth: API key per project (no OAuth needed for MVP)

Out of scope for MVP:
- Team collaboration / shared dashboards
- Alerting
- Custom retention policies

Tech decisions still open:
- Storage: PlanetScale (MySQL) vs Turso (SQLite, familiar from todo-demo-app) vs Neon (Postgres)
- Hosting: Vercel (already know it) vs Fly.io (better for persistent connections)
- Should the viewer be a separate Next.js app or a route inside inarch.dev?`,
    todos: [
      { title: 'Choose DB for hosted viewer (Turso vs Neon)', dueDate: '2026-07-05' },
      { title: 'Wireframe branch comparison view', dueDate: '2026-07-08' },
      { title: 'Spike Turso remote sync from local calls.db', dueDate: '2026-07-11' },
    ],
  },
  {
    title: 'Technical Blog Post Ideas',
    body: `Content to build credibility and drive organic signups for Inarch.

Drafted / in progress:
- "Why I wrapped my Anthropic client in a Proxy" — personal story of building @inarch/sdk, explains the intercept pattern. ~60% written. Targeting dev.to + HN.
- "A/B testing prompts without a framework" — how branch labels in Inarch let you compare prompts empirically. Needs a worked example with real data.

Ideas not yet started:
- "What I learned logging 10,000 Claude API calls" (need real data first — maybe use design partner data with permission)
- "SQLite as an observability store" — why embedded DB works great for local AI call logs
- "Token cost by model: Haiku vs Sonnet vs Opus on real tasks" — could use Inarch's own call logs as source

Publishing targets: dev.to, personal blog, HN Show, cross-post to Substack if traction is there.`,
    todos: [
      { title: 'Finish first draft of Proxy blog post', dueDate: '2026-07-09' },
      { title: 'Add worked example to A/B testing post', dueDate: '2026-07-15' },
    ],
  },
  {
    title: 'Weekly Standup Log',
    body: `Running log of weekly priorities and blockers. Most recent first.

Week of June 30:
- Focus: feature branches for todo-demo-app (NL task creation, with/without notes context), more seed data for realistic evaluation
- Blocked: streaming support still not started — need to unblock before July 18 design partner deadline
- Done last week: three-view app redesign, Turso migration, merged open PRs

Week of June 23:
- Focus: repo cleanup, CLAUDE.md files, removing Clerk auth from demo app
- Done: anonymous session cookie replacing Clerk, shadcn/ui migration, responsive notes layout

Week of June 16:
- Focus: initial SDK scaffold, SQLite logging, Anthropic adapter
- Done: Layer 1 complete — createInarch().wrap(client) logs every call. Smoke test passing.

Recurring blockers:
- Need to decide on hosted viewer infra before August 15 deadline
- No marketing help yet — blog posts and outreach all on one person`,
    todos: [
      { title: 'Start streaming support implementation (Layer 2)', dueDate: '2026-07-07' },
      { title: 'Add standup note for week of July 7', dueDate: '2026-07-07' },
    ],
  },
  // --- Personal notes ---
  {
    title: 'Apartment — Move & Setup Checklist',
    body: `Moving into the new place on August 1. Current apartment lease ends July 31.

Things to sort before move-in:
- Confirm move-in time with building manager (Sarah at the front desk)
- Rent a moving truck or book movers — get quote from Two Men and a Truck by July 10
- Transfer utilities: electricity (PG&E), internet (Comcast, port existing account)
- Update address: bank, USPS, subscriptions

Furniture still needed:
- Desk and chair for the office corner — looking at the IKEA Bekant or Uplift standing desk
- Shelving for the living room — IKEA BILLY is fine, or something from Crate & Barrel if budget allows
- Bedroom rug — target size 8x10

Things I want to do first week in:
- Deep clean before boxes arrive
- Set up office first so I can work immediately
- Figure out parking situation (building has one spot, need guest parking passes)`,
    todos: [
      { title: 'Get moving truck quote from Two Men and a Truck', dueDate: '2026-07-10' },
      { title: 'Call Comcast to transfer internet service', dueDate: '2026-07-15' },
      { title: 'Order standing desk — Uplift or IKEA Bekant', dueDate: '2026-07-12' },
      { title: 'Confirm move-in time with Sarah at front desk', dueDate: '2026-07-05' },
    ],
  },
  {
    title: 'Health & Fitness — Current Routine',
    body: `Trying to stay consistent through a busy work period. Current setup:

Gym: 24 Hour Fitness on Market St. Go Mon / Wed / Fri mornings before work, ~7:00am.
Current program: 5/3/1 (4th cycle). Main lifts: squat, bench, deadlift, press.
Supplemental: lat pulldowns, dumbbell rows, some face pulls for shoulder health.

Running: trying to add a 30-min easy run on Saturdays. Not consistent yet.

Diet: roughly tracking calories, targeting ~2,800/day. Eating more protein (aim for 180g). Prepping lunches Sunday helps a lot.

Goals for the next 3 months:
- Hit a 315 squat (currently at 285)
- Run a 5K without stopping — will enter the SF 5K in September if registration is still open
- Lose ~5 lbs body fat while keeping lifts progressing

Struggles:
- Late nights working kill morning gym motivation
- Eating well gets harder when traveling or stressed`,
    todos: [
      { title: 'Check SF 5K September registration', dueDate: '2026-07-07' },
      { title: 'Meal prep Sunday — chicken, rice, vegetables', dueDate: '2026-07-06' },
    ],
  },
  {
    title: 'Japan Trip — October 2026',
    body: `Planning a two-week trip to Japan in October. Tentative dates: October 4 – 18.

Itinerary draft:
- Tokyo (5 nights): arrive Oct 4, base in Shinjuku. Tsukiji, Shibuya, day trip to Nikko.
- Kyoto (4 nights): bullet train Oct 9. Fushimi Inari, Arashiyama, Nishiki Market.
- Osaka (3 nights): Oct 13. Dotonbori, day trip to Nara.
- Back to Tokyo (1 night): Oct 16, fly home Oct 17.

Logistics still open:
- Flights: checking Google Flights, prices are decent in late September / early October. Budget ~$900 RT.
- JR Pass: 14-day pass covers the bullet trains — buy before leaving, ~$500. Order at least 3 weeks before departure.
- Accommodation: looking at Airbnb for Tokyo (more space), capsule hotel one night for fun, traditional ryokan in Kyoto.

Things I want to do:
- Ramen at Ichiran in Tokyo
- See a sumo tournament if timing works (November basho starts Oct 12 — might catch the tail)
- Teamlab Borderless (re-opened in new location — check if tickets need advance booking)`,
    todos: [
      { title: 'Book flights to Tokyo for October', dueDate: '2026-07-15' },
      { title: 'Order JR Pass — 14 days', dueDate: '2026-09-13' },
      { title: 'Book ryokan in Kyoto', dueDate: '2026-07-20' },
      { title: 'Check Teamlab Borderless ticket availability', dueDate: '2026-07-10' },
    ],
  },
  {
    title: 'Books & Reading List',
    body: `Trying to read more consistently — goal is one book per month in 2026.

Currently reading:
- "The Pragmatic Programmer" (20th anniversary edition) — halfway through. Good refresher, some of it feels dated but the core lessons hold up.

Up next:
- "Staff Engineer" by Will Larson — relevant now that I'm thinking about what a senior engineering hire looks like
- "Zero to One" by Peter Thiel — been on the list forever, relevant now
- "The Mom Test" by Rob Fitzpatrick — short read, want to do this before design partner calls

Read in 2026 so far:
- "An Elegant Puzzle" by Will Larson — really good, a lot of the eng management advice applies even for tiny teams
- "Shape Up" by Ryan Singer — good framing for how to scope work, applying some of this to how I plan SDK features

Reading habits:
- Best time is 20-30 min before bed, or on flights
- Kindle > physical for anything I might want to highlight
- Audiobooks work for commutes but I retain less`,
    todos: [
      { title: 'Finish "The Pragmatic Programmer"', dueDate: '2026-07-31' },
      { title: 'Buy "The Mom Test" on Kindle', dueDate: '2026-07-05' },
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
