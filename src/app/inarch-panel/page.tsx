import { cookies } from 'next/headers'
import { isPanelSessionValid, PANEL_SESSION_COOKIE } from '@inarch/sdk/panel/auth'
import { InarchPanelLogin } from '@inarch/sdk/panel'
import { getInarchStore, INARCH_TEST_ID } from '@/lib/inarch-store'
import { PanelClient } from './PanelClient'

export default async function InarchPanelRoute() {
  const jar = await cookies()
  const authed = isPanelSessionValid(jar.get(PANEL_SESSION_COOKIE)?.value, process.env.INARCH_ADMIN_SECRET!)

  if (!authed) {
    return <InarchPanelLogin endpoint="/api/inarch-panel-auth" />
  }

  const store = await getInarchStore()
  const definition = await store.getTestDefinition(INARCH_TEST_ID)

  return <PanelClient initialDefinition={definition ?? undefined} />
}
