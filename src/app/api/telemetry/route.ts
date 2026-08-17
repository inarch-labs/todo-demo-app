import { createTelemetryHandler } from '@inarch/sdk'
import { getInarchStore } from '@/lib/inarch-store'

export const POST = createTelemetryHandler({
  recordEvents: async events => {
    const store = await getInarchStore()
    await store.recordEvents(events)
  },
  getEvents: async sessionId => {
    const store = await getInarchStore()
    return store.getEvents(sessionId)
  },
  getEventsForBranch: async branch => {
    const store = await getInarchStore()
    return store.getEventsForBranch(branch)
  },
  ensureSession: async (sessionId, type) => {
    const store = await getInarchStore()
    await store.ensureSession(sessionId, type)
  },
  getSession: async sessionId => {
    const store = await getInarchStore()
    return store.getSession(sessionId)
  },
})
