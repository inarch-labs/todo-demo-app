import { auth, signIn, signOut } from '@/lib/auth'
import TodoApp from '@/components/TodoApp'

export default async function Home() {
  const session = await auth()

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Todo</h1>
          <p className="text-gray-500 mb-8">Sign in to manage your tasks</p>
          <form action={async () => { 'use server'; await signIn('google') }}>
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Sign in with Google
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Todo</h1>
          <div className="flex items-center gap-3">
            {session.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={session.user.image} alt="" className="w-8 h-8 rounded-full" />
            )}
            <span className="text-sm text-gray-600">{session.user?.name}</span>
            <form action={async () => { 'use server'; await signOut() }}>
              <button type="submit" className="text-sm text-gray-400 hover:text-gray-600">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <TodoApp />
    </main>
  )
}
