import { cookies } from 'next/headers'
import { isPanelSessionValid, isPanelSecretConfigured, PANEL_SESSION_COOKIE } from '@inarch/sdk/panel/auth'
import { InarchPanelLogin } from '@inarch/sdk/panel'
import { initDb, getKnownBranches } from '@inarch/sdk'
import { getInarchStore, INARCH_TEST_ID } from '@/lib/inarch-store'
import { PanelClient } from './PanelClient'

// Same default path createInarch() itself uses (see wrap.ts) — .inarch/calls.db
// is ephemeral on serverless, so this only ever returns real branches in
// local dev; a deployed panel just gets an empty list.
const CALLS_DB_PATH = process.env.VERCEL ? '/tmp/.inarch/calls.db' : '.inarch/calls.db'

function readKnownBranches(): string[] {
  try {
    return getKnownBranches(initDb(CALLS_DB_PATH))
  } catch {
    return []
  }
}

export default async function InarchPanelRoute() {
  const secret = process.env.INARCH_ADMIN_SECRET

  if (!isPanelSecretConfigured(secret)) {
    return <InarchPanelLogin endpoint="/api/inarch-panel-auth" secretConfigured={false} secretEnvVar="INARCH_ADMIN_SECRET" />
  }

  const jar = await cookies()
  const authed = isPanelSessionValid(jar.get(PANEL_SESSION_COOKIE)?.value, secret)

  if (!authed) {
    return <InarchPanelLogin endpoint="/api/inarch-panel-auth" />
  }

  const store = await getInarchStore()
  const definition = await store.getTestDefinition(INARCH_TEST_ID)
  const knownBranches = readKnownBranches()

  return <PanelClient initialDefinition={definition ?? undefined} knownBranches={knownBranches} />
}
