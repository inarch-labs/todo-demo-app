import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'

export async function getSessionId(): Promise<string> {
  const jar = await cookies()
  let id = jar.get('session_id')?.value
  if (!id) {
    id = nanoid()
    jar.set('session_id', id, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    })
  }
  return id
}
