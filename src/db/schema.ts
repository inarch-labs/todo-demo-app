import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const todos = sqliteTable('todo', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  body: text('body'),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  dueDate: text('dueDate'),
  sharedWith: text('sharedWith'), // JSON string: string[]
  relatedItems: text('relatedItems'), // JSON string: string[] (todo IDs)
  archivedAt: integer('archivedAt', { mode: 'timestamp_ms' }),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
})
