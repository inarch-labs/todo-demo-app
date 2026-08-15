import { InarchPanelPage } from '@inarch/sdk/panel/nextjs'
import { initDb, getKnownBranches } from '@inarch/sdk'
import { getInarchStore, INARCH_TEST_ID } from '@/lib/inarch-store'
import { APP_NAME } from '@/lib/app-name'

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
  const store = await getInarchStore()

  return (
    <InarchPanelPage
      secret={process.env.INARCH_ADMIN_SECRET}
      secretEnvVar="INARCH_ADMIN_SECRET"
      loginEndpoint="/api/inarch-panel-auth"
      saveEndpoint="/api/inarch-panel/save"
      store={store}
      testId={INARCH_TEST_ID}
      productName={APP_NAME}
      knownEvents={[]}
      knownBranches={readKnownBranches()}
    />
  )
}
