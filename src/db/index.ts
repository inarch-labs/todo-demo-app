import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import { mkdirSync } from 'fs'

const dbDir = path.join(process.cwd(), '.data')
mkdirSync(dbDir, { recursive: true })

const sqlite = new Database(path.join(dbDir, 'todo.db'))
sqlite.pragma('journal_mode = WAL')

export const db = drizzle(sqlite, { schema })
