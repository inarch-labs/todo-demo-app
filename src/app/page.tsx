import { UserButton } from '@clerk/nextjs'
import { currentUser } from '@clerk/nextjs/server'
import TodoApp from '@/components/TodoApp'

export default async function Home() {
  const user = await currentUser()

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Todo</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.firstName}</span>
            <UserButton />
          </div>
        </div>
      </header>
      <TodoApp />
    </main>
  )
}
