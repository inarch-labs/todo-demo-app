import type { Study } from '@inarch/sdk'

/**
 * Phase-1 usability study for the NL-task-creation comparison branches.
 * Identical content on both feature/nl-task-creation and
 * feature/nl-task-creation-with-notes — only src/lib/inarch-branch.ts
 * differs, so results are tagged with the right branch automatically.
 *
 * successState has no representation here (functions aren't part of the
 * portable Study shape) — the embedding page is responsible for calling
 * the study runtime's reportSuccess() at the moment its own success
 * condition is met. For this study: a todo was created via the AI toggle.
 */
export const nlTaskCreationStudy: Study = {
  id: 'nl-task-creation-eval',
  name: 'NL Task Creation — Maya Follow-up',
  steps: [
    {
      id: 'intro',
      type: 'instruction',
      trigger: { type: 'start' },
      content: 'Using the box below, add a task to follow up with Maya about the streaming ETA.',
      dismissible: true,
    },
    {
      id: 'nudge-30s',
      type: 'instruction',
      trigger: { type: 'elapsed', ms: 30_000 },
      skipIfSuccess: true,
      content: "Still there? Try describing the task in your own words — it doesn't need to be exact.",
      dismissible: true,
    },
    {
      id: 'rating',
      type: 'rating',
      trigger: { type: 'success' },
      questions: [
        { id: 'natural', prompt: 'How natural did that feel?', kind: 'scale', scaleMax: 5 },
        { id: 'confusion', prompt: 'Anything that confused you?', kind: 'text', optional: true },
      ],
    },
  ],
}
