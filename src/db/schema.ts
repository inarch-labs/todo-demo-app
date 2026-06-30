import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable('note', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
  updatedAt: integer('updatedAt', { mode: 'timestamp_ms' }).notNull(),
})

export const todos = sqliteTable('todo', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sortOrder').notNull().default(0),
  dueDate: text('dueDate'),
  sharedWith: text('sharedWith'), // JSON string: string[]
  relatedItems: text('relatedItems'), // JSON string: string[] (todo IDs)
  noteId: text('noteId'), // FK → notes.id, null = standalone
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
})

// Inarch usability-study tables. Deliberately stored in Turso (not the SDK's
// local .inarch/calls.db) because that file is ephemeral on serverless —
// real unmoderated participant results need durable storage. sessionId +
// branch match the values passed to createInarch(), so these rows correlate
// with CallRecords logged through the same Inarch session.

export const studyProgress = sqliteTable('studyProgress', {
  id: text('id').primaryKey(), // `${sessionId}:${studyId}`
  sessionId: text('sessionId').notNull(),
  branch: text('branch').notNull(),
  studyId: text('studyId').notNull(),
  currentStepIndex: integer('currentStepIndex').notNull().default(0),
  startedAt: integer('startedAt', { mode: 'timestamp_ms' }).notNull(),
  successAt: integer('successAt', { mode: 'timestamp_ms' }),
})

export const studyEvents = sqliteTable('studyEvent', {
  id: text('id').primaryKey(),
  sessionId: text('sessionId').notNull(),
  branch: text('branch').notNull(),
  studyId: text('studyId').notNull(),
  stepId: text('stepId'),
  name: text('name').notNull(), // instruction_shown | instruction_dismissed | success_reached | rating_submitted
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
})

export const studyRatings = sqliteTable('studyRating', {
  id: text('id').primaryKey(),
  sessionId: text('sessionId').notNull(),
  branch: text('branch').notNull(),
  studyId: text('studyId').notNull(),
  stepId: text('stepId').notNull(),
  answers: text('answers').notNull(), // JSON string: { questionId, value }[]
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
})
