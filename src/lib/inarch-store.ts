import { createPostgresStore } from '@inarch/sdk/telemetry/postgres'

export { INARCH_TEST_ID } from './inarch-test-id'

const store = createPostgresStore({ connectionString: process.env.INARCH_TELEMETRY_DATABASE_URL! })
let migrated: Promise<void> | null = null

export async function getInarchStore() {
  if (!migrated) migrated = store.migrate()
  await migrated
  return store
}
