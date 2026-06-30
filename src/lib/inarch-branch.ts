// Single source of truth for this checkout's Inarch branch tag — mirrors the
// branch hardcoded in src/app/api/todos/parse/route.ts. This is the one file
// expected to differ between feature/nl-task-creation and
// feature/nl-task-creation-with-notes; everything else under src/lib/studies
// is identical on both branches.
export const INARCH_BRANCH = 'nl-task-creation-with-notes'
