import { NextResponse } from 'next/server'

// No notes context on this branch — no meaningful suggestions possible
export async function GET() {
  return NextResponse.json({ suggestions: [] })
}
