// Shared between server (src/lib/inarch-store.ts) and client (inarch-panel/PanelClient.tsx)
// code, so it can't live in inarch-store.ts — that module creates a pg.Pool
// at import time, which must never end up in a client bundle.
export const INARCH_TEST_ID = 'nl-task-creation-eval'
