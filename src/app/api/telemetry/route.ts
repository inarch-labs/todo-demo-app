import { createTelemetryHandler } from '@inarch/sdk'
import { createPostgresStore } from '@inarch/sdk/telemetry/postgres'

const store = createPostgresStore({ connectionString: process.env.INARCH_TELEMETRY_URL! })
let migrated = false

export const POST = createTelemetryHandler({
  recordEvents: async events => {
    if (!migrated) {
      await store.migrate()
      migrated = true
    }
    await store.recordEvents(events)
  },
  getEvents: sessionId => store.getEvents(sessionId),
})
