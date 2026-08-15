import { createSaveTestDefinitionHandler } from '@inarch/sdk/panel/auth'
import { getInarchStore, INARCH_TEST_ID } from '@/lib/inarch-store'

export async function POST(request: Request) {
  const store = await getInarchStore()
  const handler = createSaveTestDefinitionHandler(process.env.INARCH_ADMIN_SECRET!, store, INARCH_TEST_ID)
  return handler(request)
}
