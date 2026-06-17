import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const todos = sqliteTable('todo', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  title: text('title').notNull(),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  dueDate: text('dueDate'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' }).notNull(),
})
