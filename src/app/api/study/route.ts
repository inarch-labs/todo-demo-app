import { createStudyHandler } from '@inarch/sdk/study'
import { getInarchStore, INARCH_TEST_ID } from '@/lib/inarch-store'

export async function GET(request: Request) {
  const store = await getInarchStore()
  return createStudyHandler(store, INARCH_TEST_ID)(request)
}
